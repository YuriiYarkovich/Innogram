import Image from 'next/image';

const CrossAngleButton = ({ onClose }: { onClose: () => void }) => {
  return (
    <button
      className={`flex md:h-[57px] md:w-[57px] items-center justify-center fixed top-0 right-0`}
      onClick={onClose}
    >
      <Image
        src={`/images/icons/cross.svg`}
        alt={'Cross'}
        width={50}
        height={50}
        className={`hover:md:w-[57px] hover:md:h-[57px] cursor-pointer`}
        draggable={false}
      />
    </button>
  );
};

export default CrossAngleButton;
