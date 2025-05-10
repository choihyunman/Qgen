import { TestType } from '@/types/generate';

interface ProblemTypeSelectorProps {
  testTypes: TestType[];
  totalProblems: number;
  onTypeClick: (typeName: string) => void;
  onCountChange: (typeName: string, newCount: number) => void;
  className?: string;
}

function ProblemTypeSelector({
  testTypes,
  totalProblems,
  onTypeClick,
  onCountChange,
  className,
}: ProblemTypeSelectorProps) {
  return (
    <div className={`bg-white rounded-3xl shadow-sm p-6 w-full ${className}`}>
      <div className='flex justify-between items-center mb-1'>
        <h2 className='text-xl font-semibold'>문제 유형 선택</h2>
        <span className='text-lg font-medium text-[#754AFF]'>
          총 {totalProblems}문제
        </span>
      </div>
      <p className='text-sm text-gray-500 mb-4 text-left'>
        최대 30문제까지 생성 가능합니다.
      </p>
      <div className='flex flex-col gap-4 mb-4 w-full'>
        {testTypes.map((type) => (
          <div key={type.name} className='flex items-center gap-4'>
            {/* Type Button */}
            <button
              onClick={() => onTypeClick(type.name)}
              className={`
                w-1/3 px-6 py-3 rounded-lg cursor-pointer
                ${
                  type.count > 0
                    ? 'bg-[#754AFF] text-white'
                    : 'bg-gray-100 text-gray-600'
                }
                transition-colors
              `}
            >
              {type.name}
            </button>

            {/* Count Input with Buttons */}
            <div className='relative flex-1'>
              <input
                type='number'
                min='0'
                max='30'
                value={type.count}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  if (value >= 0 && value <= 30) {
                    onCountChange(type.name, value);
                  }
                }}
                className='w-full h-12 pl-12 pr-12 text-center border border-gray-200 rounded-lg focus:outline-none focus:border-[#754AFF]'
              />
              <button
                onClick={() => onCountChange(type.name, type.count - 1)}
                className='absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200'
                disabled={type.count === 0}
              >
                -
              </button>
              <button
                onClick={() => onCountChange(type.name, type.count + 1)}
                className='absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200'
                disabled={totalProblems >= 30}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProblemTypeSelector;
