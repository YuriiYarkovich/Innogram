import Image from 'next/image';
import Line from '@/components/line';
import React, { useEffect, useState } from 'react';
import { SubscriptionRequest } from '@/types';
import {
  getAllSentRequests,
  handleProfileUnfollow,
} from '@/services/profile.service';
import Link from 'next/link';

type SentRequestsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SentRequestsModal = ({ isOpen, onClose }: SentRequestsModalProps) => {
  const [sentRequests, setSentRequests] = useState<
    SubscriptionRequest[] | null
  >(null);
  const [isSentRequestsLoading, setIsSentRequestsLoading] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  useEffect(() => {
    setIsCancelled((prev) => !prev);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsSentRequestsLoading(true);
      getAllSentRequests()
        .then(setSentRequests)
        .finally(() => setIsSentRequestsLoading(false));
    }
  }, [isOpen]);

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
            <span className={'text-[22px]'}>Sent requests</span>
          </div>
        </div>
        <Line />
        <div
          className={
            'flex flex-col w-full min-h-[200px] max-h-[500px] overflow-y-auto pl-1 pr-1 pt-0.5'
          }
        >
          {isSentRequestsLoading ? (
            <p>Requests loading...</p>
          ) : (
            sentRequests?.map((sentRequest) => (
              <div
                className={'flex flex-row px-3 items-center gap-3'}
                key={sentRequest.id}
              >
                <div
                  className={
                    'flex items-center justify-center min-w-[47px] min-h-[47px] rounded-full'
                  }
                >
                  <Image
                    src={
                      sentRequest.followerProfileAvatarUrl ||
                      '/images/avaTest.png'
                    }
                    alt={'Requested profile avatar'}
                    height={40}
                    width={40}
                    draggable={false}
                    unoptimized
                    className={'rounded-[inherit] md:w-[47px] md:h-[47px]'}
                  />
                </div>
                <Link
                  href={`/profiles/${sentRequest.followerProfileUsername}`}
                  className={'text-[20px] font-bold pt-1'}
                >
                  {sentRequest.followerProfileUsername}
                </Link>
                <button
                  type={'button'}
                  onClick={() => {
                    handleProfileUnfollow(sentRequest.followerProfileId).then(
                      () => setIsCancelled((prev) => !prev),
                    );
                  }}
                  className={
                    'flex items-center justify-center ml-auto min-h-[20px] min-w-[70px] rounded-2xl outline-1 mr-4 bg-[#4f378a] hover:bg-[#d0bcff] text-white p-1.5 hover:text-black cursor-pointer'
                  }
                >
                  {!isCancelled ? 'Cancel req' : 'Request'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SentRequestsModal;
