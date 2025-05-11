interface GradientTitleProps {
  before?: string; // 하이라이트 앞에 올 일반 텍스트
  highlight: string; // 그라데이션 강조 텍스트
  after?: string; // 하이라이트 뒤에 올 일반 텍스트
  className?: string;
}

export default function GradientTitle({
  before = '',
  highlight,
  after = '',
  className,
}: GradientTitleProps) {
  return (
    <h2 className={`text-4xl font-extrabold flex items-end ${className ?? ''}`}>
      {before && <span className='text-black mr-1'>{before}</span>}
      <span className='bg-gradient-to-r from-[#6D6DFF] to-[#B16DFF] text-transparent bg-clip-text'>
        {highlight}
      </span>
      {after && <span className='text-black ml-1'>{after}</span>}
    </h2>
  );
}
