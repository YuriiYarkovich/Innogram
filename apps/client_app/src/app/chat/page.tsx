'use client';

import { useEffect, useState } from 'react';
import { fetchProfile } from '@/services/profile.service';
import SidePanel from '@/components/sidePanel';

const ChatPage = () => {
  const [curProfile, setCurProfile] = useState<Profile>({
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

  useEffect(() => {
    fetchProfile().then((data: Profile) => setCurProfile(data));
  }, []);

  return (
    <div
      className={`flex flex-row min-h-screen w-full justify-center items-center`}
    >
      <SidePanel curProfile={curProfile} />
    </div>
  );
};

export default ChatPage;
