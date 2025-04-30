import QuestionList from './QuestionList';
import ExamInfo from './ExamInfo';

interface ExamSidebarProps {
  currentNumber: number;
  totalQuestions: number;
  answeredQuestions: number;
  mode: string;
  onQuestionClick: (questionNumber: number) => void;
}

function ExamSidebar({
  currentNumber,
  totalQuestions,
  answeredQuestions,
  mode,
  onQuestionClick,
}: ExamSidebarProps) {
  return (
    <div className='w-[320px] flex flex-col gap-[40px] pt-[84px]'>
      <QuestionList
        currentNumber={currentNumber}
        totalQuestions={totalQuestions}
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
