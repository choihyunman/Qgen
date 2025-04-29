interface SmallBtnProps {
    text: string;
    onClick?: () => void;
  }
  
  function SmallBtn({ text, onClick }: SmallBtnProps) {
    return (
      <button
        onClick={onClick}
        className="px-3 py-1 text-sm rounded-full bg-black text-white  bg-none "
      >
        {text}
      </button>
    );
  }
  
  export default SmallBtn;