'use client';

import React, { useEffect, useState } from 'react';
import SidePanel from '@/components/sidePanel';
import { Post, Profile } from '@/types';
import { fetchProfile } from '@/services/profile.service';
import PostTile from '@/components/feedPage/postTile';
import { fetchActivity } from '@/services/posts.service';

const Page = () => {
  const [curProfile, setCurProfile] = useState<Profile | null>(null);
  const [postsWithActivity, setPostsWithActivity] = useState<Post[] | null>(
    null,
  );
  const [isPostsWithActivityLoading, setIsPostsWithActivityLoading] =
    useState(false);

  useEffect(() => {
    fetchProfile().then(setCurProfile);
  }, []);

  useEffect(() => {
    setIsPostsWithActivityLoading(true);
    fetchActivity()
      .then(setPostsWithActivity)
      .finally(() => setIsPostsWithActivityLoading(false));
  }, []);

  return (
    <div
      className={`flex flex-row min-h-screen w-full justify-center items-center`}
    >
      {' '}
      <SidePanel curProfile={curProfile} />
      <main className={'flex flex-col ml-72 gap-[2px] w-full max-w-2xl'}>
        {isPostsWithActivityLoading ? (
          <p>loading...</p>
        ) : postsWithActivity?.length === 0 ? (
          <p>There are no posts yet</p>
        ) : (
          postsWithActivity?.map((post) => (
            <PostTile post={post} key={post.postId} />
          ))
        )}
      </main>
    </div>
  );
};

export default Page;
