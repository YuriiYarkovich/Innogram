import React from 'react';
import Image from 'next/image';

type AddParticipantsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const AddParticipantsModal = ({
  isOpen,
  onClose,
}: AddParticipantsModalProps) => {
  if (!isOpen) return null;
  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center items-center backdrop-blur-xs bg-black/50 min-h-screen`}
    >
      <div
        className={
          'flex flex-col min-w-[400px] rounded-[30px] bg-[#eaddff] justify-center items-center gap-3 pt-2 pb-5'
        }
      >
        <div className={'flex flex-row w-full items-center pl-3.5'}>
          <button
            type={'button'}
            onClick={onClose}
            className={`flex justify-center items-center min-w-[47px] min-h-[47px]`}
          >
            <Image
              src={'/images/icons/back.png'}
              alt={'Back arrow icon'}
              height={30}
              width={30}
              className={`hover:min-h-[37px] hover:min-w-[37px]`}
            />
          </button>
          <span className={'font-bold text-[18px] ml-9'}>
            Pick participants to add:{' '}
          </span>
          <button
            type={'button'}
            onClick={onClose}
            className={
              'flex items-center justify-center ml-auto mr-4 min-w-[47px] min-h-[47px] cursor-pointer'
            }
          >
            <Image
              src={'/images/icons/apply.svg'}
              alt={'add participants button'}
              height={30}
              width={30}
              draggable={false}
              className={`hover:min-h-[37px] hover:min-w-[37px]`}
            />
          </button>
        </div>
        <div
          className={
            'flex flex-col outline-1 min-w-[350px] min-h-[200px] max-h-[500px] overflow-y-auto'
          }
        ></div>
      </div>
    </div>
  );
};

export default AddParticipantsModal;
