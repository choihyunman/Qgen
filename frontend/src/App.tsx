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
    <BackgroundComponent>
      <div className='main min-h-screen flex flex-col'>
        <Header />
        <main className='flex-1 h-[calc(100vh-100px)] py-6'>
          <Outlet />
        </main>
        <Footer />
      </div>
    </BackgroundComponent>
  );
}

export default App;
