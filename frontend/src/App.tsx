import './App.css';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './components/layout/Header/Header';
import Footer from './components/layout/Footer/Footer';
import ArcBackground from './components/layout/Background/ArcBackground';
import BlurBackground from './components/layout/Background/BlurBackground';
import ScrollToTop from './components/Scroll/ScrollToTop';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import PCRecommendModal from './components/common/PCRecommendModal/PCRecommendModal';
import { connectSSE, disconnectSSE } from '@/utils/sse';

function App() {
  const userId = useAuth().userId;
  const isConnected = useRef(false);
  const location = useLocation();

  // 페이지 타입 계산을 메모이제이션
  const { isArcPage, mainPageType } = useMemo(() => {
    const isArcPage =
      location.pathname.startsWith('/quiz') ||
      location.pathname.startsWith('/note');
    return {
      isArcPage,
      mainPageType: isArcPage ? 'fixed' : ('default' as const),
    };
  }, [location.pathname]);

  // SSE 연결 관리
  useEffect(() => {
    if (!userId || isConnected.current) return;

    connectSSE(userId);
    isConnected.current = true;

    return () => {
      if (isConnected.current) {
        disconnectSSE();
        isConnected.current = false;
      }
    };
  }, [userId]);

  // PC 추천 모달 상태 관리
  const [showPCRecommend, setShowPCRecommend] = useState(false);

  // 화면 크기 체크 로직을 메모이제이션
  const checkScreenWidth = useCallback(() => {
    const isSmallScreen = window.innerWidth <= 1024;
    const isPCVersion =
      new URLSearchParams(window.location.search).get('pc') === '1';
    setShowPCRecommend(isSmallScreen && !isPCVersion);
  }, []);

  useEffect(() => {
    checkScreenWidth();
    window.addEventListener('resize', checkScreenWidth);
    return () => window.removeEventListener('resize', checkScreenWidth);
  }, [checkScreenWidth]);

  const BackgroundComponent = isArcPage ? ArcBackground : BlurBackground;

  return (
    <div className='flex flex-col w-full'>
      <ScrollToTop />
      <BackgroundComponent>
        <div
          className={twMerge(
            'flex flex-col flex-1 pb-4',
            mainPageType === 'fixed' ? 'h-screen' : ''
          )}
        >
          <Header />
          <main
            className={twMerge(
              'flex-1 py-4 min-h-0',
              mainPageType === 'fixed' ? 'h-full' : ''
            )}
          >
            <Outlet />
          </main>
        </div>
        <Footer />
      </BackgroundComponent>
      <ToastContainer
        position='top-right'
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <PCRecommendModal
        isOpen={showPCRecommend}
        onClose={() => setShowPCRecommend(false)}
      />
    </div>
  );
}

export default App;
