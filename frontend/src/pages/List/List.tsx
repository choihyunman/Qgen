// src/pages/MainContent.tsx
'use client';

import WorkBookList from './WorkBookList';

import { useState } from 'react';
import UploadedList from '@/components/upload/UploadedList/UploadedList';
import TestPaperList from './TestPaperList';

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

  return (
    <main className='py-8 px-4 flex flex-col gap-8'>
      {/* 인사 및 알림 카드 */}
      <section>
        <h1 className='text-2xl font-bold mb-6'>
          안녕하세요! 오늘도 Q-gen에서 즐겁게 공부해요 !
        </h1>
        <div className='bg-white rounded-2xl shadow p-6 flex items-center gap-4 mb-8'>
          {/* 예시 이미지(아이콘) */}
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center'>
            <span role='img' aria-label='icon' className='text-3xl'>
              🎓
            </span>
          </div>
          <div className='flex-1'>
            <div className='font-medium mb-1'>
              '정보처리기사 문제집'을 푼지 '3' 일이 지났어요.
            </div>
            <div className='text-gray-500 text-sm mb-2'>
              곧 잊어버리기 전에 함께 복습하러 가볼까요?
            </div>
            <button className='px-4 py-1 border border-purple-400 text-purple-600 rounded-lg text-sm hover:bg-purple-50 transition'>
              바로가기
            </button>
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
              워크북 목록
            </button>
            {selectedWorkbook && (
              <>
                <span className='text-gray-400'>›</span>
                <span className='text-lg font-semibold'>
                  {selectedWorkbookData?.title}
                </span>
              </>
            )}
            <button className='ml-2 text-gray-400 hover:text-purple-500'>
              <span className='sr-only'>이름 수정</span>
              <svg width='16' height='16' fill='none' viewBox='0 0 16 16'>
                <path
                  d='M2 12.5V14h1.5l8.06-8.06-1.5-1.5L2 12.5zM14.06 4.06a1 1 0 0 0 0-1.41l-1.71-1.71a1 1 0 0 0-1.41 0l-1.13 1.13 3.12 3.12 1.13-1.13z'
                  fill='currentColor'
                />
              </svg>
            </button>
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
            />
          )}
        </div>

        {/* 자료 업로드 - selectedWorkbook이 있을 때만 표시 */}
        {selectedWorkbook && (
          <aside className='w-[340px] shrink-0'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-2xl font-semibold'>자료 업로드</span>
              <button className='px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded hover:bg-purple-200 transition'>
                + 추가하기
              </button>
            </div>
            <UploadedList files={files} maxFiles={10} onDelete={handleDelete} />
          </aside>
        )}
      </section>
    </main>
  );
}
