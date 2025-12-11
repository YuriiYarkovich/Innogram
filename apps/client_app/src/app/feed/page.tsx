'use client';

import PostTile from '@/components/feedPage/postTile';
import { useEffect, useState } from 'react';
import SidePanel from '@/components/sidePanel';
import { fetchProfile } from '@/services/profile.service';
import {
  fetchFirstPostOfSubscribedOnProfiles,
  fetchPostsOfSubscribedOnProfiles,
} from '@/services/posts.service';
import { Post, Profile } from '@/types';

const Page = () => {
  const [curProfile, setCurProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchProfile().then((data: Profile) => setCurProfile(data));
  }, []);

  useEffect(() => {
    const loadInitialPosts = async () => {
      try {
        setLoading(true);
        const firstPost = await fetchFirstPostOfSubscribedOnProfiles();

        if (!firstPost) {
          setHasMore(false);
          return;
        }

        const allPosts = await fetchPostsOfSubscribedOnProfiles(
          firstPost.createdAt,
        );

        setPosts(allPosts);
        setHasMore(allPosts.length > 0);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialPosts();
  }, []);

  // Функция для подгрузки следующих постов
  const loadMorePosts = async () => {
    if (loadingMore || !hasMore || posts.length === 0) return;

    try {
      setLoadingMore(true);
      const lastPost = posts[posts.length - 1];
      const newPosts = await fetchPostsOfSubscribedOnProfiles(
        lastPost.createdAt,
      );

      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div>
      <div
        className={`flex flex-col min-h-screen w-full justify-center items-center`}
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
        <div className={'flex w-full justify-center m-4'}>
          <button
            onClick={loadMorePosts}
            className={
              'min-w-[50px] min-h-[20px] bg-[#eaddff] rounded-2xl cursor-pointer hover:bg-[#B282FF] hover:text-white ml-10'
            }
          >
            <span className={'m-3'}>Load more</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
