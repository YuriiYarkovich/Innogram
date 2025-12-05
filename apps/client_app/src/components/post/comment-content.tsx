'use client';

import Image from 'next/image';
import { SERVER } from '@/config/apiRoutes';
import { useState } from 'react';
import { PostComment } from '@/types';

type CommentContentProps = {
  postComment: PostComment;
  onResponseClick: (postComment: PostComment) => void;
  deleteComment: (commentId: string) => void;
};

const CommentContent = ({
  postComment,
  onResponseClick,
  deleteComment,
}: CommentContentProps) => {
  const [liked, setLiked] = useState<boolean>(postComment?.liked || false);
  const [likesAmount, setLikesAmount] = useState<number>(
    Number(postComment?.likesAmount) || 0,
  );

  const likeOrUnlikeComment = async (commentId: string) => {
    if (!liked) {
      const response: Response = await fetch(
        `${SERVER.API.LIKE_COMMENT}${commentId}`,
        {
          method: `POST`,
          credentials: 'include',
        },
      );

      if (!response.ok) {
        const message: string = await response.json();
        console.error(message);
      }

      setLiked((prev) => !prev);
      setLikesAmount((prev) => prev + 1);
    } else {
      const response: Response = await fetch(
        `${SERVER.API.UNLIKE_COMMENT}${commentId}`,
        {
          method: `DELETE`,
          credentials: 'include',
        },
      );

      if (!response.ok) {
        const message: string = await response.json();
        console.error(message);
      }

      setLiked((prev) => !prev);
      setLikesAmount((prev) => prev - 1);
    }
  };

  return (
    <div className="flex flex-row w-full gap-3 items-start">
      <a
        className="flex-shrink-0 cursor-pointer"
        href={`/profile/${postComment?.authorUsername}`}
      >
        <Image
          src={postComment?.authorAvatarUrl || `/images/avaTest.png`}
          alt="author avatar"
          height={40}
          width={40}
          unoptimized
          draggable={false}
          className="rounded-full w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] md:w-[40px] md:h-[40px] object-cover"
        />
      </a>

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <span className="font-bold text-[14px] sm:text-[15px] truncate">
          {postComment?.authorUsername || `username`}
        </span>

        <span className="text-[13px] sm:text-[14px] break-words leading-relaxed">
          {postComment?.commentContent ||
            `Comment content sdfhasdfhal ksdfhalskdjfh alskdjfhalskdjfh`}
        </span>

        <div className="flex flex-row items-center gap-3 sm:gap-4 mt-1">
          <span className="text-[11px] sm:text-[12px] text-gray-600">
            {likesAmount}&nbsp;likes
          </span>

          {(Number(postComment?.timePast) || 5) >= 24 ? (
            <span className="text-[11px] sm:text-[12px] text-gray-600">
              {Math.floor(Number(postComment?.timePast) / 24)}&nbsp;d
            </span>
          ) : (
            <span className="text-[11px] sm:text-[12px] text-gray-600">
              {postComment?.timePast || 5}&nbsp;h
            </span>
          )}

          <button
            className="text-[11px] sm:text-[12px] text-gray-600 hover:text-gray-900 font-medium transition-colors"
            onClick={() => {
              if (postComment) onResponseClick(postComment);
            }}
          >
            Response
          </button>
        </div>
      </div>

      <div className="flex-shrink-0 flex flex-col gap-3 sm:gap-4 items-center">
        <button
          className="transition-transform hover:scale-110 active:scale-95"
          onClick={() => likeOrUnlikeComment(postComment.commentId)}
        >
          <Image
            src={
              liked || false
                ? `/images/icons/heart.png`
                : `/images/icons/emptyHeart.png`
            }
            alt="like comment"
            width={20}
            height={20}
            draggable={false}
            className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] md:w-[22px] md:h-[22px]"
          />
        </button>

        {postComment?.isAuthor && (
          <button
            className="transition-transform hover:scale-110 active:scale-95"
            onClick={() => deleteComment(postComment.commentId)}
          >
            <Image
              src={`/images/icons/delete.svg`}
              alt="delete comment"
              width={20}
              height={20}
              draggable={false}
              className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] md:w-[22px] md:h-[22px]"
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default CommentContent;
