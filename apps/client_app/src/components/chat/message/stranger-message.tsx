import { Message } from '@/types';
import Image from 'next/image';
import { MessageVisibilityStatus } from '@innogram/core-microservice/dist/common/enums/message.enum';
import { formatTime } from '@/utils/time';
import MessageCore from '@/components/chat/message/message-core';

const StrangerMessage = ({ message }: { message: Message }) => {
  return (
    <>
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
        <MessageCore message={message} isCurrentUserAuthor={false} />
      </div>
    </>
  );
};

export default StrangerMessage;
