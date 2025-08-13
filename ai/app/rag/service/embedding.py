import os
import httpx
from fastapi import HTTPException
from dotenv import load_dotenv
import uuid

load_dotenv()

async def get_embedding_from_gpu(texts: list[str]) -> list[list[float]]:
    call_id = uuid.uuid4().hex[:6]
    print(f"\n [호출됨 - {call_id}] get_embedding_from_gpu() :: 텍스트 수: {len(texts)}")
    base_url = os.getenv("GPU_SERVER_URL")
    print("정상 여부 확인:", repr(base_url))

    if not base_url:
        raise RuntimeError("GPU_SERVER_URL 환경 변수가 설정되어 있지 않습니다.")

    # 중첩 리스트 방지 및 중복 제거
    texts = [t for t in texts if isinstance(t, str)]
    texts = list(dict.fromkeys(texts))
    print(f" 중복 제거 후 텍스트 개수: {len(texts)}")

    full_url = f"{base_url}/embedding"

    print(f" 임베딩 요청 텍스트 개수: {len(texts)}")
    preview_count = min(5, len(texts))
    print(f"\n[임베딩 요청 미리보기 - 상위 {preview_count}개 문장]")
    for i in range(preview_count):
        print(f" {i+1}. {texts[i][:300].strip()}...\n")

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            res = await client.post(full_url, json={"texts": texts})
            res.raise_for_status()
            data = res.json()

            if "embeddings" not in data or not isinstance(data["embeddings"], list):
                raise HTTPException(status_code=500, detail="GPU 서버 응답 형식이 잘못되었습니다.")

            if len(data["embeddings"]) != len(texts):
                raise HTTPException(status_code=500, detail="응답 임베딩 수와 요청 수가 일치하지 않습니다.")

            return data["embeddings"]

    except Exception as e:
        print(f" GPU 임베딩 서버 호출 오류: {e}")
        raise HTTPException(status_code=500, detail="GPU 임베딩 실패")