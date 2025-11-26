import React from 'react';
import Image from 'next/image';

type ChatPreviewProps = {
  chatAvatarUrl?: string;
  chatTitle: string;
  lastMessageContent?: string;
  lastMessageCreatedAt?: string;
  lastMessageRead?: boolean;
  onClick: () => void;
};

const ChatPreviewTile = ({
  chatAvatarUrl,
  chatTitle,
  lastMessageContent,
  lastMessageCreatedAt,
  lastMessageRead,
  onClick,
}: ChatPreviewProps) => {
  return (
    <div
      className={
        'flex flex-row w-full gap-4 p-3 items-center border-[#79747e] border-1 cursor-pointer'
      }
      onClick={onClick}
    >
      <div
        className={
          'flex justify-center rounded-full md:w-[70px] md:h-[70px] border-[#79747e] border-1'
        }
      >
        <Image
          src={chatAvatarUrl || '/images/avaTest.png'}
          alt={'chatAvatarUrl'}
          width={70}
          height={70}
          draggable={false}
          unoptimized
          className={`object-cover rounded-[inherit]`}
        />
      </div>
      <div className={'flex flex-col gap-2'}>
        <span className={'text-[18px] font-bold'}>{chatTitle}</span>
        <div className={'flex flex-row gap-2'}>
          <span className={'text-[15px]'}>{lastMessageContent}</span>
          <span className={'text-[15px] text-[#79747e]'}>
            {lastMessageCreatedAt ? lastMessageCreatedAt : ''}
          </span>
        </div>
      </div>
      {!lastMessageRead ? (
        <div className={'md:w-[10px] md:h-[10px] rounded-full ml-18'} />
      ) : (
        <></>
      )}
    </div>
  );
};

export default ChatPreviewTile;
