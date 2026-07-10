'use client';

import React, { useEffect, useState } from 'react';
import SidePanel from '@/components/sidePanel';
import { Post, Profile } from '@/types';
import { fetchProfile } from '@/services/profile.service';
import { fetchAllArchivedPosts } from '@/services/posts.service';
import PostTile from '@/components/feedPage/postTile';

const Page = () => {
  const [curProfile, setCurProfile] = useState<Profile | null>(null);
  const [archivedPosts, setArchivedPosts] = useState<Post[] | null>(null);
  const [isArchivedPostsLoading, setIsArchivedPostsLoading] = useState(false);

  useEffect(() => {
    fetchProfile().then(setCurProfile);
  }, []);

  useEffect(() => {
    setIsArchivedPostsLoading(true);
    fetchAllArchivedPosts()
      .then(setArchivedPosts)
      .finally(() => setIsArchivedPostsLoading(false));
  }, []);

  return (
    <div
      className={`flex flex-row min-h-screen w-full justify-center items-center`}
    >
      {' '}
      <SidePanel curProfile={curProfile} />
      <main className={'flex flex-col ml-72 gap-[2px] w-full max-w-2xl'}>
        {isArchivedPostsLoading ? (
          <p>loading...</p>
        ) : archivedPosts?.length === 0 ? (
          <p>There are no posts yet</p>
        ) : (
          archivedPosts?.map((post) => (
            <PostTile post={post} key={post.postId} />
          ))
        )}
      </main>
    </div>
  );
};

export default Page;
