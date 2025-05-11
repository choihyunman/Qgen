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

MAX_RETRY = 3  # 최대 재시도 횟수

@router.post("/chatgpt/{testPaperId}/", status_code=status.HTTP_200_OK)
async def chatgpt_api(testPaperId: int, request: Request):
    client = OpenAI(api_key=env.str("OPENAI_API_KEY"))
    total = request.choiceAns + request.OXAns + request.shortAns

    for attempt in range(1, MAX_RETRY + 1):
        try:
            logger.info(f"[시도 {attempt}] 요청: testPaperId={testPaperId}, 총문제={total}")

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
                raise ValueError("응답이 JSON 형식이 아님")

            if not isinstance(parsed, list):
                raise ValueError("응답이 리스트 형식이 아님")

            if len(parsed) != total:
                raise ValueError(f"요청 문제 수({total})와 응답 문제 수({len(parsed)})가 다름")

            # ✅ 문제 유형별 개수 검증 로직 추가
            type_counts = {
                "TYPE_CHOICE": 0,
                "TYPE_OX": 0,
                "TYPE_SHORT": 0
            }

            for item in parsed:
                if not isinstance(item, dict) or "type" not in item:
                    raise ValueError("각 문제는 'type' 필드를 포함한 dict 형식이어야 합니다.")
                type_counts[item["type"]] = type_counts.get(item["type"], 0) + 1

            if type_counts["TYPE_CHOICE"] != request.choiceAns:
                raise ValueError(f"선다형 문제 수 불일치: 요청={request.choiceAns}, 응답={type_counts['TYPE_CHOICE']}")
            if type_counts["TYPE_OX"] != request.OXAns:
                raise ValueError(f"OX 문제 수 불일치: 요청={request.OXAns}, 응답={type_counts['TYPE_OX']}")
            if type_counts["TYPE_SHORT"] != request.shortAns:
                raise ValueError(f"주관식 문제 수 불일치: 요청={request.shortAns}, 응답={type_counts['TYPE_SHORT']}")

            return {"success": True, "data": parsed}

        except Exception as e:
            logger.warning(f"[시도 {attempt}] 실패: {str(e)}")
            if attempt == MAX_RETRY:
                logger.error(f"최대 재시도({MAX_RETRY}) 도달. 에러 반환.")
                raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
            continue  # 재시도