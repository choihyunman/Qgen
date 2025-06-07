import { useEffect, useState } from 'react';
import { FiChevronUp } from 'react-icons/fi';

export default function ScrollToTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 200);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`
        fixed bottom-8 right-8 z-50 bg-white border border-gray-200 rounded-full p-3 shadow-md 
        hover:scale-110 transition-all duration-300 flex items-center justify-center cursor-pointer
        ${show ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'}
        transition-transform transition-opacity
      `}
      aria-label='맨 위로'
      style={{ willChange: 'transform, opacity' }}
    >
      <FiChevronUp className='text-2xl text-gray-800' />
    </button>
  );
}
