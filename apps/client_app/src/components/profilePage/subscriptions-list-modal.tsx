import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Profile } from '@/types';
import Line from '@/components/line';
import ProfileListTile from '@/components/profilePage/profile-list-tile';
import {
  deleteSubscriber,
  fetchAllSubscribers,
  fetchAllSubscriptions,
} from '@/services/profile.service';

type SubscriptionsListModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentProfile?: Profile | null;
  profile?: Profile | null;
};

const SubscriptionsListModal = ({
  isOpen,
  onClose,
  currentProfile,
  profile,
}: SubscriptionsListModalProps) => {
  const [subscriptions, setSubscriptions] = useState<Profile[] | null>(null);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);

  useEffect(() => {
    setSubscriptionsLoading(true);
    if (profile && currentProfile && isOpen) {
      fetchAllSubscriptions(profile.id)
        .then(setSubscriptions)
        .finally(() => setSubscriptionsLoading(false));
    }
  }, [currentProfile, isOpen, profile]);

  if (!isOpen) return null;
  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center items-center backdrop-blur-xs bg-black/50 min-h-screen`}
    >
      <div
        className={
          'flex flex-col min-w-[470px] rounded-[30px] bg-[#eaddff] justify-center gap-3 pl-4 pr-4 pb-4 pt-2'
        }
      >
        <div className={`flex flex-row items-center w-full min-h-[50px]`}>
          <button
            onClick={onClose}
            className={`flex justify-center items-center min-w-[47px] min-h-[47px]`}
          >
            <Image
              src={'/images/icons/back.png'}
              alt={'Back arrow icon'}
              height={30}
              width={30}
              className={`hover:min-h-[37px] hover:min-w-[37px]`}
            />
          </button>
          <div
            className={'flex flex-row w-full items-center justify-center gap-2'}
          >
            <span className={'text-[20px]'}>Subscriptions of</span>
            <span className={'text-[20px] font-bold'}>{profile?.username}</span>
          </div>
        </div>
        <Line />
        <div
          className={
            'flex flex-col outline-1 w-full min-h-[200px] max-h-[500px] overflow-y-auto pl-1 pr-1 pt-0.5'
          }
        >
          {subscriptionsLoading ? (
            <p>Loading...</p>
          ) : (
            subscriptions?.map((subscriber) => (
              <ProfileListTile
                key={subscriber.id}
                subscriber={subscriber}
                isCurrentProfile={profile?.id === currentProfile?.id}
                currentProfileId={currentProfile?.id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsListModal;
