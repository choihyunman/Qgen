// src/components/common/GuideModal/GuideModal.tsx

import { useState, useEffect } from 'react';
import Button from '@/components/common/Button/Button';
import IconBox from '@/components/common/IconBox/IconBox';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GuideSlide {
  image: string;
  title: string;
  description: string;
}

const guideSlides: GuideSlide[] = [
  {
    image: '/images/guideImgs/Guide0-1.png',
    title: '단계1. 문제집 생성을 생성해주세요',
    description: '버튼을 클릭해 Qgen에서는 원하는 주제로 문제집을 만들고 \n ',
  },
  {
    image: '/images/guideImgs/Guide1-1.png',
    title: '단계1. 문제집 생성을 생성해주세요',
    description:
      '버튼을 클릭해 Qgen에서는 원하는 주제로 문제집을 만들고 \n 그 안에서 시험지들을 관리할 수 있습니다.',
  },
  {
    image: '/images/guideImgs/Guide1-2.png',
    title: '단계1. 문제집 생성을 생성해주세요',
    description:
      'Qgen에서는 원하는 주제로 문제집을 만들고 \n 그 안에서 시험지들을 관리할 수 있습니다.',
  },
  {
    image: '/images/guideImgs/Guide2-1.png',
    title: '단계2. 문제집으로 들어가 시험지 생성을 눌러주세요',
    description: '생성한 문제집을 클릭한 후, 시험지 생성을 클릭해 \n ',
  },
  {
    image: '/images/guideImgs/Guide3-1.png',
    title: '단계2. 문제집으로 들어가 시험지 생성을 눌러주세요',
    description:
      '생성한 문제집을 클릭한 후, 시험지 생성을 클릭해 \n 문제 생성 페이지로 이동합니다.',
  },
  {
    image: '/images/guideImgs/Guide3-2.png',
    title: '단계3. 업로드할 공부자료를 첨부합니다.',
    description:
      '문제를 출력하고 싶은 주제의 업로드 할 공부자료를 첨부 합니다.',
  },
  {
    image: '/images/guideImgs/Guide3-3.png',
    title: '단계4. 생성할 문제 유형을 선택해주세요',
    description:
      'Qgen은 객관식, 주관식, OX퀴즈와 같은 다양한 유형을 제공합니다.',
  },
  {
    image: '/images/guideImgs/Guide3-3.png',
    title: '단계4. 시험지 생성하기 버튼을 눌러 생성을 시작합니다.',
    description:
      '업로드한 자료를 바탕으로 AI가 \nRAG 기반 유사도 검색을 통해 정밀한 문제를 생성합니다.  \n ※ 생성은 첨부된 문서 크기나 문제수,  유형에 따라 최대 1분까지 소요될 수 있어요',
  },
  {
    image: '/images/guideImgs/Guide4-1.png',
    title: '단계5. 시험지 생성 및 완료',
    description: '시험지 생성이 완료되면, \n',
  },
  {
    image: '/images/guideImgs/Guide4-2.png',
    title: '단계5. 시험지 생성 및 완료',
    description: '시험지 생성이 완료되면, \n 생성된 시험지가 나타나요!',
  },
  {
    image: '/images/guideImgs/Guide5-1.png',
    title: '생성 이후에는',
    description: '직접 문제를 풀어보고, \n',
  },
  {
    image: '/images/guideImgs/Guide6-1.png',
    title: '생성 이후에는',
    description:
      '직접 문제를 풀어보고,\n 풀이 기록과 학습 이력을 체계적으로 관리할 수 있습니다.',
  },
];

export default function GuideModal({ isOpen, onClose }: GuideModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFading, setIsFading] = useState(false);

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

  const handlePrevSlide = () => {
    if (currentSlide === 0) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentSlide((prev) => prev - 1);
      setIsFading(false);
    }, 300);
  };

  const handleNextSlide = () => {
    if (currentSlide === guideSlides.length - 1) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentSlide((prev) => prev + 1);
      setIsFading(false);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/40' onClick={handleClose} />
      <div className='relative bg-white rounded-2xl w-[90%] max-w-[600px] py-8 px-12 flex flex-col items-center shadow-lg z-10'>
        <button
          onClick={handleClose}
          className='absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100'
        >
          <IconBox name='x' size={20} className='text-gray-400' />
        </button>

        <h2 className='text-3xl font-bold mb-6'>Q-gen 서비스 이용 가이드</h2>

        {/* 슬라이드 컨테이너 */}
        <div className='relative w-full mb-6'>
          <div className='relative min-h-[400px]'>
            {guideSlides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 flex flex-col items-center transition-opacity duration-300 ${
                  currentSlide === index
                    ? 'opacity-100'
                    : 'opacity-0 pointer-events-none'
                }`}
              >
                <div className='w-full mb-4'>
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className='w-full h-full object-contain rounded-lg'
                  />
                </div>
                <div className='min-h-[100px] flex flex-col justify-start items-center'>
                  <h3 className='text-lg font-semibold mb-2'>{slide.title}</h3>
                  <p className='text-gray-600 text-center'>
                    {slide.description.split('\n').map((line, idx) => (
                      <span key={idx}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 네비게이션 버튼 */}
          <button
            onClick={handlePrevSlide}
            disabled={isFading || currentSlide === 0}
            className='absolute left-[-24px] top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <IconBox
              name='chevronDown'
              size={30}
              rotate={90}
              className='text-gray-600 opacity-50'
            />
          </button>
          <button
            onClick={handleNextSlide}
            disabled={isFading || currentSlide === guideSlides.length - 1}
            className='absolute right-[-24px] top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <IconBox
              name='chevronDown'
              size={30}
              rotate={-90}
              className='text-gray-600 opacity-50'
            />
          </button>

          {/* 슬라이드 인디케이터 */}
          <div className='flex justify-center gap-2 mt-4'>
            {guideSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isFading) {
                    setIsFading(true);
                    setTimeout(() => {
                      setCurrentSlide(index);
                      setIsFading(false);
                    }, 300);
                  }
                }}
                disabled={isFading}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentSlide === index ? 'bg-purple-500' : 'bg-gray-300'
                } ${isFading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              />
            ))}
          </div>
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
