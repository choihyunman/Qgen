// src/components/WorkBookCard/WorkBookCard.tsx

interface WorkBookCardProps {
  title: string;
  date: string;
  onClick?: () => void;
}

function WorkBookCard({ title, date, onClick }: WorkBookCardProps) {
  return (
    <div
      onClick={onClick}
      className='flex-1 bg-white rounded-[20px] p-6 flex flex-col justify-between cursor-pointer hover:shadow-lg transition-shadow'
    >
      <h2 className='text-xl font-bold'>{title}</h2>
      <p className='text-gray-500'>{date}</p>
    </div>
  );
}

export default WorkBookCard;
