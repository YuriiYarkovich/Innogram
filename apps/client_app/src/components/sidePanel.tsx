import React, { useEffect, useState } from 'react';
import PostCreationModal from '@/components/feedPage/postCreationModal';
import { CONFIG } from '@/config/apiRoutes';

const SidePanel = ({}) => {
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    const fetchCurrentProfile = async () => {
      const response: Response = await fetch(
        CONFIG.API.GET_CURRENT_PROFILE_INFO,
        {
          credentials: 'include',
        },
      );

      const data: Profile = await response.json();

      setAvatarUrl(data.avatarUrl);
      setUsername(data.username);
    };

    fetchCurrentProfile();
  }, []);

  useEffect(() => {
    if (isCreatePostModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isCreatePostModalOpen]);

  return (
    <div>
      <PostCreationModal
        isOpen={isCreatePostModalOpen}
        username={username}
        userAvatarUrl={avatarUrl}
        onClose={() => setIsCreatePostModalOpen(false)}
      />
      <aside
        className={`fixed left-0 w-64 top-1/2 -translate-y-1/2 bg-[#eaddff] rounded-3xl p-4`}
      >
        <ul className="space-y-2">
          <li>
            <a
              href="/feed"
              className="block hover:bg-[#d0bcff] p-2 rounded text-[#21005d]"
            >
              Feed
            </a>
          </li>
          <li>
            <button
              className={`flex hover:bg-[#d0bcff] p-2 rounded w-full text-[#21005d]`}
              onClick={() => setIsCreatePostModalOpen(true)}
            >
              Create Post
            </button>
          </li>
          <li>
            <a
              href={`/profile/${username}`}
              className="block hover:bg-[#d0bcff] p-2 rounded text-[#21005d]"
            >
              Profile
            </a>
          </li>
        </ul>
      </aside>
    </div>
  );
};

export default SidePanel;
