import React from 'react';
import Image from 'next/image';

type MessageTileProps = {
  authorUsername: string;
  authorAvatarUrl: string;
  content: string;
  fileUrl?: string;
};

const MessageTile = ({
  authorUsername,
  authorAvatarUrl,
  content,
  fileUrl,
}: MessageTileProps) => {
  return (
    <div className={'flex flex-col w-full h-[80px] pl-3 pt-1.5 gap-1'}>
      <span className={'text-[15px] text-[#79747e]'}>{authorUsername}</span>
      <div className={'flex flex-row gap-3'}>
        <div
          className={
            'flex rounded-full outline-[#79747e] outline-1 md:w-[40px] md:h-[40px]'
          }
        >
          <Image
            src={authorAvatarUrl}
            alt={'Author avatar'}
            height={40}
            width={40}
            unoptimized
            draggable={false}
            className={'rounded-[inherit]'}
          />
        </div>
        <div
          className={
            'flex min-w-[200px] bg-[#efefef] rounded-[20px] pl-3 items-center'
          }
        >
          <span className={'text-[17px]'}>{content}</span>
        </div>
      </div>
    </div>
  );
};

export default MessageTile;
