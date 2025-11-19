'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import ActionsService from '@/services/actions.service';

export default function EditProfileModal({
  profile,
  isOpen,
  onClose,
}: EditProfileModalProps) {
  if (!isOpen) return null;

  const [avatar, setAvatar] = useState<File | null>(null);
  const [username, setUsername] = useState<string>(profile.username);
  const [bio, setBio] = useState<string>(profile.bio);
  const [birthday, setBirthday] = useState(profile.birthday);
  const [error, setError] = useState<string | null>(null);

  const actionsService: ActionsService = new ActionsService();

  const handleChangeAvatarInPlaceholder = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const editProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    await actionsService.editProfile(
      username,
      bio,
      birthday,
      avatar,
      setError,
      onClose,
    );
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center items-center backdrop-blur-xs bg-black/50 min-h-screen`}
    >
      <div
        className={`flex flex-col items-center justify-center md:w-[500px] min-h-screen`}
      >
        <form
          className={`flex flex-col w-full md:h-[800px] bg-[#eaddff] pr-[30px] pl-[30px] rounded-[50px] gap-2 pt-8`}
          onSubmit={editProfile}
        >
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
          <div className={`flex justify-center`}>
            {!avatar ? (
              <div className="flex items-center md:w-[200px] md:h-[200px] rounded-[270px] border-[#918d94] border-2 p-6 mb-14">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-[#4f378a] text-white hover:text-black text-center px-4 py-2 hover:bg-[#d0bcff] w-full rounded-3xl"
                >
                  Upload file
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleChangeAvatarInPlaceholder}
                  className="hidden"
                />{' '}
              </div>
            ) : (
              // Превью файла
              <div className="md:w-[200px] md:h-[200px] mb-14 flex justify-center items-center bg-transparent">
                <Image
                  src={URL.createObjectURL(avatar)}
                  draggable={false}
                  alt="preview"
                  width={200}
                  height={200}
                  className="md:w-[200px] md:h-[200px] rounded-[270px]"
                  unoptimized
                />
              </div>
            )}
          </div>
          <input
            type="username"
            placeholder="Username"
            defaultValue={profile.username}
            onChange={(e) => setUsername(e.target.value)}
            className="border-2 border-[#bcb8b8] rounded-[6px] px-3 py-2 w-full bg-white"
          />
          <span className={`mb-[-10px] text-[#625b71]`}>Birthday</span>
          <input
            type="date"
            title="Birthday"
            defaultValue={profile.birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="border-2 border-[#bcb8b8] rounded-[6px] px-3 py-2 w-full bg-white"
          />
          <textarea
            placeholder="Bio"
            defaultValue={profile.bio}
            onChange={(e) => setBio(e.target.value)}
            className="border-2 border-[#bcb8b8] rounded-[6px] md:h-[100px] px-3 py-2 w-full bg-white"
          />
          <button
            type="submit"
            className="bg-[#4f378a] text-white hover:text-black rounded-[20px] my-[25px] md:h-[45px] hover:bg-[#d0bcff] w-full"
          >
            Submit
          </button>
          {error && (
            <div className={`text-red-600 text-sm mt-2 mb-7`}>{error}</div>
          )}
        </form>
      </div>
    </div>
  );
}
