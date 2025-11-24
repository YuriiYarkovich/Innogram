import React from 'react';
import Image from 'next/image';

type ChatPreviewProps = {
  chatAvatarUrl: string;
  chatName: string;
  lastMessage: string;
  lastMessageTimePast: number;
  lastMessageRead: boolean;
};

const ChatPreviewTile = ({
  chatAvatarUrl,
  chatName,
  lastMessage,
  lastMessageTimePast,
  lastMessageRead,
}: ChatPreviewProps) => {
  return (
    <div
      className={
        'flex flex-row w-full gap-4 p-3 items-center border-[#79747e] border-1 cursor-pointer'
      }
    >
      <div
        className={
          'flex justify-center rounded-full md:w-[70px] md:h-[70px] border-[#79747e] border-1'
        }
      >
        <Image
          src={chatAvatarUrl}
          alt={'chatAvatarUrl'}
          width={70}
          height={70}
          draggable={false}
          unoptimized
          className={`object-cover rounded-[inherit]`}
        />
      </div>
      <div className={'flex flex-col gap-2'}>
        <span className={'text-[18px] font-bold'}>{chatName}</span>
        <div className={'flex flex-row gap-2'}>
          <span className={'text-[15px]'}>{lastMessage}</span>
          <span className={'text-[15px] text-[#79747e]'}>
            {lastMessageTimePast >= 24
              ? `${Math.floor(lastMessageTimePast / 24)} d`
              : `${lastMessageTimePast} h`}
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
