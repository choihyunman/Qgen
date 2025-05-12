import { useRef, useEffect } from 'react';
import { NoteProps } from '@/types/note';
import Button from '@/components/common/Button/Button';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

function Test({
  currentNumber,
  totalNumber,
  test,
  options,
  selectedOption,
  isSubmitted,
  answerIndex,
  explanation,
  onNext,
}: NoteProps) {
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
        <div className='flex justify-between'>
          {/* 문제 번호 */}
          <div className='mb-4 flex items-center gap-4'>
            <p className='text-base font-bold'>
              문제 {currentNumber}/{totalNumber}
            </p>
            <Button
              variant='small'
              className='py-1 px-2 bg-rose-400 text-white hover:bg-rose-500'
            >
              회
            </Button>
          </div>
          <div className='flex justify-end'>
            <Button onClick={onNext} variant='small' className='my-1 text-xs'>
              다음
            </Button>
          </div>
        </div>
        {/* 문제 내용 */}
        <div className='mb-6'>
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
        <SimpleBar className='my-6 h-full min-h-0 bg-[#CAC7FC]/20 rounded-3xl max-h-52 flex flex-col p-6'>
          <div className='font-semibold mb-2 text-gray-700'>해설</div>
          <div className='text-gray-700'>{explanation}</div>
        </SimpleBar>
      </div>
    </div>
  );
}

export default Test;
