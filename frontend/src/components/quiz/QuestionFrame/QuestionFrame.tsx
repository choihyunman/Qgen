import { useRef, useEffect } from 'react';

interface QuestionFrameProps {
  currentNumber: number;
  totalNumber: number;
  question: string;
  options: string[];
  selectedOption: number | null;
  isSubmitted: boolean;
  answerIndex: number;
  explanation: string;
  onSelect: (index: number) => void;
  onSubmit: () => void;
  onNext: () => void;
}

function QuestionFrame({
  currentNumber,
  totalNumber,
  question,
  options,
  selectedOption,
  isSubmitted,
  answerIndex,
  explanation,
  onSelect,
  onSubmit,
  onNext,
}: QuestionFrameProps) {
  const activeBtnClass =
    'bg-gray-700 text-white border-gray-700 hover:bg-gray-800 cursor-pointer';
  const disabledBtnClass =
    'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed';
  const explanationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSubmitted && explanationRef.current) {
      explanationRef.current.style.maxHeight =
        explanationRef.current.scrollHeight + 'px';
      explanationRef.current.style.opacity = '1';
    } else if (explanationRef.current) {
      explanationRef.current.style.maxHeight = '0px';
      explanationRef.current.style.opacity = '0';
    }
  }, [isSubmitted]);

  return (
    <div className='w-full h-[calc(100% + 40px)] bg-white rounded-[24px] px-[45px] pt-10 pb-10 shadow-sm'>
      <div>
        {/* 문제 번호 */}
        <div className='mb-6'>
          <p className='text-lg font-medium'>
            문제 {currentNumber}/{totalNumber}
          </p>
        </div>

        {/* 문제 내용 */}
        <div className='mb-8'>
          <h2 className='text-lg font-bold'>{question}</h2>
        </div>

        {/* 보기 목록 */}
        <div className='space-y-3 mb-2'>
          {options.map((option, index) => {
            let optionStyle = 'border-gray-200';
            let textStyle = '';
            if (isSubmitted) {
              if (index === answerIndex) {
                optionStyle = 'border-green-500 bg-green-50';
                textStyle = 'font-bold text-green-700';
              } else if (selectedOption === index) {
                optionStyle = 'border-red-400 bg-red-50';
                textStyle = 'font-bold text-red-500';
              }
            } else if (selectedOption === index) {
              optionStyle = 'border-gray-400 bg-gray-100';
              textStyle = 'font-bold text-gray-700';
            }
            return (
              <div
                key={index}
                onClick={() => !isSubmitted && onSelect(index)}
                className={`p-4 border-2 rounded-[24px] cursor-pointer transition-colors ${optionStyle}`}
              >
                <span className={textStyle}>
                  {index + 1}. {option}
                </span>
              </div>
            );
          })}
        </div>

        {/* 해설 */}
        <div
          ref={explanationRef}
          style={{
            maxHeight: 0,
            opacity: 0,
            overflow: 'hidden',
            transition:
              'max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.4s',
          }}
          className='mb-6'
        >
          <div className='p-4 bg-purple-50 rounded-lg text-gray-700'>
            <div className='font-semibold mb-2'>해설</div>
            <div>{explanation}</div>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className='flex justify-end'>
        {!isSubmitted ? (
          <button
            type='button'
            onClick={() => onSubmit()}
            disabled={selectedOption === null}
            className={
              `px-6 py-2 rounded-lg border-2 font-bold transition-all duration-300 ` +
              (selectedOption === null ? disabledBtnClass : activeBtnClass)
            }
          >
            제출
          </button>
        ) : (
          <button
            type='button'
            onClick={() => onNext()}
            className={`px-6 py-2 rounded-lg border-2 font-bold transition-all duration-300 ${activeBtnClass}`}
          >
            다음
          </button>
        )}
      </div>
    </div>
  );
}

export default QuestionFrame;
