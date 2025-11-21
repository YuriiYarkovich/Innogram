'use client';

import Image from 'next/image';
import React from 'react';
import { useForm } from 'react-hook-form';
import AddFilePlaceholder from '@/components/add-file-placeholder';
import { createPost } from '@/services/posts.service';

type PostCreationFormValues = {
  content: string;
  file: File | null;
};

export default function PostCreationModal({
  userAvatarUrl = `/images/avaTest.png`,
  username = 'LolekBolek',
  isOpen,
  onClose,
}: CreatePostModalProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting },
  } = useForm<PostCreationFormValues>({
    defaultValues: {
      content: '',
      file: null,
    },
  });
  const file = watch('file');

  const onSubmit = async (data: PostCreationFormValues) => {
    await createPost(data.content, data.file, onClose);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center items-center backdrop-blur-xs bg-black/50 min-h-screen`}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
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
        {/*file field*/}
        <div
          className={`flex justify-center items-center md:h-[400px] md:w-[400px] border-black bg-[#d9d9d9] mt-5`}
        >
          <AddFilePlaceholder
            control={control}
            name={`file`}
            label={'Upload file'}
          />
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
          {...register('content')}
          placeholder="What do you think?"
          className="flex md:w-[400px] md:h-[122px] bg-white mt-5"
        ></textarea>
        <button
          className="cursor-pointer bg-[#4f378a] text-white text-center rounded-[20px] px-4 py-2 hover:bg-[#d0bcff] md:w-[400px] mt-6 mb-5"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create post'}
        </button>
      </form>
    </div>
  );
}
