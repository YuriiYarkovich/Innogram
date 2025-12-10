'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import PostCommentComponent from '@/components/post/post-comment-component';
import Line from '@/components/line';
import {
  createPost,
  deletePost,
  likeOrUnlikePost,
  updatePost,
} from '@/services/posts.service';
import { addComment, fetchComments } from '@/services/comment.service';
import { PostPreviewModalProps, PostComment } from '@/types';
import CrossAngleButton from '@/components/crossAngle.button';
import Carousel from '@/components/carousel';
import { useForm } from 'react-hook-form';
import { PostCreationFormValues } from '@/components/feedPage/postCreationModal';
import { loadFromS3 } from '@/services/files.service';
import AddFilePlaceholder from '@/components/add-file-placeholder';

export default function PostViewModal({
  post,
  isOpen,
  onClose,
}: PostPreviewModalProps) {
  const [liked, setLiked] = useState(post?.liked || false);
  const [likesCount, setLikesCount] = useState<number>(
    Number(post?.likesCount) || 0,
  );
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentContent, setCommentContent] = useState<string>('');
  const [isRespondingOnComment, setIsRespondingOnComment] =
    useState<boolean>(false);
  const [respondingComment, setRespondingComment] = useState<
    PostComment | undefined
  >(undefined);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [isInEditingMode, setIsInEditingMode] = useState(false);

  const MAX_FILES = 10;
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
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
  const allFiles = [
    watch('file0'),
    watch('file1'),
    watch('file2'),
    watch('file3'),
    watch('file4'),
    watch('file5'),
    watch('file6'),
    watch('file7'),
    watch('file8'),
    watch('file9'),
  ];

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
    await updatePost(post.postId, data.content, files);
    location.reload();
  };

  const handleLikeOrUnlikePost = async (e: React.FormEvent) => {
    e.preventDefault();

    const response: Response = await likeOrUnlikePost(liked, post);

    if (response.ok) {
      if (liked) setLikesCount((prev) => prev - 1);
      else setLikesCount((prev) => prev + 1);

      setLiked((prev) => !prev);
    }
  };

  useEffect(() => {
    if (isOpen && post) {
      setValue('content', post.content);

      //resetting all the files
      for (let i = 0; i < MAX_FILES; i++) {
        setValue(`file${i}` as keyof PostCreationFormValues, null);
      }
      // setting current files
      post.assets.forEach((asset, index) => {
        if (index < MAX_FILES) {
          // downloading files from storage
          loadFromS3(asset.url)
            .then((file) => {
              if (file) {
                setValue(`file${index}` as keyof PostCreationFormValues, file);
              }
            })
            .catch((err) => console.error('Error loading file:', err));
        }
      });
    }
  }, [isOpen, post, setValue]);

  useEffect(() => {
    if (!isOpen) return;
    fetchComments(post, setCommentsLoading, setComments);
  }, [isOpen, post]);

  const setCommentToRespond = (comment: PostComment) => {
    setRespondingComment(comment);
    setIsRespondingOnComment(true);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center items-center backdrop-blur-xs bg-black/50 min-h-screen`}
    >
      <CrossAngleButton onClose={onClose} />
      <div className={`flex w-full h-3/4 justify-center`}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`flex flex-row items-center md:w-[1054px] max-h-full bg-[#eaddff] rounded-4xl`}
        >
          <div
            className={`flex flex-col w-1/2 justify-center h-full bg-black rounded-l-4xl py-4`}
          >
            {isInEditingMode ? (
              <Carousel
                currentIndex={currentFileIndex}
                totalItems={MAX_FILES}
                onPrev={() =>
                  setCurrentFileIndex((prev) => Math.max(0, prev - 1))
                }
                onNext={() =>
                  setCurrentFileIndex((prev) =>
                    Math.min(MAX_FILES - 1, prev + 1),
                  )
                }
                onSelectIndex={setCurrentFileIndex}
                className={'min-w-[450px] h-full'}
              >
                {Array.from({ length: MAX_FILES }).map((_, index) => (
                  <AddFilePlaceholder
                    key={index}
                    control={control}
                    name={`file${index}` as keyof PostCreationFormValues}
                    label={`Upload file ${index + 1}/${MAX_FILES}`}
                  />
                ))}
              </Carousel>
            ) : (
              <Carousel
                currentIndex={currentFileIndex}
                totalItems={post.assets.length}
                onPrev={() =>
                  setCurrentFileIndex((prev) => Math.max(0, prev - 1))
                }
                onNext={() =>
                  setCurrentFileIndex((prev) =>
                    Math.min(post.assets.length - 1, prev + 1),
                  )
                }
                onSelectIndex={setCurrentFileIndex}
                className={'min-w-[450px] h-full'}
              >
                {post.assets.map((asset) => (
                  <div
                    key={asset.order}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <Image
                      src={asset.url}
                      alt="post picture"
                      width={512}
                      height={512}
                      draggable={false}
                      unoptimized
                      className="object-contain max-h-full max-w-full rounded-lg"
                    />
                  </div>
                ))}
              </Carousel>
            )}
          </div>
          <div className={`flex flex-col w-1/2 h-full`}>
            <div
              className={`flex flex-row h-1/6 gap-4 p-3.5 items-center cursor-pointer`}
            >
              <a
                className={`flex flex-row cursor-pointer gap-4 items-center`}
                href={`/profile/${post.username}`}
              >
                <Image
                  src={post.profileAvatarUrl || '/images/avaTest.png'}
                  alt={`Profile avatar url`}
                  width={50}
                  height={50}
                  unoptimized
                  className={`rounded-full md:w-15 md:h-15`}
                  draggable={false}
                />
                <span className={`font-bold text-[20px]`}>{post.username}</span>
              </a>
              <span className={`text-[16px] text-[#79747e] ml-2`}>
                {Number(post.timePast) >= 24
                  ? `${Math.floor(Number(post.timePast) / 24)} d`
                  : `${post.timePast} h`}
              </span>
              {post.isCreator &&
                (isInEditingMode ? (
                  <div className={'flex flex-row ml-auto mr-6 gap-4'}>
                    <button
                      type={'submit'}
                      className={`cursor-pointer flex md:w-[34px] md:h-[34px] justify-center items-center`}
                    >
                      <Image
                        src={`/images/icons/apply.svg`}
                        alt={'Apply icon'}
                        width={25}
                        height={25}
                        draggable={false}
                        className={`hover:md:w-[34px] hover:md:h-[34px]`}
                      />
                    </button>
                    <button
                      type={'button'}
                      className={`cursor-pointer flex md:w-[37px] md:h-[37px] justify-center items-center`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsInEditingMode(false);
                      }}
                    >
                      <Image
                        src={`/images/icons/cross.svg`}
                        alt={'Exit editing icon'}
                        width={30}
                        height={30}
                        draggable={false}
                        className={`hover:md:w-[37px] hover:md:h-[37px]`}
                      />
                    </button>
                  </div>
                ) : (
                  <div className={'flex flex-row ml-auto mr-6 gap-4'}>
                    <button
                      type={'button'}
                      className={`cursor-pointer flex md:w-[34px] md:h-[34px] justify-center items-center`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsInEditingMode(true);
                      }}
                    >
                      <Image
                        src={`/images/icons/edit.svg`}
                        alt={'Edit post icon'}
                        width={25}
                        height={25}
                        draggable={false}
                        className={`hover:md:w-[34px] hover:md:h-[34px]`}
                      />
                    </button>
                    <button
                      type={'button'}
                      className={`cursor-pointer flex md:w-[37px] md:h-[37px] justify-center items-center`}
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deletePost(post, onClose);
                      }}
                    >
                      <Image
                        src={`/images/icons/delete.svg`}
                        alt={'Delete post icon'}
                        width={30}
                        height={30}
                        draggable={false}
                        className={`hover:md:w-[37px] hover:md:h-[37px]`}
                      />
                    </button>
                  </div>
                ))}
            </div>
            {isInEditingMode ? (
              <textarea
                {...register('content')}
                className={`pl-5 pr-5 text-[18px] border-b-1 border-[#79747e] mx-5 mr-38`}
              />
            ) : (
              <span className={`pl-5 pr-5 text-[18px]`}>{post.content}</span>
            )}

            <div className={`flex flex-row ml-[15px] mt-[10px]`}>
              <div
                className={
                  'flex items-center justify-center md:w-[45px] md:h-[45px]'
                }
              >
                <button
                  type={'button'}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLikeOrUnlikePost(e);
                  }}
                >
                  <Image
                    src={
                      liked
                        ? `/images/icons/heart.png`
                        : `/images/icons/emptyHeart.png`
                    }
                    alt={`Like icon`}
                    width={33}
                    height={33}
                    draggable={false}
                    className={`hover:md:h-[40px] hover:md:w-[40px]`}
                  />
                </button>
              </div>
              <div
                className={
                  'flex items-center justify-center md:w-[45px] md:h-[45px]'
                }
              >
                {/*<button> //TODO implement sharing posts
                  <Image
                    src={`/images/icons/share.png`}
                    alt={`Share icon`}
                    width={33}
                    height={33}
                    draggable={false}
                    className={`ml-[16px] mt-[-2px] hover:md:h-[40px] hover:md:w-[40px]`}
                  />
                </button>*/}
              </div>
            </div>
            <span className={`font-bold text-[16px] ml-6`}>
              {likesCount} likes
            </span>
            <Line thickness={2} />
            <div className={`flex flex-col h-2/3 pr-6 pb-2 gap-2`}>
              <div
                className={`flex flex-col h-2/3 overflow-y-scroll p-4 gap-2`}
              >
                {commentsLoading ? (
                  <p>Loading...</p>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <PostCommentComponent
                      key={comment.commentId}
                      postComment={comment}
                      onDeleteComment={() =>
                        fetchComments(post, setCommentsLoading, setComments)
                      }
                      onResponseClick={setCommentToRespond}
                    />
                  ))
                ) : (
                  <p>There are no comments yet</p>
                )}
              </div>

              {isRespondingOnComment && (
                <>
                  <Line thickness={1} marginBottom={3} marginTop={0} />
                  <div
                    className={`flex flex-col min-h-[50px] w-full gap-1.5 mb-[-5px]`}
                  >
                    <div className={`flex items-start ml-3 gap-3 `}>
                      <Image
                        src={`/images/icons/reply.svg`}
                        alt={`arrow`}
                        height={23}
                        width={23}
                        draggable={false}
                      />
                      <div className={`flex flex-col flex-grow`}>
                        <span className={`font-bold text-[14px]`}>
                          Answer to{' '}
                          {respondingComment?.authorUsername || 'Username'}
                        </span>
                        <span className={`break-words w-100 text-[14px]`}>
                          {respondingComment ? (
                            respondingComment?.commentContent?.length > 100 ? (
                              respondingComment?.commentContent.slice(0, 100) +
                              '...'
                            ) : (
                              respondingComment?.commentContent
                            )
                          ) : (
                            <></>
                          )}
                        </span>
                      </div>
                      <div
                        className={
                          'h-full flex items-center justify-center md:w-[30px] md:h-[30px]'
                        }
                      >
                        <Image
                          src={`/images/icons/cross.svg`}
                          alt={`arrow`}
                          height={23}
                          width={23}
                          draggable={false}
                          className={`hover:md:w-[30px] hover:md:h-[30px]`}
                          onClick={() => setIsRespondingOnComment(false)}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div className={`flex flex-col h-1/4`}>
                <div className={`flex flex-row w-full h-full pl-3 gap-2`}>
                  <textarea
                    placeholder={`PostComment`}
                    className={`w-3/4 border-2 border-[#bcb8b8] rounded-[6px] bg-white`}
                    onChange={(e) => setCommentContent(e.target.value)}
                  />
                  <div className={`flex w-1/4 items-center`}>
                    <button
                      type={'button'}
                      className={`rounded-3xl bg-[#4f378a] w-full h-1/3 text-white hover:bg-[#d0bcff] hover:text-black cursor-pointer`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addComment(
                          commentContent,
                          post,
                          respondingComment,
                          isRespondingOnComment,
                          setIsRespondingOnComment,
                          setCommentsLoading,
                          setComments,
                        ).then(() => setCommentContent(''));
                      }}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
