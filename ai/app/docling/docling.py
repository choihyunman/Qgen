from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import requests
import tempfile
import re
from docling.document_converter import DocumentConverter
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

router = APIRouter()

# 텍스트 청크 분할기 설정
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=256,
    chunk_overlap=25,
    separators=["\n\n", "\n", " "]
)

# 임베딩 모델 및 벡터 인덱스 초기화
model = SentenceTransformer("intfloat/multilingual-e5-large-instruct")
dim = 1024
index = faiss.IndexFlatL2(dim)
document_store = []

# ✅ camelCase 그대로 받는 Pydantic 모델
class S3UploadRequest(BaseModel):
    s3Urls: List[str]

# 텍스트 정제 함수
def clean_text(text):
    text = "".join(text)
    text = re.sub(r"[^\w\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

# PDF/TXT 콘텐츠에서 텍스트 추출 함수
def extract_text_from_bytes(content: bytes) -> list[str]:
    try:
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(content)
            temp_file_path = temp_file.name

        converter = DocumentConverter()
        result = converter.convert(temp_file_path)
        result_dict = result.document.export_to_dict()
        extracted_texts = result_dict.get("texts", [])

        if not extracted_texts:
            print("텍스트 없음: OCR 생략하고 무시합니다.")
            return []

        return [item.get("text", "") for item in extracted_texts if "text" in item]

    except Exception as e:
        print(f"문서 변환 오류: {e}")
        return []

# S3 링크 기반 업로드 + 검색 통합 API
@router.post("/search")
async def search_with_uploaded_file(request: S3UploadRequest, indexId: str = "questions"):
    index_path = f"./data/indexes/{indexId}.faiss"
    doc_path = f"./data/indexes/{indexId}.json"

    if not os.path.exists(index_path) or not os.path.exists(doc_path):
        raise HTTPException(status_code=404, detail=f"Index '{indexId}' not found")

    index = faiss.read_index(index_path)

    with open(doc_path, "r", encoding="utf-8") as f:
        document_store = json.load(f)

    all_chunks = []
    for url in request.s3Urls:
        try:
            res = requests.get(url)
            res.raise_for_status()
            content = res.content
            raw_texts = extract_text_from_bytes(content)
            cleaned = clean_text(" ".join(raw_texts))
            chunks = text_splitter.split_text(cleaned)
            all_chunks.extend(chunks)
        except Exception as e:
            continue

    if not all_chunks:
        return {"message": "사용자 파일에서 텍스트 추출 실패"}

    query_text = " ".join(all_chunks)
    query_vec = model.encode([query_text])[0]
    query_np = np.array(query_vec).astype(np.float32).reshape(1, -1)

    D, I = index.search(query_np, k=3)

    results = []
    for i in I[0]:
        if 0 <= i < len(document_store):
            results.append({
                "content": document_store[i]
            })

    return {
        "message": f"Index '{indexId}'에서 검색 완료",
        "results": results
    }

