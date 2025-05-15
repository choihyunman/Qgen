import SmallBtn from '@/components/common/SmallBtn/SmallBtn';
import { Link } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';

export default function Header() {
  const userId = useUserStore((s) => s.userId);
  // 로그아웃 핸들러는 App에서 prop으로 내려주거나, zustand에서 관리하는 구조로 변경 필요

  return (
    <header className='w-full flex items-center justify-between px-8 py-4 bg-white rounded-full shadow-[0_0_24px_0_rgba(0,0,0,0.08)]'>
      <Link to='/'>
        <h2 className='text-3xl font-bold cursor-pointer'>Q-gen</h2>
      </Link>
      <div className='flex items-center gap-3'>
        <Link
          to='/list'
          className='text-base font-medium cursor-pointer hover:text-purple-600 transition-colors'
        >
          문제집 목록
        </Link>
        {userId ? (
          <SmallBtn
            text='로그아웃'
            onClick={() => {
              /* 로그아웃 핸들러 필요시 prop으로 전달 */
            }}
          />
        ) : (
          <Link to='/login'>
            <SmallBtn text='로그인' />
          </Link>
        )}
      </div>
    </header>
  );
}
