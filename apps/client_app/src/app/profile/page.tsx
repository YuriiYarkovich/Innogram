'use client';

import SidePanel from '@/components/sidePanel';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import PostPreviewImage from '@/components/profilePage/post-preview-image';
import { CONFIG } from '@/config/apiRoutes';

const Page = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resProfile: Response = await fetch(
          CONFIG.API.GET_CURRENT_PROFILE_INFO,
          {
            credentials: 'include',
          },
        );
        const profileData: Profile = await resProfile.json();
        console.log(
          `received profile data in profile page: ${JSON.stringify(profileData)}`,
        );
        setProfile(profileData);

        const resPosts: Response = await fetch(
          `${CONFIG.API.GEL_ALL_POSTS_OF_PROFILE}${profileData?.profileId}`,
          {
            credentials: 'include',
          },
        );
        const postsData: Post[] = await resPosts.json();
        console.log(`Received posts data: ${JSON.stringify(postsData)}`);
        setPosts(postsData);
      } finally {
        setProfileLoading(false);
        setPostsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!profile) return;

    const fetchPosts = async () => {
      try {
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  });

  return (
    <div
      className={`flex flex-row min-h-screen w-full justify-center items-center`}
    >
      <SidePanel username={profile?.username} avatarUrl={profile?.avatarUrl} />
      <main
        className={`flex flex-col min-h-screen md:w-[900px] {/*bg-red-600*/}`}
      >
        {profileLoading ? (
          <p>loading...</p>
        ) : profile === null ? (
          <p>Error while loading profile info</p>
        ) : (
          <div className={`flex flex-col w-full {/*bg-blue-600*/}`}>
            <div className={`flex flex-row w-full {/*bg-green-600 gap-10*/}`}>
              <Image
                className={`rounded-[270px] md:w-[155px] md:h-[155px] mt-15 ml-15`}
                src={profile.avatarUrl || `/images/avaTest.png`}
                alt={'User avatar'}
                width={30}
                height={30}
                unoptimized
              />
              <div className={`flex flex-col mt-20 gap-8`}>
                <span className={`font-bold text-[32px]`}>
                  {profile.username}
                </span>
                <div className={`flex flex-row gap-3`}>
                  <div className={`flex flex-row gap-1`} /*posts count text*/>
                    <span className={`font-bold text-[20px]`}>
                      {profile.postsAmount}
                    </span>
                    <span className={`text-[20px]`}>posts</span>
                  </div>
                  <div
                    className={`flex flex-row gap-1`} /*subscribers count text*/
                  >
                    <span className={`font-bold text-[20px]`}>
                      {profile.subscribersAmount}
                    </span>
                    <span className={`text-[20px]`}>subscribers</span>
                  </div>
                  <div
                    className={`flex flex-row gap-1`} /*subscriptions count text*/
                  >
                    <span className={`font-bold text-[20px]`}>
                      {profile.subscriptionsAmount}
                    </span>
                    <span className={`text-[20px]`}>subscriptions</span>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`flex flex-row w-full justify-center gap-20 mt-10 mb-10`}
            >
              <button
                className={`flex md:w-[280px] md:h-[35px] bg-[#eaddff] rounded-[10px] items-center justify-center text-[20px] cursor-pointer hover:bg-[#ffd8e4]`}
              >
                Edit profile
              </button>
              <button
                className={`flex md:w-[280px] md:h-[35px] bg-[#eaddff] rounded-[10px] items-center justify-center text-[20px] cursor-pointer hover:bg-[#ffd8e4]`}
              >
                View archive
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center mt-3 w-full">
          <div className={`flex-grow h-[2px] bg-[#624b98]`}></div>
        </div>
        <div
          className={`{/*bg-blue-600*/} grid grid-cols-5 md:w-[900px] mt-7 gap-1`}
        >
          {postsLoading ? (
            <p>loading</p>
          ) : posts.length === 0 ? (
            <p>There are no posts</p>
          ) : (
            posts.map((post) => (
              <PostPreviewImage
                imageUrl={post.assets[0].url}
                key={post.postId}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Page;
