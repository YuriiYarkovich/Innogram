'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import AddFilePlaceholder from '@/components/add-file-placeholder';
import {
  changeProfileVisibilityStatus,
  editProfile,
} from '@/services/profile.service';
import { EditProfileModalProps, Profile } from '@/types';
import { loadFromS3 } from '@/services/files.service';

type ProfileEditFormValues = {
  username: string;
  bio: string;
  birthday: string;
  file?: File | string | null;
};

export default function EditProfileModal({
  profile,
  isOpen,
  onClose,
}: EditProfileModalProps) {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const { register, handleSubmit, control, setValue, watch, reset } =
    useForm<ProfileEditFormValues>({
      defaultValues: {
        username: profile.username,
        bio: profile.bio,
        birthday: profile.birthday,
        file: profile?.avatarUrl || null,
      },
    });

  const file = watch('file');

  useEffect(() => {
    if (profile && isOpen) {
      setCurrentProfile(profile);
      setValue('username', profile.username || '');
      setValue('bio', profile.bio || '');
      setValue('birthday', profile.birthday || '');
      if (profile.avatarUrl) {
        loadFromS3(profile.avatarUrl).then((file) => {
          setValue('file', file);
        });
      } else setValue('file', null);
    }
  }, [profile, reset, setValue, isOpen]);

  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: ProfileEditFormValues) => {
    await editProfile(
      data.username,
      data.bio,
      data.birthday,
      file,
      setError,
      onClose,
    );
  };

  if (!isOpen) return null;
  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center items-center backdrop-blur-xs bg-black/50 min-h-screen`}
    >
      <div
        className={`flex flex-col items-center justify-center md:w-[500px] min-h-screen`}
      >
        <form
          className={`flex flex-col w-full pb-5 bg-[#eaddff] pr-[30px] pl-[30px] rounded-[50px] gap-2 pt-5`}
          onSubmit={handleSubmit(onSubmit)}
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
          <div className={`flex w-full justify-center`}>
            <div
              className={`flex items-center justify-center m-5 md:h-[200px] md:w-[200px] rounded-[270px] bg-[#79747e] overflow-hidden`}
            >
              <AddFilePlaceholder
                control={control}
                name={'file'}
                isIcon={true}
                iconSize={100}
                label={'Upload file'}
              />
            </div>
          </div>
          <input
            type="username"
            placeholder="Username"
            {...register('username')}
            className="border-2 border-[#bcb8b8] rounded-[6px] px-3 py-2 w-full bg-white"
          />
          <span className={`mb-[-10px] text-[#625b71]`}>Birthday</span>
          <input
            type="date"
            title="Birthday"
            {...register('birthday')}
            className="border-2 border-[#bcb8b8] rounded-[6px] px-3 py-2 w-full bg-white"
          />
          <textarea
            placeholder="Bio"
            {...register('bio')}
            className="border-2 border-[#bcb8b8] rounded-[6px] md:h-[100px] px-3 w-full bg-white"
          />
          <div className={'flex flex-col w-full gap-2.5 mt-6'}>
            <button
              type="button"
              onClick={() => {
                changeProfileVisibilityStatus().then(setCurrentProfile);
              }}
              className="bg-[#4f378a] text-white text-[18px] hover:text-black rounded-[20px] md:h-[45px] hover:bg-[#d0bcff] w-full cursor-pointer"
            >
              {currentProfile?.isPublic ? 'Make private' : 'Make public'}
            </button>
            <button
              type="submit"
              className="bg-[#4f378a] text-white text-[18px] hover:text-black rounded-[20px] md:h-[45px] hover:bg-[#d0bcff] w-full cursor-pointer"
            >
              Submit
            </button>
          </div>
          {error && (
            <div className={`text-red-600 text-sm mt-2 mb-7`}>{error}</div>
          )}
        </form>
      </div>
    </div>
  );
}
