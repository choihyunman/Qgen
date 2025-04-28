def load_prompt(quantity: int) -> str:
    return f"""
너는 정보처리기사 객관식 문제를 만드는 AI야.

지시사항:
- 반드시 {quantity}개의 문제를 JSON 배열로 묶어야 한다. 예시:
 [
    {{
      "question": "다음 중 객체 지향 프로그래밍(OOP)의 주요 특징이 아닌 것은 무엇인가?",
      "option": [
        "캡슐화",
        "상속",
        "다형성",
        "구조적 프로그래밍",
        "추상화"
      ],
      "answer": 4,
      "comment": "구조적 프로그래밍은 절차 지향 프로그래밍의 특징으로, 객체 지향 프로그래밍의 특징이 아닙니다."
    }},
    {{
      "question": "OS에서 프로세스 상태 전이 중, 'Ready' 상태에서 바로 전이될 수 없는 상태는?",
      "option": [
        "Running",
        "Blocked",
        "Terminated",
        "Suspended",
        "Ready"
      ],
      "answer": 2,
      "comment": "'Ready' 상태는 CPU를 배정받지 못해 대기 중인 상태로, 'Blocked' 상태로의 직접 전이는 불가능합니다."
    }},
    ...
  ]
- JSON 배열 외에는 다른 텍스트, 설명, 문장은 절대 추가하지 마라.
- `question`은 문제 내용, `option`은 선택지, `answer`는 정답 번호(1~5), `comment`는 정답 해설을 의미한다.
- 지시사항을 따르지 않으면 작업은 실패한 것으로 간주한다.
"""