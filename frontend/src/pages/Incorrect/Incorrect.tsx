import { useState } from 'react';
import Test from './Test';
import TestList from './TestList';
import Button from '@/components/common/Button/Button';
import Note from './Note';

const Incorrect = () => {
  const [currentNumber, setCurrentNumber] = useState(1);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 임시 데이터 - 실제 데이터로 교체 필요
  const mockTest = {
    test: '임시 문제입니다.',
    options: ['보기 1', '보기 2', '보기 3', '보기 4'],
    answerIndex: 0,
    explanation: '임시 해설입니다.',
  };

  const mockExams = [
    { id: '250424', name: '정보처리기사 시험지 1', isActive: true },
    { id: '250424-2', name: '정보처리기사 시험지 2', isActive: false },
    { id: '250424-3', name: '정보처리기사 시험지 3', isActive: false },
    { id: '250424-4', name: '정보처리기사 시험지 4', isActive: false },
  ];

  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
  };

  const handleNext = () => {
    setCurrentNumber((prev) => Math.min(prev + 1, totalTests));
    setSelectedOption(null);
    setIsSubmitted(false);
  };

  const handleTestClick = (TestNumber: number) => {
    setCurrentNumber(TestNumber);
    setSelectedOption(null);
    setIsSubmitted(false);
  };

  const totalTests = 30; // API 호출 후 받아오는 데이터로 변경 필요

  return (
    <div className='flex w-full gap-6'>
      {/* TestList (1/5) */}
      <div style={{ flex: 1 }} className='flex flex-col gap-6'>
        <div className='bg-white rounded-3xl p-6 shadow-sm h-[65%] min-h-[0] overflow-y-auto'>
          <h3 className='text-lg font-bold mb-6'>내가 푼 시험지 List</h3>
          <div className='flex flex-col gap-3'>
            {mockExams.map((exam) => (
              <Button
                key={exam.id}
                className={`w-full py-3 px-6 rounded-2xl transition-colors
                    ${
                      exam.isActive
                        ? 'bg-[#754AFF] text-white'
                        : 'bg-white border-1 border-gray-200 text-gray-900 hover:bg-[#754AFF]/10 hover:border-[#754AFF]'
                    }`}
              >
                {exam.name}
              </Button>
            ))}
          </div>
        </div>

        <div className='h-[35%] overflow-y-auto'>
          <TestList
            currentNumber={currentNumber}
            totalTests={totalTests}
            onTestClick={handleTestClick}
          />
        </div>
      </div>

      {/* Test (3/5) */}
      <div style={{ flex: 3 }} className='flex flex-col min-h-0'>
        <Test
          currentNumber={currentNumber}
          totalNumber={totalTests}
          test={mockTest.test}
          options={mockTest.options}
          selectedOption={1}
          isSubmitted={true}
          answerIndex={mockTest.answerIndex}
          explanation={mockTest.explanation}
          onSelect={handleOptionSelect}
          onNext={handleNext}
        />
      </div>

      {/* Note (1/5) */}
      <div style={{ flex: 1 }} className='flex flex-col min-h-0'>
        <Note />
      </div>
    </div>
  );
};

export default Incorrect;
