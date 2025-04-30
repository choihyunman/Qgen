import React from 'react';

interface BlurBackgroundProps {
  children: React.ReactNode;
}

const BlurBackground = ({ children }: BlurBackgroundProps) => {
  return (
    <div className='min-h-screen w-screen bg-gradient-to-tr from-[#E6CAF4] via-[#F9F5FF] to-[#CAC7FC]'>
      {children}
    </div>
  );
};

export default BlurBackground;
