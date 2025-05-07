import { TestListProps } from '@/types/incorrect';

function TestList({ currentNumber, totalTests, onTestClick }: TestListProps) {
  return (
    <div className='bg-white rounded-3xl p-6 shadow-sm h-full min-h-[0] flex flex-col'>
      <h3 className='text-lg font-bold mb-6'>문제 목록</h3>
      <div className='grid grid-cols-5 gap-3 px-2 flex-1 min-h-[0] overflow-y-auto'>
        {Array.from({ length: Math.min(totalTests, 10) }, (_, i) => i + 1).map(
          (number) => (
            <button
              key={number}
              onClick={() => onTestClick(number)}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-sm font-medium
                transition-colors duration-200 ease-in-out min-w-[32px] cursor-pointer
                ${
                  number === currentNumber
                    ? 'bg-gradient-to-r from-[#754AFF] to-[#A34BFF] text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }
              `}
            >
              {number}
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default TestList;
