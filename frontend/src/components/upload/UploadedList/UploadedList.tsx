// src/components/UploadedList/UploadedList.tsx
'use client';

import { twMerge } from 'tailwind-merge';
import IconBox from '../../common/IconBox/IconBox';

interface UploadedFile {
  id: string;
  title: string;
  type: string;
}

interface UploadedListProps {
  /** 업로드된 파일 목록 */
  files: UploadedFile[];
  /** 전체 업로드 가능한 파일 수 */
  maxFiles?: number;
  /** 파일 삭제 핸들러 */
  onDelete?: (id: string) => void;
  /** 추가 클래스명 */
  className?: string;
}

function UploadedList({
  files,
  maxFiles = 10,
  onDelete,
  className,
}: UploadedListProps) {
  return (
    <div className={twMerge('bg-white rounded-3xl shadow-sm p-6', className)}>
      <div className='w-full space-y-4'>
        <h2 className='text-xl font-bold'>자료 업로드</h2>

        {/* 업로드 진행률 */}
        <div className='space-y-2'>
          <div className='flex justify-between items-center'>
            <span className='text-sm'>자료 한도</span>
            <span className='text-sm'>
              {files.length}/{maxFiles}
            </span>
          </div>
          <div className='h-2 rounded-full bg-gray-200 overflow-hidden'>
            <div
              className='h-full bg-purple-500 rounded-full transition-all duration-300'
              style={{
                width: `${(files.length / maxFiles) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* 파일 목록 */}
        <div className='space-y-3'>
          {files.map((file) => (
            <div
              key={file.id}
              className='flex items-center justify-between p-4 rounded-2xl border border-gray-200'
            >
              <div className='space-y-1'>
                <h3 className='font-medium'>{file.title}</h3>
                <span className='text-sm text-gray-500'>{file.type}</span>
              </div>
              <button
                onClick={() => onDelete?.(file.id)}
                className='p-1 hover:bg-gray-100 rounded-full transition-colors'
              >
                <IconBox name='x' size={20} className='text-gray-400' />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UploadedList;
