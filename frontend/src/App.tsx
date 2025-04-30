import './App.css';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './components/layout/Header/Header';
import Footer from './components/layout/Footer/Footer';
import ArcBackground from './components/layout/Background/ArcBackground';
import BlurBackground from './components/layout/Background/BlurBackground';

function App() {
  const location = useLocation();

  // 예시: /special로 시작하면 ArcBackground, 아니면 BlurBackground
  const isArcPage = location.pathname.startsWith('/quiz');
  const BackgroundComponent = isArcPage ? ArcBackground : BlurBackground;

  return (
    <BackgroundComponent>
      <div className='main'>
        <Header />
        <main>
          <Outlet />
        </main>
        <Footer />
      </div>
    </BackgroundComponent>
  );
}

export default App;
