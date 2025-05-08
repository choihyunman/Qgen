from fastapi import APIRouter, status, HTTPException
from pydantic import BaseModel
from openai import OpenAI
from environs import Env
from app.problem_generator.prompt import load_prompt
import json
import logging

router = APIRouter()
env = Env()
env.read_env()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Request(BaseModel):
    choiceAns: int
    OXAns: int
    shortAns: int

@router.post("/chatgpt/{testPaperId}/", status_code=status.HTTP_200_OK)
async def chatgpt_api(testPaperId: int, request: Request):
    client = OpenAI(api_key=env.str("OPENAI_API_KEY"))
    total = request.choiceAns + request.OXAns + request.shortAns

    try:
        logger.info(f"요청: testPaperId={testPaperId}, 총문제={total}")

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": load_prompt(
                        request.choiceAns, request.OXAns, request.shortAns
                    )
                },
                {
                    "role": "user",
                    "content": f"위의 지시사항을 철저히 따르세요. 문제 수: {total}개"
                }
            ],
            temperature=1
        )

        content = response.choices[0].message.content

        try:
            parsed = json.loads(content)
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="응답이 JSON 형식이 아닙니다.")

        if not isinstance(parsed, list):
            raise HTTPException(status_code=500, detail="응답이 리스트 형식이 아닙니다.")

        if len(parsed) != total:
            raise HTTPException(
                status_code=500,
                detail=f"요청 문제 수({total})와 응답 문제 수({len(parsed)})가 다릅니다."
            )

        return {"success": True, "data": parsed}

    except Exception as e:
        logger.error(f"서버 에러: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")