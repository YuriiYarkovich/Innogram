'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { CONFIG } from '@/config/apiRoutes';

export default function PostPreviewModal({
  post,
  isOpen,
  onClose,
}: PostPreviewModalProps) {
  if (!isOpen) return null;

  const [profileAvatarUrl] = useState<string>(
    post.profileAvatarUrl || `/images/avaTest.png`,
  );
  const [liked, setLiked] = useState(post.liked);
  const [likesCount, setLikesCount] = useState<number>(Number(post.likesCount));

  const likeOrUnlikePost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!liked) {
      const response: Response = await fetch(
        `${CONFIG.API.LIKE_POST}${post.postId}`,
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
        `${CONFIG.API.UNLIKE_POST}${post.postId}`,
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
    <div
      className={`fixed inset-0 z-50 flex justify-center items-center backdrop-blur-xs bg-black/50 min-h-screen`}
    >
      <button className={`fixed top-0 right-0`} onClick={onClose}>
        <Image
          src={`/images/icons/cross.svg`}
          alt={'Cross'}
          width={50}
          height={50}
          className={`hover:md:w-[57px] hover:md:h-[57px] cursor-pointer`}
          draggable={false}
        />
      </button>
      <div className={`flex w-full md:h-[554px] justify-center`}>
        <div
          className={`flex flex-row items-center md:w-[1054px] h-full bg-[#eaddff] rounded-4xl`}
        >
          <div
            className={`flex flex-col w-1/2 justify-center h-full bg-black rounded-l-4xl`}
          >
            <Image
              src={post.assets[0].url}
              alt={`Post image`}
              width={512}
              height={512}
              unoptimized
              className={`w-full h-1/2`}
              draggable={false}
            />
          </div>
          <div className={`flex flex-col w-1/2 h-full`}>
            <div className={`flex flex-row h-1/6 gap-4 p-3.5`}>
              <Image
                src={profileAvatarUrl}
                alt={`Profile avatar url`}
                width={50}
                height={50}
                unoptimized
                className={`rounded-full md:w-15 md:h-15`}
                draggable={false}
              />
              <span className={`font-bold text-[20px] mt-4`}>
                {post.username}
              </span>
            </div>
            <span className={`p-5 text-[18px]`}>{post.content}</span>
            <div className={`flex flex-row ml-[15px] mt-[10px]`}>
              <div
                className={
                  'flex items-center justify-center md:w-[45px] md:h-[45px]'
                }
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
                className={
                  'flex items-center justify-center md:w-[45px] md:h-[45px]'
                }
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
            <span className={`font-bold text-[16px] mt-3.5 ml-6`}>
              {likesCount} likes
            </span>
            <span className={`text-[15px] text-[#79747e] mt-2 ml-6`}>
              {post.timePast} h
            </span>
            {/*TODO add comments section when comments functionality would be ready*/}
          </div>
        </div>
      </div>
    </div>
  );
}
