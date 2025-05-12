type AnswerStatus = 'none' | 'correct' | 'wrong';

interface QuestionListProps {
  currentNumber: number;
  totalQuestions: number;
  answerStatus: AnswerStatus[];
  onQuestionClick: (questionNumber: number) => void;
}

function QuestionList({
  currentNumber,
  totalQuestions,
  answerStatus,
  onQuestionClick,
}: QuestionListProps) {
  return (
    <div className='bg-white rounded-[24px] p-6 shadow-sm h-[410px]'>
      <h3 className='text-lg font-bold mb-4'>문제 목록</h3>
      <div className='grid grid-cols-5 gap-3 px-2'>
        {Array.from(
          { length: Math.min(totalQuestions, 30) },
          (_, i) => i + 1
        ).map((number) => {
          let btnClass = '';
          let dotClass = '';
          if (answerStatus[number - 1] === 'correct') {
            btnClass = 'bg-green-100 text-green-700 border border-green-300';
            dotClass = 'text-green-500';
          } else if (answerStatus[number - 1] === 'wrong') {
            btnClass = 'bg-red-100 text-red-700 border border-red-300';
            dotClass = 'text-red-500';
          } else if (answerStatus[number - 1] !== 'none') {
            btnClass = 'bg-purple-100 text-purple-700 border border-purple-300';
            dotClass = 'text-purple-500';
          } else {
            btnClass =
              'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200';
          }
          return (
            <button
              key={number}
              onClick={() => onQuestionClick(number)}
              className={`aspect-square rounded-[12px] md:rounded-[6px] flex items-center justify-center text-sm md:text-xs font-medium relative transition-colors duration-200 ease-in-out min-w-[32px] cursor-pointer p-4 md:p-2 ${
                number === currentNumber
                  ? 'bg-gradient-to-r from-[#754AFF] to-[#A34BFF] text-white shadow-sm'
                  : btnClass
              }`}
            >
              {number}
              {answerStatus[number - 1] !== 'none' &&
                number !== currentNumber && (
                  <span
                    className={`absolute top-1 right-1 text-[10px] leading-none ${dotClass}`}
                  >
                    ●
                  </span>
                )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QuestionList;
