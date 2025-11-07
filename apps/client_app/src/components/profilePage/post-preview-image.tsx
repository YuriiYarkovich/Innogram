'use client';
import Image from 'next/image';
import React from 'react';

const PostPreviewImage = ({ imageUrl = `/images/avaTest.png` }) => {
  return (
    <button className={`flex md:w-[177px] md:h-[380px] cursor-pointer`}>
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
