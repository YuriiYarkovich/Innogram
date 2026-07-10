import React from 'react';
import Image from 'next/image';
import { Message } from '@/types';
import MessageCore from '@/components/chat/message/message-core';

const AuthorMessage = ({ message }: { message: Message }) => {
  return (
    <>
      <a
        className={'text-[15px] text-[#79747e] cursor-pointer ml-auto mr-4'}
        href={`/profile/${message.authorUsername}`}
      >
        {message.authorUsername}
      </a>
      <div className={'flex flex-row gap-3 ml-auto mr-4'}>
        <MessageCore message={message} isCurrentUserAuthor={true} />
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
            loading={'eager'}
            draggable={false}
            className={'rounded-[inherit]'}
          />
        </a>
      </div>
    </>
  );
};

export default AuthorMessage;
