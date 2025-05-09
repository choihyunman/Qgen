import React, { useState } from 'react';
import uploadGlassIcon from '@/assets/icons/upload-glass.png';
import linkGlassIcon from '@/assets/icons/link-glass.png';
import textGlassIcon from '@/assets/icons/text-glass.png';
import LinkUploadModal from './LinkUploadModal';
import TextUploadModal from './TextUploadModal';
import { uploadDocument, fetchDocumentsByWorkBook } from '@/apis/upload/upload';
import { DocumentInfo } from '@/types/upload';
import { useUpload } from '@/hooks/useUpload';

interface FileUploaderProps {
  onFileUpload?: (file: File) => void;
  onLinkSubmit?: (url: string) => void;
  onTextSubmit?: (text: string) => void;
  className?: string;
  workBookId: number;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUpload,
  onLinkSubmit,
  onTextSubmit,
  className = '',
  workBookId,
}) => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const {
    documents: uploadedFiles,
    isLoading,
    error,
    handleUpload,
  } = useUpload();
  // const workBookId = 1; // 실제 사용 시 props나 context 등에서 받아올 수 있음

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && onFileUpload) {
      onFileUpload(files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      try {
        await handleUpload(file, workBookId); // useUpload의 handleUpload 사용
        alert('파일 업로드에 성공하였습니다.');
        if (onFileUpload) onFileUpload(file);
      } catch (error) {
        alert('파일 업로드에 실패했습니다.');
      }
    }
  };

  return (
    <div className={`p-6 bg-white rounded-3xl shadow-sm ${className}`}>
      <h1 className='text-xl font-bold mb-2'>문제 생성 소스</h1>
      <p className='text-gray-500 mb-8'>
        문제 생성에 사용할 자료를 업로드하세요. PDF, DOCX, TXT 파일을
        지원합니다.
      </p>

      {/* Main File Upload Area */}
      <div
        className='border-2 border-dashed border-gray-300 rounded-lg p-12 mb-8 flex flex-col items-center justify-center min-h-[200px]'
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <img
          src={uploadGlassIcon}
          alt='upload'
          className='h-15 w-15 mb-3 transition-transform duration-300 hover:scale-110 cursor-pointer'
          onClick={() => document.getElementById('fileInput')?.click()}
        />
        <h2 className='text-xl font-semibold'>파일 선택</h2>
        <p className='text-gray-500 mb-4'>
          파일을 드래그하거나 선택하여 업로드하세요.
        </p>
        <input
          type='file'
          onChange={handleFileInput}
          accept='.pdf,.docx,.txt'
          className='hidden'
          id='fileInput'
        />
      </div>

      {/* Additional Options Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Link Input Option */}
        <div className='bg-white rounded-lg p-8 border border-gray-300 flex flex-col items-center'>
          <img
            src={linkGlassIcon}
            alt='link'
            className='h-15 w-15 mb-3 transition-transform duration-300 hover:scale-110 cursor-pointer'
            onClick={() => setShowLinkModal(true)}
          />
          <h3 className='text-lg font-semibold'>링크로 가져오기</h3>
          <p className='text-sm text-gray-500 text-center mb-4'>
            웹 URL에 표시되는 텍스트를 가져옵니다.
          </p>
        </div>

        {/* Direct Text Input Option */}
        <div className='bg-white rounded-lg p-8 border border-gray-300 flex flex-col items-center'>
          <img
            src={textGlassIcon}
            alt='text'
            className='h-15 w-15 mb-3 transition-transform duration-300 hover:scale-110 cursor-pointer'
            onClick={() => setShowTextModal(true)}
          />
          <h3 className='text-lg font-semibold'>텍스트 직접 입력</h3>
          <p className='text-sm text-gray-500 text-center mb-4'>
            텍스트를 직접 입력하여 문제를 생성합니다.
          </p>
        </div>
      </div>

      {/* Link Upload Modal */}
      {showLinkModal && (
        <LinkUploadModal
          onClose={() => setShowLinkModal(false)}
          onSubmit={(url: string) => {
            if (onLinkSubmit) onLinkSubmit(url);
            setShowLinkModal(false);
          }}
        />
      )}
      {/* Text Upload Modal */}
      {showTextModal && (
        <TextUploadModal
          onClose={() => setShowTextModal(false)}
          onSubmit={(text: string) => {
            if (onTextSubmit) onTextSubmit(text);
            setShowTextModal(false);
          }}
        />
      )}

      {isLoading && <div>업로드 중...</div>}
      {error && <div className='text-red-500'>{error.message}</div>}
    </div>
  );
};

export default FileUploader;
