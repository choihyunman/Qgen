import './App.css';
import { Outlet } from 'react-router-dom';
import Header from './components/layout/Header/Header';
import Footer from './components/layout/Footer/Footer';

function App() {
  return (
    <div className='main-container'>
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}

export default App;
