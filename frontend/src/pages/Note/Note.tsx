import { useState, useEffect } from 'react';
import Test from './Test';
import TestList from './TestList';
import Button from '@/components/common/Button/Button';
import Memo from './Memo';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import {
  getNoteTestPapers,
  getNoteTestIdList,
  getNoteTestDetail,
} from '@/apis/note/note';
import type { TestPaper, NoteTestDetail } from '@/types/note';

const Note = () => {
  const [currentNumber, setCurrentNumber] = useState(1);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [testPapers, setTestPapers] = useState<TestPaper[]>([]);
  const [activeTestPaperIndex, setActiveTestPaperIndex] = useState(0);
  const [testIdList, setTestIdList] = useState<number[]>([]);
  const [currentTestDetail, setCurrentTestDetail] =
    useState<NoteTestDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 시험지 목록 불러오기
  useEffect(() => {
    const fetchTestPapers = async () => {
      try {
        const res = await getNoteTestPapers(1);
        setTestPapers(res.data);
      } catch (e) {
        setTestPapers([]);
        setError('시험지 목록을 불러오지 못했습니다.');
      }
    };
    fetchTestPapers();
  }, []);

  // 시험지 선택 시 문제 ID 리스트 불러오기
  useEffect(() => {
    if (testPapers.length === 0) return;
    const fetchTestIdList = async () => {
      setLoading(true);
      try {
        const ids = await getNoteTestIdList(
          testPapers[activeTestPaperIndex].testPaperId
        );
        setTestIdList(ids);
        setCurrentNumber(1); // 시험지 바뀌면 1번 문제로 초기화
      } catch (e) {
        setTestIdList([]);
        setError('문제 ID 리스트를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchTestIdList();
  }, [testPapers, activeTestPaperIndex]);

  // 문제 번호 변경 시 문제 상세 불러오기
  useEffect(() => {
    if (testIdList.length === 0) return;
    const fetchTestDetail = async () => {
      setLoading(true);
      try {
        const detail = await getNoteTestDetail(testIdList[currentNumber - 1]);
        setCurrentTestDetail(detail.data);
      } catch (e) {
        setCurrentTestDetail(null);
        setError('문제 상세를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchTestDetail();
  }, [testIdList, currentNumber]);

  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
  };

  const handleNext = () => {
    setCurrentNumber((prev) => Math.min(prev + 1, testIdList.length));
    setSelectedOption(null);
    setIsSubmitted(false);
  };

  const handleTestClick = (testNumber: number) => {
    setCurrentNumber(testNumber);
    setSelectedOption(null);
    setIsSubmitted(false);
  };

  const totalTests = testIdList.length;

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
        {loading ? (
          <div className='flex items-center justify-center h-full'>
            불러오는 중...
          </div>
        ) : error ? (
          <div className='flex items-center justify-center h-full text-red-500'>
            {error}
          </div>
        ) : currentTestDetail ? (
          (() => {
            const options = [
              currentTestDetail.option1,
              currentTestDetail.option2,
              currentTestDetail.option3,
              currentTestDetail.option4,
            ].filter(Boolean) as string[];
            const answerIndex = options.findIndex(
              (opt) => opt === currentTestDetail.answer
            );
            return (
              <Test
                currentNumber={currentNumber}
                totalNumber={totalTests}
                test={currentTestDetail.question}
                options={options}
                selectedOption={selectedOption}
                isSubmitted={isSubmitted}
                answerIndex={answerIndex}
                explanation={currentTestDetail.comment}
                incorrectCount={currentTestDetail.incorrectCount}
                onSelect={handleOptionSelect}
                onNext={handleNext}
                testHistoryList={currentTestDetail.testHistoryList}
                answer={currentTestDetail.answer}
              />
            );
          })()
        ) : (
          <div className='flex items-center justify-center h-full'>
            문제를 불러올 수 없습니다.
          </div>
        )}
      </div>

      {/* Note (1/5) */}
      <div style={{ flex: 1 }} className='flex flex-col h-full min-h-0'>
        {currentTestDetail ? (
          <Memo
            testId={currentTestDetail.testId}
            initialMemo={currentTestDetail.memo}
          />
        ) : (
          <Memo testId={0} initialMemo={null} />
        )}
      </div>
    </div>
  );
};

export default Note;
