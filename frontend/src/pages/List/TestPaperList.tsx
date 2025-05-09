// src/components/TestPaperList/TestPaperList.tsx

import Button from '@/components/common/Button/Button';
import IconBox from '@/components/common/IconBox/IconBox';

interface TestPaper {
  workbookId: string | number;
  testPaperId: string | number;
  title: string;
  createdAt: string;
  questionCount: number;
  types: string;
  onPdfClick?: () => void;
  onSolveClick?: () => void;
  onDelete?: (testPaperId: number) => void;
}

interface TestPaperListProps {
  papers: TestPaper[];
}

function TestPaperList({ papers }: TestPaperListProps) {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 bg-[rgba(255,255,255,0.75)] rounded-2xl p-4 flex flex-col gap-2 shadow border border-gray-100'>
      {papers.map((paper) => (
        <div
          key={paper.testPaperId}
          className='cursor-pointer bg-white rounded-2xl p-4 flex flex-col gap-2 shadow border border-gray-100'
        >
          <div className='flex items-center justify-between'>
            <div className='font-semibold truncate max-w-[200px]'>
              {paper.title}
            </div>
            <div className='flex gap-2'>
              <Button
                onClick={() => paper.onPdfClick?.()}
                variant='outlined'
                className='px-2 py-1 text-xs'
              >
                PDF 변환
              </Button>
              <Button
                onClick={() => paper.onSolveClick?.()}
                variant='filled'
                className='px-3 py-1 text-xs'
              >
                문제 풀기
              </Button>
            </div>
          </div>
          <div className='text-xs text-gray-500 flex justify-between align-end'>
            <div>
              생성일 {paper.createdAt} · 문제수 {paper.questionCount}
              <br />
              문제유형: {paper.types}
            </div>
            <div className='flex pt-5'>
              <IconBox
                name='trash'
                size={12}
                className='cursor-pointer hover:text-red-500'
                onClick={() => {
                  if (window.confirm('이 시험지를 삭제하시겠습니까?')) {
                    paper.onDelete?.(Number(paper.testPaperId));
                  }
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TestPaperList;
