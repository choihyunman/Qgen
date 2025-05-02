// src/pages/MainContent.tsx
'use client';

import WorkBookList from './WorkBookList';
import WorkBookAddModal from '@/components/list/WorkBookAddModal/WorkBookAddModal';
import { useEffect, useState } from 'react';
import UploadedList from '@/components/upload/UploadedList/UploadedList';
import TestPaperList from './TestPaperList';
import IconBox from '@/components/common/IconBox/IconBox';
import Button from '@/components/common/Button/Button';
import { useWorkBook } from '@/hooks/list/useWorkBooks';

// 예시: 실제 로그인 유저의 id를 받아와야 함
const userId = 1;

export default function List() {
  // 커스텀 훅 사용
  const {
    workbooks,
    isLoading,
    error,
    fetchWorkBooks,
    createNewWorkBook,
    editWorkBook,
    // removeWorkBook 등 필요시 추가
  } = useWorkBook();

  // 기타 상태
  const [selectedWorkbook, setSelectedWorkbook] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');

  // 자료 업로드 mock (실제 API 연동 시 교체)
  const [files, setFiles] = useState([
    { id: '1', title: '정보처리기사 필기 준비 문제 모음', type: 'DOC' },
    { id: '2', title: '정보처리기사 필기 준비', type: 'DOC' },
    { id: '3', title: '정보처리기사 필기 준비', type: 'DOC' },
    { id: '4', title: '정보처리기사 필기 준비', type: 'DOC' },
  ]);

  // 문제집 목록 불러오기
  useEffect(() => {
    fetchWorkBooks(userId);
  }, []);

  // 선택된 워크북 정보
  const selectedWorkbookData = workbooks?.find(
    (wb) => wb.workBookId === selectedWorkbook
  );

  // 모달 열기/닫기
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // 새 워크북 추가
  const handleAddWorkBook = async (title: string) => {
    await createNewWorkBook(userId, title);
    setIsModalOpen(false);
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
  const handleSubmitEdit = async () => {
    if (editingTitle.trim() && selectedWorkbook) {
      await editWorkBook(selectedWorkbook, editingTitle.trim());
    }
    setIsEditing(false);
    setEditingTitle('');
  };

  // 문제집 클릭
  const handleWorkBookClick = (id: number) => {
    setSelectedWorkbook(id);
  };

  // 문제집 목록으로 돌아가기
  const handleBackToWorkbooks = () => {
    setSelectedWorkbook(null);
    setIsEditing(false);
    setEditingTitle('');
  };

  return (
    <main className='py-8 flex flex-col gap-8'>
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
              <IconBox
                className='cursor-pointer'
                name='plusCircle'
                size={22}
                onClick={handleOpenModal}
              />
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
                    {selectedWorkbookData ? (
                      <span className='text-xl font-semibold border-b-2 border-transparent group-hover:border-gray-300'>
                        {selectedWorkbookData.title}
                      </span>
                    ) : (
                      <div>선택된 문제집이 없습니다.</div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* 로딩/에러 처리 */}
          {isLoading && <div>로딩 중...</div>}
          {error && <div className='text-red-500'>{error.message}</div>}

          {/* 조건부 렌더링 */}
          {!isLoading &&
            !error &&
            (selectedWorkbook ? (
              <TestPaperList
                papers={[]} // 실제 문제 리스트 연동 필요
              />
            ) : (
              <WorkBookList
                workbooks={workbooks.map((wb) => ({
                  id: String(wb.workBookId),
                  title: wb.title,
                  date: wb.createAt,
                }))}
                onWorkBookClick={(id) => handleWorkBookClick(Number(id))}
                onAddClick={handleOpenModal}
              />
            ))}
        </div>

        {/* 자료 업로드 - selectedWorkbook이 있을 때만 표시 */}
        {selectedWorkbook && (
          <aside className='w-[340px] shrink-0'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-2xl font-semibold'>자료 업로드</span>
              <Button className='px-2 py-1 text-xs'>+ 추가하기</Button>
            </div>
            <UploadedList files={files} maxFiles={10} onDelete={() => {}} />
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
