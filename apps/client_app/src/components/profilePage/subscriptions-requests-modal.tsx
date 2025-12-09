import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Profile, SubscriptionRequest } from '@/types';
import { fetchAllSubscriptionsRequests } from '@/services/profile.service';
import RequestTile from '@/components/profilePage/request-tile';

type SubscriptionsRequestsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: Profile | null;
};

const SubscriptionsRequestsModal = ({
  isOpen,
  onClose,
  currentProfile,
}: SubscriptionsRequestsModalProps) => {
  const [subscriptionsRequests, setSubscriptionsRequests] = useState<
    SubscriptionRequest[] | null
  >(null);
  const [subscriptionsRequestsLoading, setSubscriptionsRequestsLoading] =
    useState(false);

  useEffect(() => {
    if (isOpen && currentProfile) {
      setSubscriptionsRequestsLoading(true);
      fetchAllSubscriptionsRequests()
        .then(setSubscriptionsRequests)
        .finally(() => setSubscriptionsRequestsLoading(false));
    }
  }, [isOpen, currentProfile]);

  if (!isOpen) return null;
  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center items-center backdrop-blur-xs bg-black/50 min-h-screen`}
    >
      <div
        className={
          'flex flex-col min-w-[470px] rounded-[30px] bg-[#eaddff] justify-center gap-1.5 pl-4 pr-4 pb-4 pt-2'
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
          <div className={'flex w-full items-center justify-center'}>
            <span className={'text-[22px]'}>Notifications</span>
          </div>
        </div>
        <div
          className={
            'flex flex-col outline-1 w-full min-h-[200px] max-h-[500px] overflow-y-auto pl-1 pr-1 pt-0.5'
          }
        >
          {subscriptionsRequestsLoading ? (
            <p>Loading...</p>
          ) : (
            subscriptionsRequests?.map((request) => (
              <RequestTile request={request} key={request.id} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsRequestsModal;
