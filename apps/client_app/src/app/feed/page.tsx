'use client';

import PostTile from '@/components/feedPage/postTile';
import { useEffect, useState } from 'react';
import SidePanel from '@/components/sidePanel';
import { fetchProfile } from '@/services/profile.service';
import { fetchPostsOfSubscribedOnProfiles } from '@/services/posts.service';

const Page = () => {
  const [curProfile, setCurProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile().then((data: Profile) => setCurProfile(data));
  }, []);

  useEffect(() => {
    fetchPostsOfSubscribedOnProfiles()
      .then((data: Post[]) => {
        setPosts(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div
        className={`flex flex-row min-h-screen w-full justify-center items-center`}
      >
        <SidePanel curProfile={curProfile} />
        <main className={'flex flex-col ml-72 gap-[2px] w-full max-w-2xl'}>
          {loading ? (
            <p>loading...</p>
          ) : posts.length === 0 ? (
            <p>There are no posts yet</p>
          ) : (
            posts.map((post) => <PostTile post={post} key={post.postId} />)
          )}
        </main>
      </div>
    </div>
  );
};

export default Page;
