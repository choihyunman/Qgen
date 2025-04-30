// src/components/TestPaperList/TestPaperList.tsx

interface TestPaper {
  id: string | number;
  title: string;
  createdAt: string;
  questionCount: number;
  types: string;
  onPdfClick?: () => void;
  onSolveClick?: () => void;
}

interface TestPaperListProps {
  papers: TestPaper[];
}

function TestPaperList({ papers }: TestPaperListProps) {
  return (
    <div className='space-y-4'>
      {papers.map((paper) => (
        <div
          key={paper.id}
          className='bg-white rounded-2xl p-4 flex flex-col gap-2 shadow border border-gray-100'
        >
          <div className='flex items-center justify-between'>
            <div className='font-semibold'>{paper.title}</div>
            <div className='flex gap-2'>
              <button
                className='px-3 py-1 bg-purple-100 text-purple-600 rounded-lg text-xs font-medium hover:bg-purple-200 transition'
                onClick={paper.onPdfClick}
              >
                PDF 변환
              </button>
              <button
                className='px-3 py-1 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-100 transition'
                onClick={paper.onSolveClick}
              >
                문제 풀기
              </button>
            </div>
          </div>
          <div className='text-xs text-gray-500'>
            생성일 {paper.createdAt} · 문제수 {paper.questionCount}
            <br />
            문제유형: {paper.types}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TestPaperList;
