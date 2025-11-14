import React from 'react';
import Image from 'next/image';
import Line from '@/components/line';

const PostComment = ({ postComment }: { postComment?: PostComment | null }) => {
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
          <div className={`flex flex-row gap-5`}>
            <span className={`text-[12px]`}>
              {postComment?.likesAmount || 228}&nbsp;likes
            </span>
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
        </div>
        <span className={`text-[14px]`}>
          {postComment?.commentContent ||
            `Comment content sdfhasdfhal ksdfhalskdjfh alskdjfhalskdjfh`}
        </span>
        <div className={`flex items-center`}>
          <button>
            <Image
              src={
                postComment?.liked || false
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
        </div>
      </div>
      <Line thickness={1} color={`#624b98`} />
    </div>
  );
};

export default PostComment;
