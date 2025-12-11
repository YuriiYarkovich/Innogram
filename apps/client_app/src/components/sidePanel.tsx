import React, { useEffect, useState } from 'react';
import PostCreationModal from '@/components/feedPage/postCreationModal';
import { Profile } from '@/types';
import Link from 'next/link';
import SubscriptionsRequestsModal from '@/components/profilePage/subscriptions-requests-modal';
import Image from 'next/image';

const SidePanel = ({ curProfile }: { curProfile: Profile | null }) => {
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [
    isSubscriptionsRequestsModalOpen,
    setIsSubscriptionsRequestsModalOpen,
  ] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
        className={`fixed left-0 top-1/2 -translate-y-1/2 bg-[#eaddff] rounded-3xl p-4 transition-all duration-300 ease-in-out ${
          isHovered ? 'w-48' : 'w-16'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <ul className="space-y-2">
          <li>
            <Link
              href="/feed"
              className="flex items-center hover:bg-[#d0bcff] p-2 rounded text-[#21005d] whitespace-nowrap"
            >
              <Image
                src="/images/icons/home.svg"
                alt="Feed"
                width={50}
                height={50}
                draggable={false}
                className="w-6 h-6"
              />
              <span
                className={`ml-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}
              >
                Feed
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="/chat"
              className="flex items-center hover:bg-[#d0bcff] p-2 rounded text-[#21005d] whitespace-nowrap"
            >
              <Image
                src="/images/icons/chat.svg"
                alt="Chat"
                width={70}
                height={70}
                className="w-6 h-6"
                draggable={false}
              />
              <span
                className={`ml-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}
              >
                Chat
              </span>
            </Link>
          </li>
          <li>
            <button
              className="flex items-center hover:bg-[#d0bcff] p-2 rounded w-full text-[#21005d] cursor-pointer whitespace-nowrap"
              onClick={() => setIsCreatePostModalOpen(true)}
            >
              <Image
                src="/images/icons/add.svg"
                alt="Create Post"
                width={50}
                height={50}
                className="w-6 h-6"
                draggable={false}
              />
              <span
                className={`ml-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}
              >
                Create Post
              </span>
            </button>
          </li>
          <li>
            <Link
              href={`/profile/${curProfile?.username}`}
              className="flex items-center hover:bg-[#d0bcff] p-2 rounded text-[#21005d] whitespace-nowrap"
            >
              <Image
                src="/images/icons/profile.svg"
                alt="Profile"
                width={50}
                height={50}
                className="w-6 h-6"
                draggable={false}
              />
              <span
                className={`ml-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}
              >
                Profile
              </span>
            </Link>
          </li>
          <li>
            <button
              onClick={() => setIsSubscriptionsRequestsModalOpen(true)}
              className="flex items-center hover:bg-[#d0bcff] p-2 rounded w-full text-[#21005d] cursor-pointer whitespace-nowrap"
            >
              <Image
                src="/images/icons/notification.svg"
                alt="Notifications"
                width={50}
                height={50}
                className="w-6 h-6"
                draggable={false}
              />
              <span
                className={`ml-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}
              >
                Notifications
              </span>
            </button>
          </li>
          <li>
            <button
              onClick={() =>
                location.replace(`/profile/${curProfile?.username}/activity`)
              }
              className="flex items-center hover:bg-[#d0bcff] p-2 rounded w-full text-[#21005d] cursor-pointer whitespace-nowrap"
            >
              <Image
                src="/images/icons/activity.svg"
                alt="Activity"
                width={50}
                height={50}
                className="w-6 h-6"
                draggable={false}
              />
              <span
                className={`ml-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}
              >
                Activity
              </span>
            </button>
          </li>
        </ul>
      </aside>
    </div>
  );
};

export default SidePanel;
