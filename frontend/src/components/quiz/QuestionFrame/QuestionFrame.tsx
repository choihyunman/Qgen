import { useRef, useEffect } from 'react';
import Button from '@/components/common/Button/Button';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

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
  // const activeBtnClass =
  //   'bg-gray-700 text-white border-gray-700 hover:bg-gray-800 cursor-pointer';
  // const disabledBtnClass =
  //   'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed';
  const explanationRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (frameRef.current) {
      frameRef.current.classList.remove('opacity-0');
      frameRef.current.classList.add('opacity-100');
    }
    return () => {
      if (frameRef.current) {
        frameRef.current.classList.remove('opacity-100');
        frameRef.current.classList.add('opacity-0');
      }
    };
  }, [question]);

  return (
    <div
      ref={frameRef}
      className='transition-opacity duration-300 opacity-100 w-full h-[537px] bg-white rounded-[24px] p-6 shadow-sm'
    >
      <div>
        {/* 문제 번호 */}
        <div className='flex justify-between items-center mb-3'>
          <p className='text-base font-bold'>
            문제 {currentNumber}/{totalNumber}
          </p>
          {!isSubmitted ? (
            <Button
              onClick={onSubmit}
              disabled={selectedOption === null}
              variant='small'
            >
              제출
            </Button>
          ) : (
            <Button onClick={onNext} variant='small'>
              다음
            </Button>
          )}
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
          className='transition-all duration-500 ease-in-out overflow-hidden mt-6'
          style={{
            maxHeight: isSubmitted ? 220 : 0, // 타이틀+SimpleBar 높이 합산
            opacity: isSubmitted ? 1 : 0,
          }}
        >
          <div className='font-semibold mb-2'>해설</div>
          <SimpleBar style={{ maxHeight: 180 }}>
            <div className='bg-purple-50 rounded-lg text-gray-700 p-4'>
              {explanation}
            </div>
          </SimpleBar>
        </div>
      </div>
    </div>
  );
}

export default QuestionFrame;
