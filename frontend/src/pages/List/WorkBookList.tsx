// src/components/WorkBookList/WorkBookList.tsx

import WorkBookCard from '@/components/workbook/WorkBookCard/WorkBookCard';
import { useNavigate } from 'react-router-dom';

interface WorkBook {
  id: string;
  title: string;
  date: string;
}

interface WorkBookListProps {
  workbooks: WorkBook[];
  onWorkBookClick?: (id: string) => void;
  onAddClick?: () => void;
  onWorkBookDelete?: (id: string) => void;
  onWorkBookEdit?: (id: string) => void;
}

function WorkBookList({
  workbooks,
  onWorkBookClick,
  onAddClick,
  onWorkBookDelete,
  onWorkBookEdit,
}: WorkBookListProps) {
  const navigate = useNavigate();

  // 카드 클릭 시 라우팅 함수
  const handleCardClick = (id: string) => {
    navigate(`/list/${id}`);
    // 필요하다면 onWorkBookClick도 호출
    onWorkBookClick?.(id);
  };

  const handleWorkBookDelete = (id: string) => {
    if (onWorkBookDelete) {
      onWorkBookDelete(id);
    }
  };

  const handleWorkBookEdit = (id: string) => {
    if (onWorkBookEdit) {
      onWorkBookEdit(id);
    }
  };

  return (
    <div className=''>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {/* 새 문제집 추가 버튼 */}

        {/* 문제집 카드 리스트 */}
        {workbooks.map((workbook) => (
          <WorkBookCard
            key={workbook.id}
            selectedId={Number(workbook.id)}
            title={workbook.title}
            date={workbook.date}
            onClick={() => handleCardClick(workbook.id)}
            onDelete={() => handleWorkBookDelete(workbook.id)}
            onEdit={() => handleWorkBookEdit(workbook.id)}
          />
        ))}

        <div
          onClick={onAddClick}
          className='flex-1 h-[260px] border-2 border-dashed border-gray-300 rounded-[20px] 
                     flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors'
        >
          <div className='flex flex-col items-center gap-2'>
            <div className='w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center'>
              <span className='text-2xl text-gray-400'>+</span>
            </div>
            <span className='text-gray-500'>새 문제집 만들기</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkBookList;
