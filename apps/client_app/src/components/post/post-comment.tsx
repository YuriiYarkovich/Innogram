import React, { useState } from 'react';
import Image from 'next/image';
import Line from '@/components/line';
import { CONFIG } from '@/config/apiRoutes';

const PostComment = ({
  postComment,
  onDeleteComment,
}: {
  postComment?: PostComment | null;
  onDeleteComment: () => void;
}) => {
  const [liked, setLiked] = useState<boolean>(postComment?.liked || false);

  const [likesAmount, setLikesAmount] = useState<number>(
    Number(postComment?.likesAmount) || 0,
  );

  const likeOrUnlikeComment = async () => {
    if (!liked) {
      const response: Response = await fetch(
        `${CONFIG.API.LIKE_COMMENT}${postComment?.commentId}`,
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
        `${CONFIG.API.UNLIKE_COMMENT}${postComment?.commentId}`,
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

  const deleteComment = async () => {
    const response: Response = await fetch(
      `${CONFIG.API.DELETE_COMMENT}${postComment?.commentId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      },
    );

    if (!response.ok) {
      const message: string = await response.json();
      console.error(message);
    } else onDeleteComment();
  };

  console.log(`time past: ${postComment?.timePast}`);
  return (
    <div className={`flex flex-col max-h-full`}>
      <div className={`flex flex-row w-full gap-3`}>
        <Image
          src={postComment?.authorAvatarUrl || `/images/avaTest.png`}
          alt={`author avatar`}
          height={40}
          width={40}
          unoptimized
          draggable={false}
          className={`rounded-[270px] md:w-[40px] md:h-[40px]`}
        />
        <div className={`flex flex-col`}>
          <span className={`font-bold text-[15px]`}>
            {postComment?.authorUsername || `username`}
          </span>
          <div className={`flex flex-col`}>
            <div className={`flex flex-row gap-2`}>
              <span className={`text-[12px]`}>{likesAmount}&nbsp;likes</span>
              {(Number(postComment?.timePast) || 5) >= 24 ? (
                <span className={`text-[12px]`}>
                  {Math.floor(Number(postComment?.timePast) / 24)}&nbsp;d
                </span>
              ) : (
                <span className={`text-[12px]`}>
                  {postComment?.timePast || 5}&nbsp;h
                </span>
              )}
            </div>
            <span className={`text-[12px] cursor-pointer hover:font-`}>
              Response
            </span>
          </div>
        </div>
        <span className={`text-[14px] w-3/4 text-center`}>
          {postComment?.commentContent ||
            `Comment content sdfhasdfhal ksdfhalskdjfh alskdjfhalskdjfh`}
        </span>
        <div
          className={`flex md:w-[27px] min-h-full flex-col gap-4 justify-end`}
        >
          <button className={`h-1/2`} onClick={() => likeOrUnlikeComment()}>
            <Image
              src={
                liked || false
                  ? `/images/icons/heart.png`
                  : `/images/icons/emptyHeart.png`
              }
              alt={`like comment`}
              width={20}
              height={20}
              draggable={false}
              className={`md:h-[20px] md:w-[20px] hover:md:h-[27px] hover:md:w-[27px]`}
            />
          </button>
          {postComment?.isAuthor ? (
            <button className={`h-1/2`} onClick={() => deleteComment()}>
              <Image
                src={`/images/icons/delete.svg`}
                alt={`delete comment`}
                width={20}
                height={20}
                draggable={false}
                className={`md:h-[20px] md:w-[20px] hover:md:h-[27px] hover:md:w-[27px]`}
              />
            </button>
          ) : (
            <div />
          )}
        </div>
      </div>
      <Line thickness={1} color={`#624b98`} />
    </div>
  );
};

export default PostComment;
