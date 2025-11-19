'use client';

import SidePanel from '@/components/sidePanel';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import PostPreviewImage from '@/components/post/post-preview-image';
import { SERVER } from '@/config/apiRoutes';
import EditProfileModal from '@/components/profilePage/edit-profile.modal';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import PostPreviewModal from '@/components/post/post-preview.modal';
import FetchService from '@/services/fetch.service';
import ActionsService from '@/services/actions.service';

const Page = () => {
  const router: AppRouterInstance = useRouter();
  const fetchService: FetchService = new FetchService();
  const actionsService: ActionsService = new ActionsService();

  const [profile, setProfile] = useState<Profile>({
    profileId: '',
    username: '',
    bio: '',
    birthday: '',
    avatarUrl: '',
    isPublic: false,
    postsAmount: 0,
    subscribersAmount: 0,
    subscriptionsAmount: 0,
    isCurrent: false,
    isSubscribed: false,
  });
  const [curProfile, setCurProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [postOfPostModal, setPostOfPostModal] = useState(posts[0]);
  const [isPostPreviewModalOpen, setIsPostPreviewModalOpen] = useState(false);
  const [isFollowed, setIsFollowed] = useState(profile.isSubscribed);
  const [followersAmount, setFollowersAmount] = useState<number>(
    Number(profile.subscribersAmount),
  );

  const { username } = useParams<{ username?: string }>();

  useEffect(() => {
    fetchService.fetchProfile(setCurProfile);
  }, []);

  const openPostPreviewModal = (postId: string) => {
    const index: number | undefined = findPostIndex(postId);
    if (index === undefined) {
      console.error(`post id not found!`);
      return;
    }

    setPostOfPostModal(posts[index]);
    setIsPostPreviewModalOpen(true);
  };

  const findPostIndex = (postId: string): number | undefined => {
    for (let i = 0; i < posts.length; i++) {
      if (postId === posts[i].postId) {
        return i;
      }
    }
    return undefined;
  };

  useEffect(() => {
    if (isEditProfileModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isEditProfileModalOpen]);

  const updatePostsArray = async (profileId: string) => {
    await fetchService.fetchPostsOfProfile(profileId, setPosts);
  };

  useEffect(() => {
    fetchService.fetchFullProfileData(
      username,
      setFollowersAmount,
      setIsFollowed,
      setProfile,
      updatePostsArray,
      setProfileLoading,
      setPostsLoading,
    );
  }, [username]);

  const handleFollowing = async () => {
    await actionsService.handleFollowing(profile);
    setFollowersAmount((prev: number): number => prev + 1);
    setIsFollowed(true);
  };

  const handleUnfollow = async () => {
    await actionsService.handleUnfollow(profile);

    setFollowersAmount((prev: number): number => prev - 1);
    setIsFollowed(false);
  };

  return (
    <div>
      <EditProfileModal
        profile={profile}
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
      />
      <PostPreviewModal
        post={postOfPostModal}
        isOpen={isPostPreviewModalOpen}
        onClose={async () => {
          await updatePostsArray(profile.profileId);
          setIsPostPreviewModalOpen(false);
        }}
      />
      <div
        className={`flex flex-row min-h-screen w-full justify-center items-center`}
      >
        <SidePanel curProfile={curProfile} />
        <main
          className={`flex flex-col min-h-screen md:w-[900px] {/*bg-red-600*/}`}
        >
          {profileLoading ? (
            <p>loading...</p>
          ) : profile === null ? (
            <p>Error while loading profile info</p>
          ) : (
            <div className={`flex flex-col w-full`}>
              <div className={`flex flex-row w-full gap-10`}>
                <Image
                  className={`rounded-[270px] md:w-[155px] md:h-[155px] mt-15 ml-15`}
                  src={profile.avatarUrl || `/images/avaTest.png`}
                  alt={'User avatar'}
                  width={30}
                  height={30}
                  unoptimized
                  draggable={false}
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
                        {followersAmount}
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
                  <span className={`text-[#79747e]`}>{profile.bio}</span>
                </div>
                {profile.isCurrent ? (
                  <button
                    className={`ml-50`}
                    onClick={actionsService.handleLogout}
                  >
                    <Image
                      src={`/images/icons/logout.svg`}
                      alt={`logout button`}
                      height={40}
                      width={40}
                      draggable={false}
                      className={`md:w-[40px] md:h-[40px] hover:md:w-[47px] hover:md:h-[47px] cursor-pointer`}
                    />
                  </button>
                ) : (
                  <div />
                )}
              </div>
              <div
                className={`flex flex-row w-full justify-center gap-20 mt-10 mb-10`}
              >
                {profile.isCurrent ? (
                  <>
                    <button
                      className={`flex md:w-[280px] md:h-[35px] bg-[#eaddff] rounded-[10px] items-center justify-center text-[20px] cursor-pointer hover:bg-[#ffd8e4]`}
                      onClick={() => setIsEditProfileModalOpen(true)}
                    >
                      Edit profile
                    </button>
                    <button
                      className={`flex md:w-[280px] md:h-[35px] bg-[#eaddff] rounded-[10px] items-center justify-center text-[20px] cursor-pointer hover:bg-[#ffd8e4]`}
                    >
                      View archive
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={`flex md:w-[280px] md:h-[35px] bg-[#eaddff] rounded-[10px] items-center justify-center text-[20px] cursor-pointer hover:bg-[#ffd8e4]`}
                      onClick={
                        isFollowed
                          ? () => handleUnfollow()
                          : () => handleFollowing()
                      }
                    >
                      {isFollowed ? 'Unfollow' : 'Follow'}
                    </button>
                    <button
                      className={`flex md:w-[280px] md:h-[35px] bg-[#eaddff] rounded-[10px] items-center justify-center text-[20px] cursor-pointer hover:bg-[#ffd8e4]`}
                    >
                      Send message
                    </button>
                  </>
                )}
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
                  onClick={() => openPostPreviewModal(post.postId)}
                  key={post.postId}
                />
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Page;
