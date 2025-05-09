import React from 'react';
import { useNavigate } from 'react-router-dom';
import googleLogo from '@/assets/images/Google.png';

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className='h-full flex flex-col justify-center items-center mt-24 mb-24'>
      <div className='w-full max-w-sm mx-auto rounded-3xl shadow-sm bg-white p-8 flex flex-col items-center gap-6'>
        {/* 로고/타이틀 */}
        <img src={googleLogo} alt='Google Logo' className='w-12 h-12 mb-2' />
        <h1 className='text-2xl font-bold text-gray-900 mb-0.5 text-center'>
          로그인
        </h1>
        <p className='text-gray-500 text-center mb-4 text-base'>
          구글 계정으로 간편하게 로그인하세요.
        </p>
        {/* 구글 로그인 버튼 */}
        <button
          className='flex items-center justify-center w-full gap-3 py-3 px-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all text-gray-700 font-semibold text-base focus:outline-none focus:ring-2 focus:ring-[#754AFF] cursor-pointer'
          onClick={() => {
            window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/google`;
          }}
        >
          <img src={googleLogo} alt='Google' className='w-6 h-6' />
          <span>구글 계정으로 로그인</span>
        </button>
        {/* 부가 안내 */}
        <div className='w-full text-center mt-2'>
          <span className='text-sm text-gray-400'>아직 회원이 아니신가요?</span>
          <button
            className='ml-2 text-[#754AFF] text-sm font-semibold hover:underline cursor-pointer'
            onClick={() => navigate('/signup')}
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
