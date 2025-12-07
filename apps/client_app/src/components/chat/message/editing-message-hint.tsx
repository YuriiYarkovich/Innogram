import React from 'react';
import Line from '@/components/line';
import Image from 'next/image';
import { Message } from '@/types';

const EditingMessageHint = ({
  editingMessage,
  onClose,
}: {
  editingMessage: Message | null;
  onClose: () => void;
}) => {
  return (
    <>
      <Line thickness={2} color={'#79747e'} />
      <div className={'flex flex-row gap-5 w-full'}>
        <Image
          src={'/images/icons/edit.svg'}
          alt={'Edit icon'}
          height={30}
          width={30}
          draggable={false}
        />
        <div className={'flex flex-col gap-1'}>
          <span className={'font-bold'}>Editing</span>
          <span>{editingMessage?.content}</span>
        </div>
        <div className={'flex items-center ml-auto'}>
          <button
            onClick={() => onClose()}
            className={
              'flex items-center justify-center md:w-[37px] md:h-[37px]'
            }
          >
            <Image
              src={'/images/icons/cross.svg'}
              alt={'cancel replying icon'}
              width={30}
              height={30}
              draggable={false}
              className={'hover:md:w-[37px] hover:md:h-[37px]'}
            />
          </button>
        </div>
      </div>
    </>
  );
};

export default EditingMessageHint;
