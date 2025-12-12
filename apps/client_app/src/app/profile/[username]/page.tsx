'use client';

import SidePanel from '@/components/sidePanel';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import PostPreviewImage from '@/components/post/post-preview-image';
import EditProfileModal from '@/components/profilePage/edit-profile.modal';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useParams, useRouter } from 'next/navigation';
import PostViewModal from '@/components/post/post-view.modal';
import { handleLogout } from '@/services/auth.service';
import {
  fetchFullProfileData,
  fetchProfile,
  handleOnProfileFollowing,
  handleProfileUnfollow,
} from '@/services/profile.service';
import { fetchPostsOfProfile } from '@/services/posts.service';
import { Post, Profile } from '@/types';
import MessageWritingModal from '@/components/profilePage/message-writing.modal';
import SubscribersListModal from '@/components/profilePage/subscribers-list-modal';
import SubscriptionsListModal from '@/components/profilePage/subscriptions-list-modal';
import Line from '@/components/line';
import SentRequestsModal from '@/components/profilePage/sent-requests-modal';
import { FollowAcceptedStatus } from '@/enums';

const Page = () => {
  const router: AppRouterInstance = useRouter();

  const [profile, setProfile] = useState<Profile>({
    id: '',
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
  const [isSubscribersListModalOpen, setIsSubscribersListModalOpen] =
    useState(false);
  const [isSubscriptionsListModalOpen, setIsSubscriptionsListModalOpen] =
    useState(false);
  const [isSentRequestsModalOpen, setIsSentRequestsModalOpen] = useState(false);
  const [postOfPostModal, setPostOfPostModal] = useState(posts[0]);
  const [isPostPreviewModalOpen, setIsPostPreviewModalOpen] = useState(false);
  const [isFollowed, setIsFollowed] = useState(profile.isSubscribed);
  const [isRequested, setIsRequested] = useState(false);
  const [followersAmount, setFollowersAmount] = useState<number>(
    Number(profile.subscribersAmount),
  );
  const [isWritingMessageModalOpen, setIsWritingMessageModalOpen] =
    useState(false);

  const { username } = useParams<{ username?: string }>();

  const onWritingMessageModalClose = () => {
    setIsWritingMessageModalOpen(false);
  };

  useEffect(() => {
    fetchProfile().then(setCurProfile);
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
    fetchPostsOfProfile(profileId).then((data: Post[]) => {
      setPosts(data);
    });
  };

  useEffect(() => {
    fetchFullProfileData(username)
      .then((profileData: Profile) => {
        setFollowersAmount(profileData.subscribersAmount);
        setIsFollowed(profileData.isSubscribed);
        setProfile(profileData);
        updatePostsArray(profileData?.id);
        if (
          profileData.subscribedStatus &&
          (profileData.subscribedStatus === FollowAcceptedStatus.REQUESTED ||
            profileData.subscribedStatus === FollowAcceptedStatus.REJECTED)
        ) {
          setIsRequested(true);
        }
      })
      .finally(() => {
        setProfileLoading(false);
        setPostsLoading(false);
      });
  }, [username]);

  const handleFollowing = async () => {
    await handleOnProfileFollowing(profile);
    setFollowersAmount((prev: number): number => prev + 1);
    if (!profile.isPublic && !isRequested) {
      setIsRequested(true);
    } else {
      setIsFollowed(true);
    }
  };

  const handleUnfollow = async () => {
    await handleProfileUnfollow(profile.id);

    setFollowersAmount((prev: number): number => prev - 1);
    if (!profile.isPublic && isRequested) {
      setIsRequested(false);
    } else if (
      (!profile.isPublic && isFollowed) ||
      (profile.isPublic && isFollowed)
    ) {
      setIsFollowed(false);
    }
    location.reload();
  };

  return (
    <div>
      <SentRequestsModal
        isOpen={isSentRequestsModalOpen}
        onClose={() => setIsSentRequestsModalOpen(false)}
      />
      <SubscriptionsListModal
        isOpen={isSubscriptionsListModalOpen}
        onClose={() => setIsSubscriptionsListModalOpen(false)}
        currentProfile={curProfile}
        profile={profile}
      />
      <SubscribersListModal
        isOpen={isSubscribersListModalOpen}
        onClose={() => setIsSubscribersListModalOpen(false)}
        currentProfile={curProfile}
        profile={profile}
      />
      <EditProfileModal
        profile={profile}
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
      />
      <PostViewModal
        receivingPostId={postOfPostModal.postId}
        isOpen={isPostPreviewModalOpen}
        onClose={async () => {
          setIsPostPreviewModalOpen(false);
          await updatePostsArray(profile.id);
        }}
      />
      <MessageWritingModal
        isOpen={isWritingMessageModalOpen}
        onClose={onWritingMessageModalClose}
        currentProfile={curProfile}
        receiverProfileId={profile.id}
      />
      <div
        className={`flex flex-row min-h-screen w-full justify-center items-center`}
      >
        <SidePanel curProfile={curProfile} />
        <main className={`flex flex-col min-h-screen md:w-[900px]`}>
          {profileLoading ? (
            <p>loading...</p>
          ) : profile === null ? (
            <p>Error while loading profile info</p>
          ) : (
            <div className={`flex flex-col w-full`}>
              <div className={`flex flex-row w-full gap-10 items-center`}>
                <Image
                  className={`rounded-[270px] md:w-[155px] md:h-[155px] mt-15 ml-15`}
                  src={profile.avatarUrl || `/images/avaTest.png`}
                  alt={'User avatar'}
                  width={30}
                  height={30}
                  unoptimized
                  loading={'eager'}
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
                      <span
                        onClick={() => setIsSubscribersListModalOpen(true)}
                        className={`text-[20px] cursor-pointer`}
                      >
                        subscribers
                      </span>
                    </div>
                    <div
                      className={`flex flex-row gap-1`} /*subscriptions count text*/
                    >
                      <span className={`font-bold text-[20px] cursor-pointer`}>
                        {profile.subscriptionsAmount}
                      </span>
                      <span
                        onClick={() => setIsSubscriptionsListModalOpen(true)}
                        className={`text-[20px] cursor-pointer`}
                      >
                        subscriptions
                      </span>
                    </div>
                  </div>
                  <span className={`text-[#79747e]`}>{profile.bio}</span>
                </div>
                {profile.isCurrent && (
                  <div
                    className={
                      'flex flex-col items-center justify-center gap-2 ml-auto'
                    }
                  >
                    <button
                      className={`flex md:w-[47px] md:h-[47px] items-center justify-center`}
                      onClick={() => handleLogout(router)}
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

                    <button
                      className={`flex ml-auto md:w-[47px] md:h-[47px] items-center justify-center`}
                      onClick={() => setIsSentRequestsModalOpen(true)}
                    >
                      <Image
                        src={`/images/icons/sentRequests.svg`}
                        alt={`Sent requests button`}
                        height={40}
                        width={40}
                        draggable={false}
                        className={`md:w-[40px] md:h-[40px] hover:md:w-[47px] hover:md:h-[47px] cursor-pointer`}
                      />
                    </button>
                  </div>
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
                      onClick={() => {
                        location.replace(
                          `/profile/${profile.username}/archive`,
                        );
                      }}
                      className={`flex md:w-[280px] md:h-[35px] bg-[#eaddff] rounded-[10px] items-center justify-center text-[20px] cursor-pointer hover:bg-[#ffd8e4]`}
                    >
                      View archive
                    </button>
                  </>
                ) : profile.isPublic ? (
                  <>
                    <button
                      className={`flex md:w-[280px] md:h-[35px] bg-[#eaddff] rounded-[10px] items-center justify-center text-[20px] cursor-pointer hover:bg-[#ffd8e4]`}
                      onClick={isFollowed ? handleUnfollow : handleFollowing}
                    >
                      {isFollowed ? 'Unfollow' : 'Follow'}
                    </button>
                    <button
                      className={`flex md:w-[280px] md:h-[35px] bg-[#eaddff] rounded-[10px] items-center justify-center text-[20px] cursor-pointer hover:bg-[#ffd8e4]`}
                      onClick={() => setIsWritingMessageModalOpen(true)}
                    >
                      Send message
                    </button>
                  </>
                ) : profile.isSubscribed ? (
                  <>
                    <button
                      className={`flex md:w-[280px] md:h-[35px] bg-[#eaddff] rounded-[10px] items-center justify-center text-[20px] cursor-pointer hover:bg-[#ffd8e4]`}
                      onClick={handleUnfollow}
                    >
                      Unfollow
                    </button>
                    <button
                      className={`flex md:w-[280px] md:h-[35px] bg-[#eaddff] rounded-[10px] items-center justify-center text-[20px] cursor-pointer hover:bg-[#ffd8e4]`}
                      onClick={() => setIsWritingMessageModalOpen(true)}
                    >
                      Send message
                    </button>
                  </>
                ) : (
                  <button
                    className={`flex md:w-[280px] md:h-[35px] bg-[#eaddff] rounded-[10px] items-center justify-center text-[20px] cursor-pointer hover:bg-[#ffd8e4]`}
                    onClick={isRequested ? handleUnfollow : handleFollowing}
                  >
                    {isRequested ? 'Cancel request' : 'Request subscription'}
                  </button>
                )}
              </div>
              <Line color={'#79747e'} />
              {profile.isPublic ||
              profile.isCurrent ||
              (!profile.isPublic && profile.isSubscribed) ? (
                <div className={'grid grid-cols-5 md:w-[900px] mt-7 gap-1'}>
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
              ) : (
                !profile.isPublic &&
                !profile.isSubscribed && (
                  <div
                    className={
                      'flex flex-row items-center justify-center my-20'
                    }
                  >
                    <Image
                      src={'/images/icons/locked.svg'}
                      alt={'Lock icon'}
                      height={130}
                      width={130}
                      draggable={false}
                    />
                    <div
                      className={'flex flex-col items-center justify-center'}
                    >
                      <span className={'text-[30px] font-bold'}>
                        This account is private
                      </span>
                      <span className={'text-[20px] text-[#79747e]'}>
                        Follow this account to see posts
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Page;
