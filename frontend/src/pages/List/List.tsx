// src/pages/MainContent.tsx
'use client';

import WorkBookList from './WorkBookList';
import WorkBookAddModal from '@/components/list/WorkBookAddModal/WorkBookAddModal';

import { useState } from 'react';
import UploadedList from '@/components/upload/UploadedList/UploadedList';
import TestPaperList from './TestPaperList';
import IconBox from '@/components/common/IconBox/IconBox';
import Button from '@/components/common/Button/Button';

const mockFiles = [
  { id: '1', title: '정보처리기사 필기 준비 문제 모음', type: 'DOC' },
  { id: '2', title: '정보처리기사 필기 준비', type: 'DOC' },
  { id: '3', title: '정보처리기사 필기 준비', type: 'DOC' },
  { id: '4', title: '정보처리기사 필기 준비', type: 'DOC' },
];

const mockWorkbooks = [
  {
    id: '1',
    title: '정보처리기사 필기 준비 1',
    date: '2025-04-25',
  },
  {
    id: '2',
    title: '정보처리기사 필기 준비 2',
    date: '2025-04-25',
  },
  {
    id: '3',
    title: '정보처리기사 필기 준비 3',
    date: '2025-04-25',
  },
  {
    id: '4',
    title: '정보처리기사 필기 준비 4',
    date: '2025-04-25',
  },
  {
    id: '5',
    title: '정보처리기사 필기 준비 5',
    date: '2025-04-25',
  },
];

const mockPapers = [
  {
    workbookId: '1',
    title: '정보처리기사 필기 준비',
    createdAt: '2025.04.25',
    questionCount: 30,
    types: '객관식, 주관식, OX, 암기형',
  },
  {
    workbookId: '2',
    title: '정보처리기사 필기 준비',
    createdAt: '2025.04.25',
    questionCount: 30,
    types: '객관식, 주관식, OX, 암기형',
  },
  {
    workbookId: '3',
    title: '정보처리기사 필기 준비',
    createdAt: '2025.04.25',
    questionCount: 30,
    types: '객관식, 주관식, OX, 암기형',
  },
  {
    workbookId: '4',
    title: '정보처리기사 필기 준비',
    createdAt: '2025.04.25',
    questionCount: 30,
    types: '객관식, 주관식, OX, 암기형',
  },
];

export default function List() {
  const [files, setFiles] = useState(mockFiles);
  const [selectedWorkbook, setSelectedWorkbook] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');

  const handleDelete = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleWorkBookClick = (id: string) => {
    setSelectedWorkbook(id);
  };

  const handleBackToWorkbooks = () => {
    setSelectedWorkbook(null);
  };

  // 선택된 워크북 정보 가져오기
  const selectedWorkbookData = mockWorkbooks.find(
    (wb) => wb.id === selectedWorkbook
  );

  // 모달 열기
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // 새 워크북 추가
  const handleAddWorkBook = (title: string) => {
    // 실제 구현에서는 API 호출 등이 들어갈 수 있습니다
    const newWorkBook = {
      id: String(mockWorkbooks.length + 1),
      title,
      date: new Date().toISOString().split('T')[0],
    };
    mockWorkbooks.push(newWorkBook);
  };

  // 수정 모드 시작
  const handleStartEdit = () => {
    setEditingTitle(selectedWorkbookData?.title || '');
    setIsEditing(true);
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingTitle('');
  };

  // 수정 완료
  const handleSubmitEdit = () => {
    if (editingTitle.trim() && selectedWorkbook) {
      const workbookIndex = mockWorkbooks.findIndex(
        (wb) => wb.id === selectedWorkbook
      );
      if (workbookIndex !== -1) {
        mockWorkbooks[workbookIndex].title = editingTitle.trim();
      }
    }
    setIsEditing(false);
    setEditingTitle('');
  };

  return (
    <main className='py-8  flex flex-col gap-8'>
      {/* 인사 및 알림 카드 */}
      <section>
        <h1 className='text-2xl font-bold mb-6'>
          안녕하세요! 오늘도 Q-gen에서 즐겁게 공부해요 !
        </h1>
        <div className='bg-white rounded-2xl shadow p-6 flex items-center gap-4 mb-8'>
          {/* 예시 이미지(아이콘) */}
          <div className='p-3 w-24 h-26 bg-gray-100 rounded-full flex items-center justify-center'>
            <img src='src/assets/images/dolpin-with-tablet.png' alt='' />
          </div>
          <div className='flex-1'>
            <div className='font-medium mb-1'>
              '정보처리기사 문제집'을 푼지 '3' 일이 지났어요.
            </div>
            <div className='text-gray-500 text-sm mb-2'>
              곧 잊어버리기 전에 함께 복습하러 가볼까요?
            </div>
            <Button variant='filled' className='px-3 py-2 text-sm'>
              문제 풀기
            </Button>
          </div>
        </div>
      </section>

      {/* 문제집 & 자료 업로드 */}
      <section className='flex gap-8'>
        {/* 문제집 리스트 */}
        <div className='flex-1'>
          <div className='flex items-center gap-2 mb-4'>
            <button
              onClick={handleBackToWorkbooks}
              className='cursor-pointer text-2xl font-semibold hover:text-purple-600 transition-colors'
            >
              문제집 목록
            </button>
            {!selectedWorkbook && (
              <>
                <IconBox
                  className='cursor-pointer'
                  name='plusCircle'
                  size={22}
                  onClick={handleOpenModal}
                />
              </>
            )}
            {selectedWorkbook && (
              <>
                <span className='text-gray-400'>›</span>
                {isEditing ? (
                  <div className='flex items-center gap-2'>
                    <div className='relative inline-block'>
                      <span
                        className='invisible whitespace-pre absolute text-xl font-semibold'
                        aria-hidden='true'
                      >
                        {editingTitle}
                      </span>
                      <input
                        type='text'
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSubmitEdit();
                          } else if (e.key === 'Escape') {
                            handleCancelEdit();
                          }
                        }}
                        className='w-full min-w-[200px] border-0 border-b-2 border-gray-300 focus:border-purple-500 focus:ring-0 focus:outline-none rounded-none px-0 py-0 text-xl font-semibold bg-transparent'
                        autoFocus
                      />
                      <IconBox
                        className='absolute right-0 top-1 cursor-pointer'
                        name='check'
                        size={20}
                        onClick={handleSubmitEdit}
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={handleStartEdit}
                    className='group flex items-center cursor-pointer'
                  >
                    <span className='text-xl font-semibold border-b-2 border-transparent group-hover:border-gray-300'>
                      {selectedWorkbookData?.title}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 조건부 렌더링 */}
          {selectedWorkbook ? (
            <TestPaperList
              papers={mockPapers.filter(
                (paper) => paper.workbookId === selectedWorkbook
              )}
            />
          ) : (
            <WorkBookList
              workbooks={mockWorkbooks}
              onWorkBookClick={handleWorkBookClick}
              onAddClick={handleOpenModal}
            />
          )}
        </div>

        {/* 자료 업로드 - selectedWorkbook이 있을 때만 표시 */}
        {selectedWorkbook && (
          <aside className='w-[340px] shrink-0'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-2xl font-semibold'>자료 업로드</span>
              <Button className='px-2 py-1 text-xs'>+ 추가하기</Button>
            </div>
            <UploadedList files={files} maxFiles={10} onDelete={handleDelete} />
          </aside>
        )}
      </section>

      {/* 모달 추가 */}
      <WorkBookAddModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddWorkBook}
      />
    </main>
  );
}
