import React, { useEffect, useState } from 'react';
import PostCreationModal from '@/components/feedPage/postCreationModal';
import { Profile } from '@/types';
import Link from 'next/link';
import SubscriptionsRequestsModal from '@/components/profilePage/subscriptions-requests-modal';

const SidePanel = ({ curProfile }: { curProfile: Profile | null }) => {
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [
    isSubscriptionsRequestsModalOpen,
    setIsSubscriptionsRequestsModalOpen,
  ] = useState(false);

  useEffect(() => {
    if (isCreatePostModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isCreatePostModalOpen]);

  return (
    <div>
      <SubscriptionsRequestsModal
        isOpen={isSubscriptionsRequestsModalOpen}
        onClose={() => setIsSubscriptionsRequestsModalOpen(false)}
        currentProfile={curProfile}
      />
      <PostCreationModal
        isOpen={isCreatePostModalOpen}
        username={curProfile?.username}
        userAvatarUrl={curProfile?.avatarUrl}
        onClose={() => setIsCreatePostModalOpen(false)}
      />
      <aside
        className={`fixed left-0 w-1/8 top-1/2 -translate-y-1/2 bg-[#eaddff] rounded-3xl p-4`}
      >
        <ul className="space-y-2">
          <li>
            <Link
              href="/feed"
              className="block hover:bg-[#d0bcff] p-2 rounded text-[#21005d]"
            >
              Feed
            </Link>
          </li>
          <li>
            <Link
              href="/chat"
              className="block hover:bg-[#d0bcff] p-2 rounded text-[#21005d]"
            >
              Chat
            </Link>
          </li>
          <li>
            <button
              className={`flex hover:bg-[#d0bcff] p-2 rounded w-full text-[#21005d] cursor-pointer`}
              onClick={() => setIsCreatePostModalOpen(true)}
            >
              Create Post
            </button>
          </li>
          <li>
            <Link
              href={`/profile/${curProfile?.username}`}
              className="block hover:bg-[#d0bcff] p-2 rounded text-[#21005d]"
            >
              Profile
            </Link>
          </li>
          <li>
            <button
              onClick={() => setIsSubscriptionsRequestsModalOpen(true)}
              className={
                'flex hover:bg-[#d0bcff] p-2 rounded w-full text-[#21005d] cursor-pointer'
              }
            >
              Notifications
            </button>
          </li>
        </ul>
      </aside>
    </div>
  );
};

export default SidePanel;
