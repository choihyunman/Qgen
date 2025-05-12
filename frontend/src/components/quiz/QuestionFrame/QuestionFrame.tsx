import { useRef, useEffect } from 'react';
import Button from '@/components/common/Button/Button';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

interface QuestionFrameProps {
  currentNumber: number;
  totalNumber: number;
  question: string;
  options: string[];
  selectedOption: number | string | null;
  isSubmitted: boolean;
  answerIndex: number;
  explanation: string;
  onSelect: (value: number | string) => void;
  onSubmit: () => void;
  onNext: () => void;
  questionType?: 'choiceAns' | 'shortAns' | 'oxAns';
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
  questionType = 'choiceAns',
}: QuestionFrameProps) {
  const explanationRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  // 문제 유형 변환 함수
  const convertQuestionType = (
    type: string
  ): 'choiceAns' | 'shortAns' | 'oxAns' => {
    switch (type) {
      case 'TYPE_OX':
      case 'oxAns':
        return 'oxAns';
      case 'TYPE_CHOICE':
        return 'choiceAns';
      case 'TYPE_SHORT':
        return 'shortAns';
      default:
        return 'choiceAns';
    }
  };

  useEffect(() => {
    const convertedType = convertQuestionType(questionType || '');
    console.log('원본 문제 유형:', questionType);
    console.log('변환된 문제 유형:', convertedType);
    console.log('선택된 옵션:', selectedOption);
  }, [questionType, selectedOption]);

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

  // OX 문제 렌더링
  const renderOXQuestion = () => {
    return (
      <div className='flex gap-4 justify-center mb-2'>
        {['O', 'X'].map((option, index) => {
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
              className={`w-[469px] h-[272px] border-2 rounded-[24px] cursor-pointer transition-colors flex items-center justify-center text-6xl font-bold ${optionStyle}`}
            >
              <span className={textStyle}>{option}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // 객관식 문제 렌더링
  const renderMultipleChoice = () => {
    return (
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
    );
  };

  // 주관식 문제 렌더링
  const renderShortAnswer = () => {
    return (
      <div className='mb-2'>
        <input
          type='text'
          className='w-full p-4 border-2 rounded-[24px] focus:outline-none focus:border-purple-500'
          placeholder='답을 입력하세요'
          value={(selectedOption as string) || ''}
          disabled={isSubmitted}
          onChange={(e) => onSelect(e.target.value)}
        />
      </div>
    );
  };

  // 문제 유형에 따른 렌더링
  const renderQuestion = () => {
    const convertedType = convertQuestionType(questionType || '');
    switch (convertedType) {
      case 'oxAns':
        return renderOXQuestion();
      case 'shortAns':
        return renderShortAnswer();
      case 'choiceAns':
      default:
        return renderMultipleChoice();
    }
  };

  return (
    <div
      ref={frameRef}
      className='transition-opacity duration-300 opacity-100 w-full h-[537px] bg-white rounded-[24px] p-6 shadow-sm overflow-y-auto'
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

        {/* 문제 유형에 따른 렌더링 */}
        {renderQuestion()}

        {/* 해설 */}
        <div
          className='transition-all duration-500 ease-in-out overflow-hidden mt-6'
          style={{
            maxHeight: isSubmitted ? 220 : 0,
            opacity: isSubmitted ? 1 : 0,
          }}
        >
          <div className='font-semibold mb-2'>해설</div>
          <SimpleBar style={{ maxHeight: 180 }}>
            <div className='bg-purple-50 rounded-lg text-gray-700 p-4 max-h-[180px] overflow-y-auto'>
              {explanation}
            </div>
          </SimpleBar>
        </div>
      </div>
    </div>
  );
}

export default QuestionFrame;
