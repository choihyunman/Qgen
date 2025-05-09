import { useEffect } from 'react';
import Button from '@/components/common/Button/Button';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import confetti from 'canvas-confetti';

const QuizEnd = () => {
  useEffect(() => {
    // 왼쪽 아래에서 오른쪽 위 대각선(중앙)
    confetti({
      particleCount: 80,
      angle: 45, // 오른쪽 위 대각선
      spread: 35,
      startVelocity: 90,
      origin: { x: 0, y: 1 },
    });
    // 오른쪽 아래에서 왼쪽 위 대각선(중앙)
    confetti({
      particleCount: 80,
      angle: 135, // 왼쪽 위 대각선
      spread: 35,
      startVelocity: 90,
      origin: { x: 1, y: 1 },
    });
  }, []);

  return (
    <div className='w-full'>
      <div className='flex gap-[40px] items-stretch'>
        <div className='w-[800px] mx-auto flex flex-col items-center justify-center min-h-[60vh] bg-white/30 rounded-3xl shadow-sm p-10 animate-fade-in'>
          <div className='mb-2 w-48 h-48 flex items-center justify-center'>
            <DotLottieReact
              src='https://lottie.host/5851c0d5-f978-414e-8d73-8403cb8cded5/XJR5Ma7DBl.lottie'
              autoplay
              style={{ width: 150, height: 150 }}
              speed={1.7}
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
