'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import ActionsService from '@/services/actions.service';
import { useForm } from 'react-hook-form';
import AddFilePlaceholder from '@/components/add-file-placeholder';

type ProfileEditFormValues = {
  username: string;
  bio: string;
  birthday: string;
  file: File | null;
};

export default function EditProfileModal({
  profile,
  isOpen,
  onClose,
}: EditProfileModalProps) {
  if (!isOpen) return null;
  const actionsService: ActionsService = new ActionsService();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting },
  } = useForm<ProfileEditFormValues>({
    defaultValues: {
      username: '',
      bio: '',
      birthday: '',
      file: null,
    },
  });

  const file = watch('file');
  const selectedFile = file as File | null;

  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: ProfileEditFormValues) => {
    await actionsService.editProfile(
      data.username,
      data.bio,
      data.birthday,
      file,
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
                name={`file`}
                label={'Upload file'}
              />
            </div>
          </div>
          <input
            type="username"
            placeholder="Username"
            defaultValue={profile.username}
            {...register('username')}
            className="border-2 border-[#bcb8b8] rounded-[6px] px-3 py-2 w-full bg-white"
          />
          <span className={`mb-[-10px] text-[#625b71]`}>Birthday</span>
          <input
            type="date"
            title="Birthday"
            defaultValue={profile.birthday}
            {...register('birthday')}
            className="border-2 border-[#bcb8b8] rounded-[6px] px-3 py-2 w-full bg-white"
          />
          <textarea
            placeholder="Bio"
            defaultValue={profile.bio}
            {...register('birthday')}
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
