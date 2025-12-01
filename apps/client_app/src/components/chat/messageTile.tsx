import React from 'react';
import Image from 'next/image';
import { formatTime } from '@/utils/time';
import { Message } from '@/types';

const MessageTile = ({
  message,
  fileUrl,
}: {
  message: Message;
  fileUrl?: string;
}) => {
  return (
    <div className={'flex flex-col w-full h-[80px] pl-3 pt-1.5 gap-1'}>
      <a
        className={'text-[15px] text-[#79747e] cursor-pointer'}
        href={`/profile/${message.authorUsername}`}
      >
        {message.authorUsername}
      </a>
      <div className={'flex flex-row gap-3'}>
        <a
          className={
            'flex rounded-full outline-[#79747e] outline-1 md:w-[40px] md:h-[40px] cursor-pointer'
          }
          href={`/profile/${message.authorUsername}`}
        >
          <Image
            src={message.authorAvatarUrl || '/images/avaTest.png'}
            alt={'Author avatar'}
            height={40}
            width={40}
            unoptimized
            draggable={false}
            className={'rounded-[inherit]'}
          />
        </a>
        <div
          className={
            'flex min-w-[150px] bg-[#efefef] rounded-[20px] pl-3 items-center pr-2.5 gap-6'
          }
        >
          <span className={'text-[17px] w-7/8'}>{message.content}</span>

          <span className={'flex w-1/8 text-[15px] text-[#79747e] justify-end'}>
            {message.createdAt ? formatTime(message.createdAt) : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageTile;
