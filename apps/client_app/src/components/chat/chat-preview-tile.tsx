import React from 'react';
import Image from 'next/image';
import { MessageReadStatus } from '@innogram/core-microservice/dist/common/enums/message.enum';
import { formatTime } from '@/utils/time';
import { Chat } from '@/types';
import { MouseEvent } from 'react';

type ChatPreviewProps = {
  chat: Chat;
  currentChatId: string | undefined;
  onClick: () => void;
  onOptionsButtonClick: (e: MouseEvent<HTMLButtonElement>, chat: Chat) => void;
};

const ChatPreviewTile = ({
  chat,
  currentChatId,
  onClick,
  onOptionsButtonClick,
}: ChatPreviewProps) => {
  return (
    <div
      className={`flex flex-row w-full gap-3 p-3 items-center border-[#79747e] border-1 cursor-pointer ${currentChatId === chat.id ? 'bg-[#eaddff]' : ''}`}
      onClick={onClick}
    >
      <div
        className={
          'flex justify-center rounded-full min-w-[70px] md:h-[70px] border-[#79747e] border-1'
        }
      >
        <Image
          src={chat.avatarUrl || '/images/avaTest.png'}
          alt={'chatAvatarUrl'}
          width={70}
          height={70}
          draggable={false}
          unoptimized
          className={`object-cover rounded-[inherit]`}
        />
      </div>
      <div className={'flex flex-col gap-2'}>
        <span className={'text-[18px] font-bold'}>{chat.title}</span>
        <div className={'flex flex-row gap-2'}>
          <span className={'text-[15px] line-clamp-2'}>
            {chat.lastMessageContent}
          </span>
          <span className={'text-[15px] text-[#79747e]'}>
            {chat.lastMessageCreatedAt
              ? formatTime(chat.lastMessageCreatedAt)
              : ''}
          </span>
        </div>
      </div>
      {chat.lastMessageRead === MessageReadStatus.UNREAD ? (
        <div
          className={
            'min-w-[10px] min-h-[10px] rounded-full ml-auto bg-blue-500'
          }
        />
      ) : (
        <></>
      )}
      <button
        className={
          'flex items-center justify-center min-h-[32px] min-w-[32px] ml-auto'
        }
        onClick={(e) => onOptionsButtonClick(e, chat)}
      >
        <Image
          src={'/images/icons/options.svg'}
          alt={'options button image'}
          height={25}
          width={25}
          draggable={false}
          className={'hover:md:w-[32px] hover:md:h-[32px]'}
        />
      </button>
    </div>
  );
};

export default ChatPreviewTile;
