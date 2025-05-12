from fastapi import APIRouter, UploadFile
from docling.document_converter import DocumentConverter
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import tempfile
import re

router = APIRouter()

# 텍스트 청크 분할기 설정
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=256,
    chunk_overlap=25,
    separators=["\n\n", "\n", " "]
)

# 임베딩 모델 설정
model = SentenceTransformer("intfloat/multilingual-e5-large-instruct")
dim = 1024
index = faiss.IndexFlatL2(dim)
document_store = []

def clean_text(text):
    text = "".join(text)
    text = re.sub(r"[^\w\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def extract_text(file: UploadFile, content: bytes) -> list[str]:
    if file.filename.endswith(".txt") or file.content_type == "text/plain":
        text = content.decode("utf-8", errors="ignore")
        return [text]

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

@router.post("/upload")
async def upload_file(file: UploadFile, workbook_id: str, document_id: str):
    content = await file.read()
    raw_texts = extract_text(file, content)

    if not raw_texts:
        return {"message": "텍스트 추출 실패"}

    full_text = " ".join(raw_texts)
    cleaned_text = clean_text(full_text)
    chunks = text_splitter.split_text(cleaned_text)

    if not chunks:
        return {"message": "청크 생성 실패"}

    vectors = model.encode(chunks)

    for idx, (chunk, vector) in enumerate(zip(chunks, vectors)):
        vector_np = np.array(vector).astype(np.float32).reshape(1, -1)
        index.add(vector_np)

        metadata = {
            "workbook_id": workbook_id,
            "document_id": document_id,
        }

        document_store.append({
            "id": str(len(document_store)),
            "content": chunk,
            "metadata": metadata
        })

    return {"message": f"File {file.filename} processed successfully", "chunk_count": len(chunks)}

@router.get("/search")
async def search(query: str, workbook_id: str):
    query_vector = model.encode([query])[0]
    query_vector_np = np.array(query_vector).astype(np.float32).reshape(1, -1)
    D, I = index.search(query_vector_np, k=3)

    results = []
    for i in I[0]:
        if 0 <= i < len(document_store):
            doc = document_store[i]
            if doc.get("metadata", {}).get("workbook_id") == workbook_id:
                results.append({
                    "id": doc["id"],
                    "content": doc["content"]
                })

    return {"query": query, "results": results}

@router.get("/debug/document_store")
async def debug_document_store():
    return document_store