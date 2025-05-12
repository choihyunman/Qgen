import { useState, useEffect } from 'react';
import Test from './Test';
import TestList from './TestList';
import Button from '@/components/common/Button/Button';
import Memo from './Memo';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { getNoteTestPapers } from '@/apis/note/note';
import type { TestPaper } from '@/types/note';

const Note = () => {
  const [currentNumber, setCurrentNumber] = useState(1);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [testPapers, setTestPapers] = useState<TestPaper[]>([]);
  const [activeTestPaperIndex, setActiveTestPaperIndex] = useState(0);

  // 임시 데이터 - 실제 데이터로 교체 필요
  const mockTest = {
    test: '임시 문제입니다.',
    options: ['보기 1', '보기 2', '보기 3', '보기 4'],
    answerIndex: 0,
    explanation: `유스케이스는 시스템이 액터에게 제공해야 하는 기능으로, 시스템의 요구사항이자 기능을 의미

유스케이스 다이어그램은 사용자의 요구를 추출하고 분석하기 위해 주요 사용
여기서 액터는 시스템 외부에서 시스템과 상호작용하는 사람 혹은 시스템을 말함

사용자 액터: 기능을 요구하는 대상이나 시스템의 수행결과를 통보받는 사용자 혹은 기능을 사용하게 될 대상으로
시스템이 제공해야하는 기능인 유스케이스의 권한을 가지는 대상, 역할

시스템 액터: 사용자 액터가 사용한 유스케이스를 처리해주는 외부 시스템, 시스템의 기능 수행을 위해서 연동이 되는 또 다른 시스템 액터를 의미
[해설작성자 : 컴린이]

액터?
-시스템과 상호작용을 하는 모든 외부 요소로, 사람이나 외부 시스템을 의미
-주액터(사용자 액터)
-부액터(시스템 액터)

1번 개발자의 요구X   사용자의 요구O
3번 부액터(시스템 액터) 설명임
4번 일방적X  양방향O          `,
  };

  useEffect(() => {
    const fetchTestPapers = async () => {
      try {
        const res = await getNoteTestPapers(1);
        setTestPapers(res.data);
      } catch (e) {
        // TODO: 에러 처리
        setTestPapers([]);
      }
    };
    fetchTestPapers();
  }, []);

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

  const totalTests = testPapers[activeTestPaperIndex].quantity;

  return (
    <div className='flex gap-4 h-full'>
      {/* TestList (1/5) */}
      <div style={{ flex: 1 }} className='flex flex-col gap-4 h-full min-h-0'>
        <SimpleBar
          style={{ flex: 3.3, height: '0', minHeight: 0 }}
          className='bg-white rounded-3xl p-6 shadow-sm'
        >
          <h3 className='text-lg font-bold mb-4'>내가 푼 시험지 List</h3>

          <div className='flex flex-col gap-3'>
            {testPapers.map((exam, idx) => (
              <Button
                key={exam.testPaperId}
                variant='filled'
                className={`w-full py-3 px-6 rounded-2xl transition-colors${idx === activeTestPaperIndex ? '' : ' bg-white border-1 border-gray-200 text-gray-900 hover:bg-[#754AFF]/10 hover:border-[#754AFF]/80'}`}
                onClick={() => setActiveTestPaperIndex(idx)}
              >
                {exam.title}
              </Button>
            ))}
          </div>
        </SimpleBar>

        <SimpleBar
          style={{ flex: 1.7, height: '0', minHeight: 0 }}
          className='bg-white rounded-3xl p-6 shadow-sm'
        >
          <TestList
            currentNumber={currentNumber}
            totalTests={totalTests}
            onTestClick={handleTestClick}
          />
        </SimpleBar>
      </div>

      {/* Test (3/5) */}
      <div style={{ flex: 3 }} className='flex flex-col h-full min-h-0'>
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
      <div style={{ flex: 1 }} className='flex flex-col h-full min-h-0'>
        <Memo />
      </div>
    </div>
  );
};

export default Note;
