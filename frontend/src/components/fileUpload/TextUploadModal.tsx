import React, { useState, ChangeEvent } from 'react';
import Button from '@/components/Button';
import text from '@/assets/icons/text.svg';

interface LinkUploadModalProps {
  onClose: () => void;
  onSubmit: (url: string) => void;
}

const LinkUploadModal: React.FC<LinkUploadModalProps> = ({
  onClose,
  onSubmit,
}) => {
  const [url, setUrl] = useState('');

  const handleSubmit = () => {
    onSubmit(url);
    onClose();
  };

  return (
    <div className='fixed inset-0 bg-black/30 backdrop-blur-[1px] flex justify-center items-center z-50'>
      <div className='bg-white w-full max-w-[800px] rounded-2xl p-8 flex flex-col gap-8'>
        <div className='flex justify-between items-center'>
          <h2 className='text-2xl font-semibold'>텍스트 직접 입력</h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-black text-xl p-1'
          >
            ✕
          </button>
        </div>

        <div className='flex flex-col gap-6'>
          <p className='text-lg text-gray-700'>
            소스로 업로드할 텍스트를 아래에 추가해주세요
          </p>

          <div className='flex items-center border border-gray-200 rounded-lg p-3 bg-gray-50'>
            <img src={text} alt='text' className='mr-2 h-4 w-4' />
            <input
              type='text'
              placeholder='텍스트 추가하기'
              value={url}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setUrl(e.target.value)
              }
              className='flex-1 bg-transparent text-base placeholder-gray-500 focus:outline-none'
            />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          className='w-full font-semibold text-base'
        >
          삽입
        </Button>
      </div>
    </div>
  );
};

export default LinkUploadModal;
