import { useState } from 'react';
import Background from '../../components/layout/Background/ArcBackground';
import QuestionFrame from '../../components/quiz/QuestionFrame/QuestionFrame';
import ExamSidebar from './ExamSidebar';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';

// 더미 데이터
const QUIZ_DATA = Array.from({ length: 30 }, (_, i) => {
  if (i < 6) {
    return [
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
      {
        question: 'REST API의 특징으로 옳지 않은 것은?',
        options: [
          'Stateless한 특성을 가진다.',
          'HTTP 프로토콜을 사용한다.',
          '모든 요청은 동기적으로 처리되어야 한다.',
          'Resource 중심의 API 설계를 한다.',
        ],
        answerIndex: 2,
        explanation: 'REST API는 비동기 처리도 가능합니다.',
      },
      {
        question: '다음 중 관계형 데이터베이스(RDBMS)의 특징이 아닌 것은?',
        options: [
          '데이터를 테이블 형태로 저장한다.',
          'SQL을 사용하여 데이터를 조작한다.',
          '스키마가 유연하게 변경될 수 있다.',
          '데이터의 일관성을 보장한다.',
        ],
        answerIndex: 2,
        explanation:
          '관계형 데이터베이스는 엄격한 스키마 구조를 가지며, 변경이 어렵습니다.',
      },
      {
        question: '다음 중 JavaScript의 특징으로 옳은 것은?',
        options: [
          '컴파일 언어이다.',
          '강한 타입 시스템을 가진다.',
          '단일 스레드 기반의 비동기 처리가 가능하다.',
          '클래스 기반의 객체지향 언어이다.',
        ],
        answerIndex: 2,
        explanation:
          'JavaScript는 이벤트 루프를 통한 단일 스레드 기반의 비동기 처리를 지원합니다.',
      },
      {
        question: '다음 중 Docker의 주요 특징이 아닌 것은?',
        options: [
          '컨테이너 기반의 가상화를 제공한다.',
          '호스트 OS와 커널을 공유한다.',
          '각 컨테이너는 완전한 OS를 포함해야 한다.',
          'Dockerfile을 통해 이미지를 정의할 수 있다.',
        ],
        answerIndex: 2,
        explanation:
          'Docker 컨테이너는 전체 OS가 아닌 필요한 라이브러리와 실행 파일만 포함합니다.',
      },
    ][i];
  } else {
    return {
      question: `테스트 문제 ${i + 1}번`,
      options: [
        '보기 1번입니다.',
        '보기 2번입니다.',
        '보기 3번입니다.',
        '보기 4번입니다.',
      ],
      answerIndex: 0,
      explanation: `${i + 1}번 문제에 대한 해설입니다. 실제 문제와 해설은 추후 추가될 예정입니다.`,
    };
  }
});

type AnswerStatus = 'none' | 'correct' | 'wrong';

function QuizPage() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus[]>(
    Array(QUIZ_DATA.length).fill('none')
  );

  const handleSelect = (idx: number) => {
    if (!isSubmitted) setSelected(idx);
  };

  const handleSubmit = () => {
    if (selected !== null) {
      setIsSubmitted(true);
      setAnswerStatus((prev) => {
        const updated = [...prev];
        updated[current] = selected === q.answerIndex ? 'correct' : 'wrong';
        return updated;
      });
    }
  };

  const handleNext = () => {
    if (current < QUIZ_DATA.length - 1) {
      setCurrent((prev) => prev + 1);
      setSelected(null);
      setIsSubmitted(false);
    } else {
      alert('퀴즈가 끝났습니다!');
    }
  };

  const handleQuestionClick = (questionNumber: number) => {
    setCurrent(questionNumber - 1);
    setSelected(null);
    setIsSubmitted(false);
  };

  const q = QUIZ_DATA[current];

  return (
    <Background>
      <Header />
      <div className='w-full px-[60px] py-10'>
        <div>
          <div className='flex gap-[70px] items-stretch'>
            <div className='w-[1315px]'>
              <div className='flex items-center gap-2 mb-1'>
                <img
                  src='/src/assets/images/chart.png'
                  alt='시험 아이콘'
                  className='w-11 h-11'
                />
                <h1 className='text-2xl font-bold'>정보처리기사 필기 1회</h1>
              </div>
              <p className='text-gray-600 mb-4'>
                2024년 정보처리기사 필기 기출 문제
              </p>
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
            <ExamSidebar
              currentNumber={current + 1}
              totalQuestions={QUIZ_DATA.length}
              answeredQuestions={
                answerStatus.filter((s) => s !== 'none').length
              }
              answerStatus={answerStatus}
              mode='연습 모드'
              onQuestionClick={handleQuestionClick}
            />
          </div>
        </div>
      </div>
      <Footer />
    </Background>
  );
}

export default QuizPage;
