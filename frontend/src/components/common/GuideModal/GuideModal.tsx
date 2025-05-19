// src/components/common/GuideModal/GuideModal.tsx

import { useState, useEffect } from 'react';
import Button from '@/components/common/Button/Button';
import IconBox from '@/components/common/IconBox/IconBox';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GuideModal({ isOpen, onClose }: GuideModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // localStorage에서 설정 불러오기
  useEffect(() => {
    const shouldShow = localStorage.getItem('showGuideModal');
    if (shouldShow === 'false') {
      onClose();
    }
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('showGuideModal', 'false');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/40' onClick={handleClose} />
      <div className='relative bg-white rounded-2xl w-[90%] max-w-[600px] p-6 flex flex-col items-center shadow-lg z-10'>
        <button
          onClick={handleClose}
          className='absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100'
        >
          <IconBox name='x' size={20} className='text-gray-400' />
        </button>

        <div className='w-16 h-16 mb-4'>
          <img src='/images/dolpin-with-tablet.png' alt='돌고래 아이콘' />
        </div>

        <h2 className='text-xl font-bold mb-4'>Q-gen 서비스 이용 가이드</h2>

        <div className='text-gray-600 text-center mb-6 space-y-4'>
          <p>안녕하세요! Q-gen을 이용해주셔서 감사합니다.</p>
          <p>Q-gen은 다음과 같은 기능을 제공합니다:</p>
          <ul className='text-left list-disc pl-6 space-y-2'>
            <li>문제집 생성 및 관리</li>
            <li>PDF, 링크, 텍스트 등 다양한 형태의 자료 업로드</li>
            <li>AI 기반 시험지 자동 생성</li>
            <li>문제 풀이 및 학습 이력 관리</li>
          </ul>
        </div>

        <div className='flex items-center gap-2 mb-6'>
          <div
            onClick={() => setDontShowAgain(!dontShowAgain)}
            className='relative w-5 h-5 cursor-pointer flex-shrink-0'
          >
            <div
              className={`absolute inset-0 rounded border-2 transition-colors duration-200
                ${
                  dontShowAgain
                    ? 'border-purple-500 bg-purple-500'
                    : 'border-gray-300 hover:border-purple-300'
                }`}
            />
            {dontShowAgain && (
              <IconBox
                name='checkW'
                size={16}
                className='absolute inset-0 m-auto text-white'
              />
            )}
          </div>
          <label
            htmlFor='dontShowAgain'
            className='text-sm text-gray-600 cursor-pointer'
            onClick={() => setDontShowAgain(!dontShowAgain)}
          >
            다음에 다시 보지 않기
          </label>
        </div>

        <Button variant='filled' className='w-full' onClick={handleClose}>
          확인
        </Button>
      </div>
    </div>
  );
}
