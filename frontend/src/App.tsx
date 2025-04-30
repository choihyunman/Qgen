import './App.css';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './components/layout/Header/Header';
import Footer from './components/layout/Footer/Footer';
import ArcBackground from './components/layout/Background/ArcBackground';
import BlurBackground from './components/layout/Background/BlurBackground';

function App() {
  const arcPages = ['/quiz'];
  const location = useLocation();
  const isArcPage = arcPages.some((path) => location.pathname.startsWith(path));

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
