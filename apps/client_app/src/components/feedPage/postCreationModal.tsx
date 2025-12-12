'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import AddFilePlaceholder from '@/components/add-file-placeholder';
import { createPost } from '@/services/posts.service';
import { CreatePostModalProps } from '@/types';
import Carousel from '@/components/carousel';

export type PostCreationFormValues = {
  content: string;
  file0: File | null;
  file1: File | null;
  file2: File | null;
  file3: File | null;
  file4: File | null;
  file5: File | null;
  file6: File | null;
  file7: File | null;
  file8: File | null;
  file9: File | null;
};

export default function PostCreationModal({
  userAvatarUrl = `/images/avaTest.png`,
  username = 'LolekBolek',
  isOpen,
  onClose,
}: CreatePostModalProps) {
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const MAX_FILES = 10;

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting },
  } = useForm<PostCreationFormValues>({
    defaultValues: {
      content: '',
      file0: null,
      file1: null,
      file2: null,
      file3: null,
      file4: null,
      file5: null,
      file6: null,
      file7: null,
      file8: null,
      file9: null,
    },
  });

  const onSubmit = async (data: PostCreationFormValues) => {
    const files: File[] = [];
    for (let i = 0; i < MAX_FILES; i++) {
      const file = data[
        `file${i}` as keyof PostCreationFormValues
      ] as File | null;
      if (file) {
        files.push(file);
      }
    }
    await createPost(data.content, files, onClose);
  };

  const handlePrevFile = () => {
    if (currentFileIndex > 0) {
      setCurrentFileIndex(currentFileIndex - 1);
    }
  };

  const handleNextFile = () => {
    if (currentFileIndex < MAX_FILES - 1) {
      setCurrentFileIndex(currentFileIndex + 1);
    }
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
            <button type="button" onClick={onClose}>
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

        {/* File carousel */}
        <Carousel
          currentIndex={currentFileIndex}
          totalItems={MAX_FILES}
          onPrev={handlePrevFile}
          onNext={handleNextFile}
          onSelectIndex={setCurrentFileIndex}
          className="md:h-[400px] md:w-[400px] mt-5"
        >
          {
            <AddFilePlaceholder
              control={control}
              name="file0"
              label={`Upload file 1/${MAX_FILES}`}
            />
          }
          {
            <AddFilePlaceholder
              control={control}
              name="file1"
              label={`Upload file 2/${MAX_FILES}`}
            />
          }
          {
            <AddFilePlaceholder
              control={control}
              name="file2"
              label={`Upload file 3/${MAX_FILES}`}
            />
          }
          {
            <AddFilePlaceholder
              control={control}
              name="file3"
              label={`Upload file 4/${MAX_FILES}`}
            />
          }
          {
            <AddFilePlaceholder
              control={control}
              name="file4"
              label={`Upload file 5/${MAX_FILES}`}
            />
          }
          {
            <AddFilePlaceholder
              control={control}
              name="file5"
              label={`Upload file 6/${MAX_FILES}`}
            />
          }
          {
            <AddFilePlaceholder
              control={control}
              name="file6"
              label={`Upload file 7/${MAX_FILES}`}
            />
          }
          {
            <AddFilePlaceholder
              control={control}
              name="file7"
              label={`Upload file 8/${MAX_FILES}`}
            />
          }
          {
            <AddFilePlaceholder
              control={control}
              name="file8"
              label={`Upload file 9/${MAX_FILES}`}
            />
          }
          {
            <AddFilePlaceholder
              control={control}
              name="file9"
              label={`Upload file 10/${MAX_FILES}`}
            />
          }
        </Carousel>

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
          className="flex md:w-[400px] md:h-[122px] bg-white mt-5 p-2"
        />
        <button
          className="cursor-pointer bg-[#4f378a] text-white text-center rounded-[20px] px-4 py-2 hover:bg-[#d0bcff] hover:text-black md:w-[400px] mt-6 mb-5"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create post'}
        </button>
      </form>
    </div>
  );
}
