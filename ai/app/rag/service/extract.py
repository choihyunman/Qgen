import io
import re
import hashlib
import logging
from pathlib import Path
from typing import List

import requests
import pdfplumber
from docx import Document
from charset_normalizer import from_bytes

from app.rag.util.clean_text import clean_text

# logger가 이 파일에서 필요하므로 없으면 추가
logger = logging.getLogger(__name__)

def split_text_by_sentence(
    text: str,
    chunk_size: int = 512,
    overlap_sentences: int = 1
) -> List[str]:
    # 1) 문장 분리 (., ?, ! + 공백 기준)
    sentences = re.split(r'(?<=[.?!])\s+', text.strip())
    sentences = [s.strip() for s in sentences if s and s.strip()]

    chunks: List[str] = []
    n = len(sentences)
    i = 0

    while i < n:
        j = i
        current = []
        # 2) i에서 시작해 chunk_size를 넘기 전까지 문장 추가
        while j < n:
            candidate = (" ".join(current + [sentences[j]])).strip()
            if len(candidate) <= chunk_size:
                current.append(sentences[j])
                j += 1
            else:
                break
        # 최소 1문장은 담기도록 보정
        if not current:
            current = [sentences[j]]
            j += 1

        chunk = " ".join(current).strip()
        if chunk:
            chunks.append(chunk)
        # 3) 다음 시작점: j에서 overlap_sentences만큼 뒤로 당겨 겹치기
        if j >= n:
            break
        i = max(j - overlap_sentences, i + 1)

    # 빈 문자열 제거
    return [c for c in chunks if c]


def _safe_decode_txt(content: bytes) -> str:
    # 1) utf-8-sig 우선
    try:
        return content.decode("utf-8-sig")
    except UnicodeDecodeError:
        pass
    # 2) 인코딩 추정
    result = from_bytes(content).best()
    return str(result) if result else content.decode("utf-8", errors="ignore")

def extract_text_from_bytes(content: bytes, filename: str = "") -> list[str]:
    logger.info("[extract_text_from_bytes] 파일명=%s, 크기=%d bytes", filename, len(content))
    texts: list[str] = []

    try:
        suffix = Path(filename).suffix.lower()

        if suffix == ".txt":
            text = _safe_decode_txt(content)
            logger.info("TXT 추출 완료: %d자, sha256=%s",
                        len(text), hashlib.sha256(text.encode("utf-8", errors="ignore")).hexdigest()[:16])
            return [text]

        elif suffix == ".pdf":
            # 임시파일 없이 BytesIO로 바로 연다
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                logger.info("PDF 페이지 수: %d", len(pdf.pages))
                for i, page in enumerate(pdf.pages, start=1):
                    try:
                        page_text = page.extract_text() or ""
                        # 간단 정규화(선택)
                        page_text = re.sub(r"\s+\n", "\n", page_text).strip()
                        if page_text:
                            digest = hashlib.sha256(page_text.encode("utf-8", errors="ignore")).hexdigest()[:16]
                            logger.debug("  📖 Page %d: %d자 | sha256=%s", i, len(page_text), digest)
                            texts.append(page_text)
                    except Exception as pe:
                        logger.warning("  📖 Page %d 추출 실패: %s", i, pe)
            return texts

        elif suffix == ".docx":
            doc = Document(io.BytesIO(content))
            # 문단 + (선택) 표 셀 텍스트 수집
            paragraphs = [p.text.strip() for p in doc.paragraphs if p.text and p.text.strip()]
            # 표 텍스트까지 필요하면 주석 해제
            # for table in doc.tables:
            #     for row in table.rows:
            #         for cell in row.cells:
            #             t = cell.text.strip()
            #             if t:
            #                 paragraphs.append(t)
            logger.info("DOCX 추출 블록 수: %d", len(paragraphs))
            return paragraphs

        else:
            logger.warning("지원되지 않는 파일 형식: %s", filename)
            return []

    except Exception as e:
        logger.exception("텍스트 추출 실패: %s", e)
        return []


def extract_chunks_from_urls(s3_urls: list[str]) -> list[str]:
    print(f"\n [extract_chunks_from_urls] 총 URL 수: {len(s3_urls)}")
    chunks = []
    for idx, url in enumerate(s3_urls):
        try:
            print(f"\n🔗 [{idx+1}] 요청 URL: {url}")
            res = requests.get(url)
            res.raise_for_status()

            filename = url.split("?")[0].split("/")[-1]
            texts = extract_text_from_bytes(res.content, filename)

            print(f"원본 텍스트 블록 수: {len(texts)}")
            for i, t in enumerate(texts):
                print(f"   └ [{i+1}] {len(t)}자 | 해시: {hash(t)} | 시작: {repr(t[:50])}")

            combined = " ".join(texts)
            cleaned = clean_text(combined)

            print(f" 정제 후 텍스트 길이: {len(cleaned)} | 해시: {hash(cleaned)}")
            split_chunks = split_text_by_sentence(cleaned)

            for i, c in enumerate(split_chunks):
                print(f"   청크 {i+1} | 길이: {len(c)} | 해시: {hash(c)} | 시작: {repr(c[:50])}")

            chunks.extend(split_chunks)
        except Exception as e:
            print(f" URL 처리 실패 {url}: {e}")
            continue

    print(f"\n 전체 최종 청크 수 (중복 제거 전): {len(chunks)}")
    return chunks