import React from 'react';
import Image from 'next/image';
import Line from '@/components/line';

type ErrorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  message: string | null;
};

const ErrorModal = ({ isOpen, onClose, message }: ErrorModalProps) => {
  if (!isOpen) return null;
  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center items-center backdrop-blur-xs bg-black/50 min-h-screen`}
    >
      <div
        className={
          'flex flex-col min-w-[500px] rounded-[30px] bg-[#eaddff] justify-center items-center gap-3 pl-4 pr-4 pb-4 pt-2'
        }
      >
        <div className={'flex flex-row w-full items-center'}>
          <button
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
          <span className={'ml-40 font-bold text-[27px]'}>Error</span>
        </div>
        <Line />
        <span
          className={
            'font-bold text-[20px] w-full justify-center items-center m-5 pl-3'
          }
        >
          {message}
        </span>
      </div>
    </div>
  );
};

export default ErrorModal;
