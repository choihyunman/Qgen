import QuestionList from '../../components/quiz/QuestionList/QuestionList';
import ExamInfo from '../../components/ExamInfo/ExamInfo';

type AnswerStatus = 'none' | 'correct' | 'wrong';

interface ExamSidebarProps {
  currentNumber: number;
  totalQuestions: number;
  answeredQuestions: number;
  answerStatus: AnswerStatus[];
  mode: string;
  onQuestionClick: (questionNumber: number) => void;
}

function ExamSidebar({
  currentNumber,
  totalQuestions,
  answeredQuestions,
  answerStatus,
  mode,
  onQuestionClick,
}: ExamSidebarProps) {
  return (
    <div className='w-[415px] h-[calc(100% + 40px)] flex flex-col gap-[30px] pt-[84px]'>
      <QuestionList
        currentNumber={currentNumber}
        totalQuestions={totalQuestions}
        answerStatus={answerStatus}
        onQuestionClick={onQuestionClick}
      />
      <ExamInfo
        totalQuestions={totalQuestions}
        answeredQuestions={answeredQuestions}
        mode={mode}
      />
    </div>
  );
}

export default ExamSidebar;
