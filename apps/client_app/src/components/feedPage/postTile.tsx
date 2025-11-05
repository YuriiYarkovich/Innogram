'use client';

import Image from 'next/image';
import React, { FormEvent, useState } from 'react';
import { CONFIG } from '@/config/apiRoutes';

type PostTileProps = {
  postId?: string;
  avatarUrl?: string;
  username?: string;
  timePast?: string;
  contentUrl?: string;
  likesCount?: number;
  postContent?: string;
  liked?: boolean;
};

export default function PostTile({
  postId = 'bbf4554a-0fc3-4b69-bcf2-7b30f67413e4',
  avatarUrl = `/images/avaTest.png`,
  username = 'Username',
  timePast = '15h',
  contentUrl = `/images/avaTest.png`,
  likesCount: likesCountFromProps = 228,
  postContent = 'Cool post bla bla bla',
  liked: likedFromProps = false,
}: PostTileProps) {
  const [liked, setLiked] = useState(likedFromProps);
  const [likesCount, setLikesCount] = useState<number>(
    Number(likesCountFromProps),
  );

  const likeOrUnlikePost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!liked) {
      const response: Response = await fetch(
        `${CONFIG.API.LIKE_POST}${postId}`,
        {
          method: 'POST',
          credentials: 'include',
        },
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      if (response.ok) {
        setLiked((prev) => !prev);
        setLikesCount((prev) => prev + 1);
      }
    } else {
      const response: Response = await fetch(
        `${CONFIG.API.UNLIKE_POST}${postId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      if (response.ok) {
        setLiked((prev) => !prev);
        setLikesCount((prev) => prev - 1);
      }
    }
  };

  return (
    <div className={`flex flex-col md:w-[470px] bg-[#e7e0ec]`}>
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
          unoptimized //TODO delete on prod
        />
        <span className={`text-black, text-[18px] ml-[15px]`}>{username}</span>
        <span className={`text-[#79747e] text-[14px] ml-[7px]`}>
          {timePast}h
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
          unoptimized //TODO delete on prod
        />
      </div>
      <div className={`flex flex-row ml-[15px] mt-[10px]`}>
        <div
          className={'flex items-center justify-center md:w-[45px] md:h-[45px]'}
        >
          <button onClick={likeOrUnlikePost}>
            <Image
              src={
                liked
                  ? `/images/icons/heart.png`
                  : `/images/icons/emptyHeart.png`
              }
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
      <div className="flex items-center mt-3 w-full">
        <div className={`flex-grow h-[2px] bg-[#624b98]`}></div>
      </div>
    </div>
  );
}
