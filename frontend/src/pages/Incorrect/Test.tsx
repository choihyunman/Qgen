import { useRef, useEffect } from 'react';
import { IncorrectTestProps } from '@/types/incorrect';
import Button from '@/components/common/Button/Button';

function IncorrectTest({
  currentNumber,
  totalNumber,
  test,
  options,
  selectedOption,
  isSubmitted,
  answerIndex,
  explanation,
  onNext,
}: IncorrectTestProps) {
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
    <div className='w-full h-full min-h-0 bg-white rounded-3xl p-6 shadow-sm'>
      <div>
        {/* 문제 번호 */}
        <div className='mb-4'>
          <p className='text-base font-medium'>
            문제 {currentNumber}/{totalNumber}
          </p>
        </div>

        {/* 문제 내용 */}
        <div className='mb-8'>
          <h2 className='text-lg font-bold'>{test}</h2>
        </div>

        {/* 보기 목록 */}
        <div className='space-y-3 mb-2'>
          {options.map((option, index) => {
            let optionStyle = 'border-gray-200 py-3';
            let textStyle = 'flex items-center';
            if (isSubmitted) {
              if (index === answerIndex) {
                optionStyle = 'border-green-300 bg-green-100 py-3';
                textStyle = 'font-bold';
              } else if (selectedOption === index) {
                optionStyle = 'border-rose-300 bg-rose-100 py-3';
                textStyle = 'font-bold';
              }
            }
            return (
              <div
                key={index}
                className={`p-4 border-1 rounded-2xl transition-colors ${optionStyle}`}
              >
                <span className={textStyle}>
                  <span className='mr-4'>{index + 1}</span>
                  <span>{option}</span>
                </span>
              </div>
            );
          })}
        </div>

        {/* 해설 */}
        <div className='my-6'>
          <div className='p-4 bg-purple-50 rounded-2xl text-gray-700'>
            <div className='font-semibold mb-2'>해설</div>
            <div>{explanation}</div>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className='flex justify-end'>
        <Button onClick={onNext} variant='outlined' className='py-3 px-5'>
          다음
        </Button>
      </div>
    </div>
  );
}

export default IncorrectTest;
