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
import { useEffect, useState } from 'react';
import PCRecommendModal from './components/common/PCRecommendModal/PCRecommendModal';
import StickyGuideButton from './components/common/StickyGuideButton/StickyGuideButton';
import GuideModal from './components/common/GuideModal/GuideModal';
import { useModalStore } from '@/stores/modalStore';

function App() {
  useAuth(); // 앱 전체에서 한 번만 인증 동기화
  const [showPCRecommend, setShowPCRecommend] = useState(false);

  // 초기값을 null로 설정하여 첫 렌더링 여부를 체크
  const [showGuideModal, setShowGuideModal] = useState(false);
  // const [guideModalReady, setGuideModalReady] = useState<boolean | null>(null);

  const { showBasicGuideModal, setShowBasicGuideModal } = useModalStore();

  const arcPages = ['/quiz', '/note'];
  const location = useLocation();
  const isArcPage = arcPages.some((path) => location.pathname.startsWith(path));

  // 보여줄 경로 배열 (원하는 경로로 수정)
  const showGuideButtonPaths = ['/generate', '/list', '/note'];
  // 현재 경로가 배열에 포함되는지 체크
  const shouldShowGuideButton = showGuideButtonPaths.some((path) =>
    location.pathname.startsWith(path)
  );

  // mainPageType: 'default' | 'fixed' 두 가지 타입 사용
  let mainPageType: 'default' | 'fixed' = 'default';
  if (
    location.pathname.startsWith('/quiz') ||
    location.pathname.startsWith('/note') ||
    location.pathname.startsWith('/login')
  ) {
    mainPageType = 'fixed';
  }

  const BackgroundComponent = isArcPage ? ArcBackground : BlurBackground;

  useEffect(() => {
    const alreadyChecked = localStorage.getItem('hidePCRecommend');
    if (alreadyChecked === 'true') {
      setShowPCRecommend(false);
      return;
    }

    // 화면 너비 체크 함수
    const checkScreenWidth = () => {
      const isSmallScreen = window.innerWidth <= 1024;
      const isPCVersion =
        new URLSearchParams(window.location.search).get('pc') === '1';
      setShowPCRecommend(isSmallScreen && !isPCVersion);
    };

    // 초기 체크
    checkScreenWidth();

    // 화면 크기 변경 시 체크
    window.addEventListener('resize', checkScreenWidth);

    // 클린업
    return () => {
      window.removeEventListener('resize', checkScreenWidth);
    };
  }, []);

  // 최초접속 안내 모달(localStorage로 제어)
  // 최초접속 안내 모달(localStorage로 제어) - 초기 렌더링 시 한 번만 실행
  useEffect(() => {
    const showGuideModalCheck = localStorage.getItem('showGuideModal');
    // 'true'인 경우에만 모달을 표시 (명시적으로 'false'로 설정되지 않은 경우 처음 방문 사용자에게는 표시)
    setShowGuideModal(showGuideModalCheck !== 'false');
  }, []); // 빈 의존성 배열로 마운트 시 한 번만 실행

  // PC 권장 모달 닫기
  const handleClosePCRecommend = () => {
    localStorage.setItem('hidePCRecommend', 'true');
    setShowPCRecommend(false);
  };

  // StickyGuideButton 클릭 시 토글
  const handleToggleBasicGuideModal = () => {
    setShowBasicGuideModal(!showBasicGuideModal);
  };

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
              'flex-1 py-8 px-3 min-h-0',
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
        onClose={handleClosePCRecommend}
      />
      {/* 최초접속 안내 모달 - null 체크 추가 */}
      <GuideModal
        isOpen={showGuideModal}
        onClose={() => {
          setShowGuideModal(false);
        }}
      />
      {/* StickyGuideButton 클릭 시 토글되는 모달 */}
      <GuideModal
        mode='basic'
        isOpen={showBasicGuideModal}
        onClose={() => setShowBasicGuideModal(false)}
      />
      {shouldShowGuideButton && (
        <StickyGuideButton onClick={handleToggleBasicGuideModal} />
      )}
    </div>
  );
}

export default App;
