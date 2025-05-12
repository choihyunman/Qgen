import { TestListProps } from '@/types/note';
import Button from '@/components/common/Button/Button';

function TestList({ currentNumber, totalTests, onTestClick }: TestListProps) {
  return (
    <div className='h-full min-h-[0] flex flex-col'>
      <h3 className='text-lg font-bold mb-4'>문제 목록</h3>
      <div className='grid grid-cols-5 gap-2 flex-1 min-h-[0] overflow-y-auto'>
        {Array.from({ length: Math.min(totalTests, 20) }, (_, i) => i + 1).map(
          (number) => (
            <Button
              key={number}
              onClick={() => onTestClick(number)}
              variant={number === currentNumber ? 'filled' : 'basic'}
              className={
                number === currentNumber
                  ? 'px-4 py-2 text-sm shadow-sm'
                  : 'px-4 py-2 text-sm bg-white text-gray-600 border border-gray-200 hover:bg-[#754AFF]/10 hover:border-[#754AFF]/80'
              }
            >
              {number}
            </Button>
          )
        )}
      </div>
    </div>
  );
}

export default TestList;
