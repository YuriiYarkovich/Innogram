'use client';

import PostTile from '@/components/feedPage/postTile';
import PostCreationModal from '@/components/feedPage/postCreationModal';
import { useEffect, useState } from 'react';
import { CONFIG } from '@/config/apiRoutes';

type Post = {
  postId: string;
  profileId: string;
  profileAvatarUrl?: string;
  username: string;
  content: string;
  timePast: string;
  likesCount: number;
  assets: AssetData[];
};

type AssetData = {
  order: number;
  url: string;
};

type ReceivingProfileInfo = {
  profileId: string;
  username: string;
  birthday: string;
  bio: string;
  avatarUrl: string;
  isPublic: boolean;
};

const Page = () => {
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<ReceivingProfileInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isCreatePostModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isCreatePostModalOpen]);

  useEffect(() => {
    const fetchProfile = async () => {
      const res: Response = await fetch(CONFIG.API.GET_CURRENT_PROFILE_INFO, {
        method: 'GET',
        credentials: 'include',
      });
      const profileData: ReceivingProfileInfo = await res.json();
      console.log(`Received profile data: ${JSON.stringify(profileData)}`);
      setProfile(profileData);
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
      <PostCreationModal
        isOpen={isCreatePostModalOpen}
        username={profile?.username}
        userAvatarUrl={profile?.avatarUrl}
        onClose={() => setIsCreatePostModalOpen(false)}
      />
      <div
        className={`flex flex-row min-h-screen w-full justify-center items-center`}
      >
        <aside
          className={`fixed left-0 w-64 top-1/2 -translate-y-1/2 bg-[#eaddff] rounded-3xl p-4`}
        >
          <ul className="space-y-2">
            <li>
              <a
                href="#"
                className="block hover:bg-[#d0bcff] p-2 rounded text-[#21005d]"
              >
                Feed
              </a>
            </li>
            <li>
              <button
                className={`flex hover:bg-[#d0bcff] p-2 rounded w-full text-[#21005d]`}
                onClick={() => setIsCreatePostModalOpen(true)}
              >
                Create Post
              </button>
            </li>
            <li>
              <a
                href="#"
                className="block hover:bg-[#d0bcff] p-2 rounded text-[#21005d]"
              >
                Profile
              </a>
            </li>
          </ul>
        </aside>
        <main className={'flex flex-col ml-72 gap-[2px] w-full max-w-2xl'}>
          {loading ? (
            <p>loading...</p>
          ) : posts.length === 0 ? (
            <p>There are no posts yet</p>
          ) : (
            posts.map((post) => (
              <PostTile
                key={post.postId}
                username={post.username}
                timePast={post.timePast}
                likesCount={post.likesCount}
                postContent={post.content}
                contentUrl={post.assets[0].url}
              />
            ))
          )}
        </main>
      </div>
    </div>
  );
};

export default Page;
