import Button from '@/components/common/Button/Button';
import Lottie from 'lottie-react';
import celebrationAnimation from '@/assets/animations/complete.json'; // JSON 파일 경로는 실제 다운로드한 파일에 맞게 수정해주세요

const QuizEnd = () => {
  return (
    <div className='w-full py-10'>
      <div className='flex gap-[40px] items-stretch'>
        <div className='w-[800px] mx-auto flex flex-col items-center justify-center min-h-[60vh] bg-white/30 rounded-3xl shadow-sm p-10 animate-fade-in'>
          <div className='mb-8 w-64 h-64'>
            <Lottie
              animationData={celebrationAnimation}
              loop={true}
              autoplay={true}
            />
          </div>
          <h2 className='text-3xl font-extrabold text-[#754AFF] mb-4 tracking-tight text-center'>
            연습문제를 모두 풀었어요!
          </h2>
          <p className='text-lg text-gray-700 mb-8 text-center max-w-md'>
            수고하셨습니다!
            <br />
            이제 문제 리스트로 이동해서 다른 문제도 도전해보세요.
          </p>
          <Button
            onClick={() => (window.location.href = '/list')}
            variant='filled'
          >
            문제 리스트로 이동
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizEnd;
