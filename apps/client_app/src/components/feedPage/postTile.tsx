'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import PostPreviewModal from '@/components/post/post-preview.modal';
import { likeOrUnlikePost } from '@/services/posts.service';

export default function PostTile({ post }: { post: Post }) {
  const [liked, setLiked] = useState(post.liked);
  const [likesCount, setLikesCount] = useState<number>(Number(post.likesCount));
  const [isPostPreviewModalOpen, setIsPostPreviewModalOpen] =
    useState<boolean>(false);

  const handleLikeOrUnlikePost = async (e: React.FormEvent) => {
    e.preventDefault();

    const response: Response = await likeOrUnlikePost(liked, post);

    if (response.ok) {
      setLiked((prev) => !prev);
      setLikesCount((prev) => prev - 1);
    }
  };

  return (
    <div>
      <PostPreviewModal
        post={post}
        isOpen={isPostPreviewModalOpen}
        onClose={() => setIsPostPreviewModalOpen(false)}
      />
      <div className={`flex flex-col md:w-[470px] bg-[#e7e0ec]`}>
        <a
          className={`flex flex-row items-center md:w-full md:h-[40px] mt-[15px] ml-[15px] cursor-pointer`}
          href={`profile/${post.username}`}
        >
          <Image
            className={`rounded-[210px] md:w-[40px] md:h-[40px]`}
            src={post?.profileAvatarUrl || `/images/avaTest.png`}
            alt="User avatar"
            width={512}
            height={512}
            draggable={false}
            unoptimized
          />
          <span className={`text-black, text-[18px] ml-[15px]`}>
            {post.username}
          </span>
          <span className={`text-[#79747e] text-[14px] ml-[7px]`}>
            {Number(post.timePast) >= 24
              ? `${Math.floor(Number(post.timePast) / 24)} d`
              : `${post.timePast} h`}
          </span>
        </a>
        <div className={`flex flex-row justify-center w-full mt-5`}>
          <Image
            src={post.assets[0].url} //TODO add possibility to view multiple files
            alt="post picture"
            width={512}
            height={512}
            draggable={false}
            className={`md:w-[440px] md:h-[440px]`}
            unoptimized
          />
        </div>
        <div className={`flex flex-row ml-[15px] mt-[10px]`}>
          <div
            className={
              'flex items-center justify-center md:w-[45px] md:h-[45px]'
            }
          >
            <button onClick={handleLikeOrUnlikePost}>
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
            <button onClick={() => setIsPostPreviewModalOpen(true)}>
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
        <div className={`flex ml-[20px] mt-[5px]`}>
          <span className={`text-[13px] `}>{likesCount} likes</span>
        </div>
        <div className={`flex flex-row ml-[20px] mt-[7px] gap-3`}>
          <span className={`text-[16px] font-bold`}>{post.username}</span>
          <span className={`text-[14px] mt-[1px]`}>{post.content}</span>
        </div>
        <div className="flex items-center mt-3 w-full">
          <div className={`flex-grow h-[2px] bg-[#624b98]`}></div>
        </div>
      </div>
    </div>
  );
}
