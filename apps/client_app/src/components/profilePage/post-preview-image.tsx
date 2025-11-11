'use client';
import Image from 'next/image';
import React from 'react';

const PostPreviewImage = ({
  imageUrl = `/images/avaTest.png`,
  onClick,
}: {
  imageUrl: string;
  onClick: () => void;
}) => {
  return (
    <button
      className={`flex md:w-[177px] md:h-[380px] cursor-pointer`}
      onClick={() => onClick()}
    >
      <Image
        src={imageUrl}
        alt={'Post preview image'}
        width={177}
        height={380}
        draggable={false}
        unoptimized
      />
    </button>
  );
};

export default PostPreviewImage;
