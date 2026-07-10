import Image from 'next/image';

const AddChatButton = ({
  onAddChatButtonClick,
}: {
  onAddChatButtonClick: () => void;
}) => {
  return (
    <button
      onClick={onAddChatButtonClick}
      className={
        'flex items-center justify-center min-h-[47px] min-w-[47px] rounded-full cursor-pointer'
      }
    >
      <Image
        src={'/images/icons/add.svg'}
        alt={'Add icon'}
        width={40}
        height={40}
        className={'rounded-[inherit] hover:md:w-[47px] hover:md:h-[47px] '}
      />
    </button>
  );
};

export default AddChatButton;
