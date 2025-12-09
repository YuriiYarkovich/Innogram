import React, { useEffect, useState } from 'react';
import { Profile } from '@/types';
import Image from 'next/image';
import {
  handleOnProfileFollowing,
  handleProfileUnfollow,
} from '@/services/profile.service';
import { FollowAcceptedStatus } from '@innogram/core-microservice/dist/common/enums/profile-follow.enum';

type SubscriberTile = {
  subscriber: Profile;
  onDeleteSubscriber?: (subscriberId: string) => void;
  isCurrentProfile: boolean;
  currentProfileId?: string;
};

const ProfileListTile = ({
  subscriber,
  onDeleteSubscriber,
  isCurrentProfile,
  currentProfileId,
}: SubscriberTile) => {
  const [isSubscribed, setIsSubscribed] = useState(subscriber.isSubscribed);
  const [isRequested, setIsRequested] = useState(false);

  useEffect(() => {
    if (
      subscriber.subscribedStatus &&
      subscriber.subscribedStatus === FollowAcceptedStatus.REQUESTED
    ) {
      setIsRequested(true);
    }
  }, []);

  const onSubscribe = () => {
    handleOnProfileFollowing(subscriber).then(() => setIsSubscribed(true));
  };

  const onUnsubscribe = () => {
    handleProfileUnfollow(subscriber).then(() => setIsSubscribed(false));
  };

  return (
    <div className={'flex flex-row items-center w-full min-h-[55px] gap-6'}>
      <div
        className={'flex rounded-full ml-3 outline-1 max-h-[40px] max-w-[40px]'}
      >
        <Image
          src={subscriber.avatarUrl}
          alt={'Candidate avatar'}
          width={40}
          height={40}
          draggable={false}
          unoptimized
          className={'rounded-[inherit]'}
        />
      </div>
      <a
        href={`/profile/${subscriber.username}`}
        className={'font-bold text-[20px] cursor-pointer'}
      >
        {subscriber.username}
      </a>
      <div
        className={'flex flex-row gap-0.5 items-center justify-center ml-auto'}
      >
        {' '}
        {isCurrentProfile && onDeleteSubscriber && (
          <button
            type={'button'}
            onClick={() => {
              onDeleteSubscriber(subscriber.id);
            }}
            className={
              'flex items-center justify-center ml-auto min-h-[20px] min-w-[70px] rounded-2xl outline-1 mr-4 bg-[#4f378a] hover:bg-[#d0bcff] text-white p-1.5 hover:text-black'
            }
          >
            Delete
          </button>
        )}
        {subscriber.id !== currentProfileId &&
        (subscriber.isPublic ||
          (!subscriber.isPublic &&
            subscriber.subscribedStatus === FollowAcceptedStatus.ACCEPTED)) ? (
          !isSubscribed ? (
            <button
              type={'button'}
              onClick={onSubscribe}
              className={
                'flex items-center justify-center ml-auto min-h-[20px] min-w-[70px] rounded-2xl outline-1 mr-4 bg-[#4f378a] hover:bg-[#d0bcff] text-white p-1.5 hover:text-black'
              }
            >
              Subscribe
            </button>
          ) : (
            <button
              type={'button'}
              onClick={onUnsubscribe}
              className={
                'flex items-center justify-center ml-auto min-h-[20px] min-w-[70px] rounded-2xl outline-1 mr-4 bg-[#4f378a] hover:bg-[#d0bcff] text-white p-1.5 hover:text-black'
              }
            >
              Unsubscribe
            </button>
          )
        ) : (
          !subscriber.isPublic &&
          (subscriber.subscribedStatus === FollowAcceptedStatus.REQUESTED ||
            subscriber.subscribedStatus === FollowAcceptedStatus.REJECTED) && (
            <button
              type={'button'}
              onClick={onUnsubscribe}
              className={
                'flex items-center justify-center ml-auto min-h-[20px] min-w-[70px] rounded-2xl outline-1 mr-4 bg-[#4f378a] hover:bg-[#d0bcff] text-white p-1.5 hover:text-black'
              }
            >
              Cancel req
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default ProfileListTile;
