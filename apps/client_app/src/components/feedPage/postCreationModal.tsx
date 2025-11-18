'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { SERVER } from '@/config/apiRoutes';

export default function PostCreationModal({
  userAvatarUrl = `/images/avaTest.png`,
  username = 'LolekBolek',
  isOpen,
  onClose,
}: CreatePostModalProps) {
  if (!isOpen) return null;

  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState('');

  const handleChangeFileInPlaceholder = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('content', content);
    if (file) {
      formData.append('files', file);
    }

    const response: Response = await fetch(SERVER.API.CREATE_POST, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    if (response.status === 201) {
      onClose();
      location.reload();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center items-center backdrop-blur-xs bg-black/50 min-h-screen`}
    >
      <form
        onSubmit={createPost}
        className={`flex flex-col md:w-[470px] rounded-[30px] bg-[#eaddff] items-center justify-center`}
      >
        <div className={`flex flex-row items-center w-full md:h-[50px]`}>
          <div className={`flex justify-center md:w-[47px] md:h-[47px] ml-1`}>
            <button onClick={onClose}>
              <Image
                src={'/images/icons/back.png'}
                alt={'Back arrow icon'}
                height={30}
                width={30}
                className={`hover:md:h-[37px] hover:md:w-[37px]`}
              />
            </button>
          </div>
          <span className={`ml-32 text-[20px]`}>Creating post</span>
        </div>
        <div className="flex items-center w-full">
          <div className={`flex-grow h-[1px] bg-[#624b98]`}></div>
        </div>
        <div
          className={`flex justify-center items-center md:h-[400px] md:w-[400px] border-black bg-[#d9d9d9] mt-5`}
        >
          {!file ? (
            <div className="flex md:w-[120px]">
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-[#4f378a] text-white text-center rounded-[20px] px-4 py-2 hover:bg-[#d0bcff] w-full"
              >
                Upload file
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*,video/*"
                onChange={handleChangeFileInPlaceholder}
                className="hidden"
              />
            </div>
          ) : (
            <div className="w-full h-full flex justify-center items-center bg-transparent">
              {file.type.startsWith('image/') ? (
                <Image
                  src={URL.createObjectURL(file)}
                  draggable={false}
                  alt="preview"
                  width={400}
                  height={400}
                  className="object-contain w-full h-full"
                />
              ) : (
                <video
                  src={URL.createObjectURL(file)}
                  controls
                  className="object-contain w-full h-full"
                />
              )}
            </div>
          )}
        </div>

        <div className={`flex flex-row w-full ml-17 mt-4 items-center gap-3`}>
          <Image
            className={`rounded-[270px] md:w-[35px] md:h-[35px]`}
            src={userAvatarUrl}
            alt={'User avatar url'}
            width={30}
            height={30}
            unoptimized
          />
          <span className={`font-bold text-[14px]`}>{username}</span>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`What do you think?`}
          className={`flex md:w-[400px] md:h-[122px] bg-white mt-5`}
        ></textarea>
        <button
          className={`cursor-pointer bg-[#4f378a] text-white text-center rounded-[20px] px-4 py-2 hover:bg-[#d0bcff] md:w-[400px] mt-6 mb-5`}
          type={`submit`}
        >
          Create post
        </button>
      </form>
    </div>
  );
}
