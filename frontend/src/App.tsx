import './App.css';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './components/layout/Header/Header';
import Footer from './components/layout/Footer/Footer';
import ArcBackground from './components/layout/Background/ArcBackground';
import BlurBackground from './components/layout/Background/BlurBackground';

function App() {
  const arcPages = ['/quiz', '/incorrect'];
  const location = useLocation();
  const isArcPage = arcPages.some((path) => location.pathname.startsWith(path));

  const BackgroundComponent = isArcPage ? ArcBackground : BlurBackground;

  return (
    <div className='flex flex-col w-full'>
      <BackgroundComponent>
        <div className='flex flex-col flex-1 h-screen pb-4'>
          <Header />
          <main className='flex-1 py-4 h-full min-h-0'>
            <Outlet />
          </main>
        </div>
        <Footer />
      </BackgroundComponent>
    </div>
  );
}

export default App;
