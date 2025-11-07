'use client';

import PostTile from '@/components/feedPage/postTile';
import { useEffect, useState } from 'react';
import { CONFIG } from '@/config/apiRoutes';
import SidePanel from '@/components/sidePanel';

const Page = () => {
  const [curProfile, setCurProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const res: Response = await fetch(CONFIG.API.GET_CURRENT_PROFILE_INFO, {
        credentials: 'include',
      });
      const data: Profile = await res.json();
      console.log(`received profile data: ${JSON.stringify(data)}`);
      setCurProfile(data);
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res: Response = await fetch(
          CONFIG.API.GET_POSTS_OF_SUBSCRIBED_ON,
          {
            credentials: 'include',
          },
        );
        const data: Post[] = await res.json();
        console.log(`received data: ${JSON.stringify(data)}`);
        setPosts(data);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div>
      <div
        className={`flex flex-row min-h-screen w-full justify-center items-center`}
      >
        <SidePanel
          username={curProfile?.username}
          avatarUrl={curProfile?.avatarUrl}
        />
        <main className={'flex flex-col ml-72 gap-[2px] w-full max-w-2xl'}>
          {loading ? (
            <p>loading...</p>
          ) : posts.length === 0 ? (
            <p>There are no posts yet</p>
          ) : (
            posts.map((post) => (
              <PostTile
                key={post.postId}
                postId={post.postId}
                username={post.username}
                timePast={post.timePast}
                likesCount={post.likesCount}
                postContent={post.content}
                contentUrl={post.assets[0].url} //TODO add possibility to see all the pictures
                liked={post.liked}
              />
            ))
          )}
        </main>
      </div>
    </div>
  );
};

export default Page;
