'use client';

import Image from 'next/image';
import React from 'react';

type PostTileProps = {
  avatarUrl?: string;
  username?: string;
  timePast?: string;
  contentUrl?: string;
  likesCount?: number;
  postContent?: string;
};

export default function PostTile({
  avatarUrl = `/images/avaTest.png`,
  username = 'LolekBolek',
  timePast = '15h',
  contentUrl = `/images/avaTest.png`,
  likesCount = 228,
  postContent = 'Cool post bla bla bla',
}: PostTileProps) {
  return (
    <div className={`flex flex-col md:w-[470px] md:h-[650px] bg-[#e7e0ec]`}>
      <div
        className={`flex flex-row items-center md:w-full md:h-[40px] mt-[15px] ml-[15px]`}
      >
        <Image
          className={`rounded-[210px] md:w-[40px] md:h-[40px]`}
          src={avatarUrl}
          alt="User avatar"
          width={512}
          height={512}
          draggable={false}
        />
        <span className={`text-black, text-[18px] ml-[15px]`}>{username}</span>
        <span className={`text-[#79747e] text-[14px] ml-[7px]`}>
          {timePast}
        </span>
      </div>
      <div className={`flex flex-row justify-center w-full mt-5`}>
        <Image
          src={contentUrl}
          alt="post picture"
          width={512}
          height={512}
          draggable={false}
          className={`md:w-[440px] md:h-[440px]`}
        />
      </div>
      <div className={`flex flex-row ml-[15px] mt-[10px]`}>
        <div
          className={'flex items-center justify-center md:w-[45px] md:h-[45px]'}
        >
          <button>
            <Image
              src={`/images/icons/emptyHeart.png`}
              alt={`Like icon`}
              width={33}
              height={33}
              draggable={false}
              className={`md:h-[33px] md:w-[33px] hover:md:h-[40px] hover:md:w-[40px]`}
            />
          </button>
        </div>
        <div
          className={'flex items-center justify-center md:w-[45px] md:h-[45px]'}
        >
          <button>
            <Image
              src={`/images/icons/comment.png`}
              alt={`Like icon`}
              width={39}
              height={39}
              draggable={false}
              className={`md:h-[39px] md:w-[39px] mt-[-3px] ml-[5px] hover:md:h-[46px] hover:md:w-[46px]`}
            />
          </button>
        </div>
        <div
          className={'flex items-center justify-center md:w-[45px] md:h-[45px]'}
        >
          <button>
            <Image
              src={`/images/icons/share.png`}
              alt={`Like icon`}
              width={33}
              height={33}
              draggable={false}
              className={`md:h-[33px] md:w-[33px] ml-[16px] mt-[-2px] hover:md:h-[40px] hover:md:w-[40px]`}
            />
          </button>
        </div>
      </div>
      <div className={`flex ml-[20px] mt-[5px]`}>
        <span className={`text-[13px] `}>{likesCount} likes</span>
      </div>
      <div className={`flex flex-row ml-[20px] mt-[7px] gap-3`}>
        <span className={`text-[16px] font-bold`}>{username}</span>
        <span className={`text-[14px] mt-[1px]`}>{postContent}</span>
      </div>
      <div className="flex items-center my-6 w-full">
        <div className={`flex-grow h-[2px] bg-[#624b98]`}></div>
      </div>
    </div>
  );
}
