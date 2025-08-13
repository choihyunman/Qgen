import io
import re
import os
import hashlib
import logging
import unicodedata
from pathlib import Path
from typing import List
from urllib.parse import urlparse, unquote_plus

import boto3
import pdfplumber
from docx import Document
from charset_normalizer import from_bytes
from botocore.exceptions import ClientError

from app.rag.util.clean_text import clean_text

logger = logging.getLogger(__name__)

# -------------------- S3 --------------------
def fetch_s3_content(s3_url: str) -> tuple[bytes, str, str]:
    """
    S3 URL -> (content_bytes, filename, content_type)
    - 버킷: S3_BUCKET_NAME 우선, 없으면 URL에서 파싱
    - 키: unquote_plus(+→공백) 후 NFC, 실패 시 NFD도 시도
    - 반환 시 S3 ContentType도 함께 전달하여 확장자 없을 때 판별에 사용
    """
    parsed = urlparse(s3_url)
    bucket = (os.getenv("S3_BUCKET_NAME") or parsed.netloc.split(".")[0]).strip().strip("/")

    # 키 후보: NFC 우선, 실패 시 NFD
    raw_key = parsed.path.lstrip("/")
    key_nfc = unicodedata.normalize("NFC", unquote_plus(raw_key))
    key_nfd = unicodedata.normalize("NFD", unquote_plus(raw_key))

    s3 = boto3.client(
        "s3",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
    )

    def _try(key: str):
        try:
            obj = s3.get_object(Bucket=bucket, Key=key)
            return obj["Body"].read(), key.rsplit("/", 1)[-1], obj.get("ContentType", "")
        except ClientError as e:
            if e.response.get("Error", {}).get("Code") == "NoSuchKey":
                return None
            raise

    print(f"[S3 TRY] bucket={bucket!r}, key={key_nfc!r}")
    r = _try(key_nfc)
    if r:
        print(f"[S3 HIT] key={key_nfc!r}")
        return r

    if key_nfd != key_nfc:
        print(f"[S3 TRY] bucket={bucket!r}, key={key_nfd!r}")
        r = _try(key_nfd)
        if r:
            print(f"[S3 HIT] key={key_nfd!r}")
            return r

    raise FileNotFoundError(f"S3 object not found. bucket={bucket!r}, tried={[key_nfc, key_nfd]!r}")

def _safe_decode_txt(content: bytes) -> str:
    try:
        return content.decode("utf-8-sig")
    except UnicodeDecodeError:
        pass
    result = from_bytes(content).best()
    return str(result) if result else content.decode("utf-8", errors="ignore")

def extract_text_from_bytes(content: bytes, filename: str = "", content_type: str = "") -> list[str]:
    """
    - 확장자가 없거나 애매하면 Content-Type으로 추론
    - text/* 는 전부 txt 처리
    """
    logger.info("[extract_text_from_bytes] 파일명=%s, 크기=%d bytes, ctype=%s",
                filename, len(content), content_type or "-")

    suffix = Path(filename).suffix.lower()
    # 확장자가 없고, Content-Type이 text/* 이면 txt로 간주
    if not suffix and content_type.startswith("text/"):
        suffix = ".txt"

    try:
        if suffix in (".txt", ".md", ".csv"):
            text = _safe_decode_txt(content)
            logger.info("TXT 추출: %d자, sha256=%s",
                        len(text), hashlib.sha256(text.encode("utf-8", "ignore")).hexdigest()[:16])
            return [text]

        if suffix == ".pdf":
            out = []
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                logger.info("PDF 페이지 수: %d", len(pdf.pages))
                for i, page in enumerate(pdf.pages, 1):
                    t = (page.extract_text() or "").strip()
                    if t:
                        out.append(re.sub(r"\s+\n", "\n", t))
            return out

        if suffix == ".docx":
            doc = Document(io.BytesIO(content))
            paras = [p.text.strip() for p in doc.paragraphs if p.text and p.text.strip()]
            logger.info("DOCX 추출 블록 수: %d", len(paras))
            return paras

        logger.warning("지원되지 않는 파일 형식: %s (ctype=%s)", suffix or "(none)", content_type or "-")
        return []

    except Exception as e:
        logger.exception("텍스트 추출 실패: %s", e)
        return []

def split_text_by_sentence(text: str, chunk_size: int = 512, overlap_sentences: int = 1) -> List[str]:
    sents = re.split(r'(?<=[.?!])\s+', text.strip())
    sents = [s.strip() for s in sents if s.strip()]
    chunks, i, n = [], 0, len(sents)

    while i < n:
        j, cur = i, []
        while j < n:
            cand = (" ".join(cur + [sents[j]])).strip()
            if len(cand) <= chunk_size:
                cur.append(sents[j]); j += 1
            else:
                break
        if not cur:
            cur, j = [sents[j]], j + 1
        chunks.append(" ".join(cur).strip())
        if j >= n:
            break
        i = max(j - overlap_sentences, i + 1)

    return [c for c in chunks if c]

def extract_chunks_from_urls(s3_urls: list[str]) -> list[str]:
    print(f"\n[extract_chunks_from_urls] 총 URL 수: {len(s3_urls)}")
    chunks: list[str] = []

    for idx, url in enumerate(s3_urls, 1):
        try:
            print(f"\n🔗 [{idx}] {url}")
            content, filename, ctype = fetch_s3_content(url)

            texts = extract_text_from_bytes(content, filename, ctype)
            print(f"원본 텍스트 블록 수: {len(texts)}")

            if not texts:
                print("  ⚠ 추출된 텍스트가 없습니다. (확장자/Content-Type 확인 필요)")
                continue

            combined = clean_text(" ".join(texts))
            print(f" 정제 후 텍스트 길이: {len(combined)}")
            if not combined.strip():
                print("  ⚠ 정제 후 내용이 비었습니다.")
                continue

            split = split_text_by_sentence(combined)
            for i, c in enumerate(split, 1):
                print(f"   청크 {i} | 길이: {len(c)} | 시작: {repr(c[:50])}")

            chunks.extend(split)

        except Exception as e:
            print(f" URL 처리 실패 {url}: {e}")

    print(f"\n 전체 최종 청크 수: {len(chunks)}")
    return chunks