import SmallBtn from '@/components/common/SmallBtn/SmallBtn';

export default function Header() {
  return (
    <header className='w-full flex items-center justify-between px-8 py-4 bg-white rounded-full shadow-[0_0_24px_0_rgba(0,0,0,0.08)]'>
      <span className='text-3xl font-bold'>Q-gen</span>
      <div className='flex items-center gap-3'>
        <a className='text-base font-medium '>문제집 바로가기</a>
        <SmallBtn text='로그인' />
        <SmallBtn text='가입' outline />
      </div>
    </header>
  );
}
