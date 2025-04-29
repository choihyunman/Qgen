import { useState } from 'react';
import Background from '../components/Background';
import QuestionFrame from '../components/QuestionFrame';

// 더미 데이터
const QUIZ_DATA = [
  {
    question:
      '소프트웨어 개발 방법론 중 애자일(Agile) 방법론의 특징으로 옳지 않은 것은?',
    options: [
      '반복적이고 점진적인 개발을 강조한다.',
      '고객과의 협업을 중시한다.',
      '변화에 유연하게 대응한다.',
      '계획을 중시하여 문서화에 많은 시간을 투자한다.',
    ],
    answerIndex: 3,
    explanation: '애자일 방법론은 문서화보다는 협업과 유연성을 중시합니다.',
  },
  {
    question: '딥러닝(Deep Learning)에서 사용되는 주요 구조는?',
    options: [
      '의사결정 트리(Decision Tree)',
      '신경망(Neural Network)',
      '서포트 벡터 머신(Support Vector Machine)',
      '베이지안 네트워크(Bayesian Network)',
    ],
    answerIndex: 1,
    explanation:
      '딥러닝은 여러 층의 인공 신경망(Neural Network)을 사용하여 데이터를 학습합니다.',
  },
];

function QuizPage() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelect = (idx: number) => {
    if (!isSubmitted) setSelected(idx);
  };

  const handleSubmit = () => {
    if (selected !== null) setIsSubmitted(true);
  };

  const handleNext = () => {
    if (current < QUIZ_DATA.length - 1) {
      setCurrent((prev) => prev + 1);
      setSelected(null);
      setIsSubmitted(false);
    } else {
      // 마지막 문제 처리 (예: 결과 페이지 이동 등)
      alert('퀴즈가 끝났습니다!');
    }
  };

  const q = QUIZ_DATA[current];

  return (
    <Background>
      <div className='pt-16 flex justify-center items-start min-h-screen'>
        <QuestionFrame
          currentNumber={current + 1}
          totalNumber={QUIZ_DATA.length}
          question={q.question}
          options={q.options}
          selectedOption={selected}
          isSubmitted={isSubmitted}
          answerIndex={q.answerIndex}
          explanation={q.explanation}
          onSelect={handleSelect}
          onSubmit={handleSubmit}
          onNext={handleNext}
        />
      </div>
    </Background>
  );
}

export default QuizPage;
