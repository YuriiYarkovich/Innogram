'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { CONFIG } from '@/config/apiRoutes';
import PostComment from '@/components/post/post-comment';
import Line from '@/components/line';
import returnErrorMessage from '@/utils/showAuthError';
import addComment from '@/components/post/post-comment';

export default function PostPreviewModal({
  post,
  isOpen,
  onClose,
}: PostPreviewModalProps) {
  if (!isOpen) return null;

  const [profileAvatarUrl] = useState<string>(
    post.profileAvatarUrl || `/images/avaTest.png`,
  );
  const [liked, setLiked] = useState(post.liked);
  const [likesCount, setLikesCount] = useState<number>(Number(post.likesCount));
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentContent, setCommentContent] = useState<string>('');

  const likeOrUnlikePost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!liked) {
      const response: Response = await fetch(
        `${CONFIG.API.LIKE_POST}${post.postId}`,
        {
          method: 'POST',
          credentials: 'include',
        },
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      if (response.ok) {
        setLiked((prev) => !prev);
        setLikesCount((prev) => prev + 1);
      }
    } else {
      const response: Response = await fetch(
        `${CONFIG.API.UNLIKE_POST}${post.postId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      if (response.ok) {
        setLiked((prev) => !prev);
        setLikesCount((prev) => prev - 1);
      }
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const addComment = async () => {
    const response: Response = await fetch(CONFIG.API.ADD_COMMENT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: commentContent,
        postId: post.postId,
        isAnswer: false,
        answerCommentId: '',
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      const finalMessage: string | undefined =
        await returnErrorMessage(response);
      if (finalMessage) console.error(finalMessage);
      return;
    }

    await fetchComments();
  };

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const response: Response = await fetch(
        `${CONFIG.API.GET_COMMENTS_OF_POST}${post.postId}`,
        {
          method: 'GET',
          credentials: 'include',
        },
      );

      if (!response.ok) {
        console.error(response.status);
      }

      const commentsData: PostComment[] = await response.json();
      setComments(commentsData);
    } finally {
      setCommentsLoading(false);
    }
  };

  const deletePost = async () => {
    const response: Response = await fetch(
      `${CONFIG.API.DELETE_POST}${post.postId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      },
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    if (response.ok) {
      onClose();
      location.reload();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center items-center backdrop-blur-xs bg-black/50 min-h-screen`}
    >
      <button className={`fixed top-0 right-0`} onClick={onClose}>
        <Image
          src={`/images/icons/cross.svg`}
          alt={'Cross'}
          width={50}
          height={50}
          className={`hover:md:w-[57px] hover:md:h-[57px] cursor-pointer`}
          draggable={false}
        />
      </button>
      <div className={`flex w-full md:h-[554px] justify-center`}>
        <div
          className={`flex flex-row items-center md:w-[1054px] max-h-full bg-[#eaddff] rounded-4xl`}
        >
          <div
            className={`flex flex-col w-1/2 justify-center h-full bg-black rounded-l-4xl`}
          >
            <Image
              src={post.assets[0].url}
              alt={`Post image`}
              width={512}
              height={512}
              unoptimized
              className={`w-full h-1/2`}
              draggable={false}
            />
          </div>
          <div className={`flex flex-col w-1/2 md:h-[554px]`}>
            <div className={`flex flex-row h-1/6 gap-4 p-3.5 items-center`}>
              <Image
                src={profileAvatarUrl}
                alt={`Profile avatar url`}
                width={50}
                height={50}
                unoptimized
                className={`rounded-full md:w-15 md:h-15`}
                draggable={false}
              />
              <span className={`font-bold text-[20px]`}>{post.username}</span>
              <span className={`text-[16px] text-[#79747e] ml-2`}>
                {Number(post.timePast) >= 24
                  ? `${Math.floor(Number(post.timePast) / 24)} d`
                  : `${post.timePast} h`}
              </span>
              {post.isCreator ? (
                <button
                  className={`ml-auto mr-9 cursor-pointer`}
                  onClick={async () => deletePost()}
                >
                  <Image
                    src={`/images/icons/delete.svg`}
                    alt={'Delete post'}
                    width={30}
                    height={30}
                    draggable={false}
                    className={`hover:md:w-[37px] hover:md:h-[37px]`}
                  />
                </button>
              ) : (
                <></>
              )}
            </div>
            <span className={`pl-5 pr-5 text-[18px]`}>{post.content}</span>
            <div className={`flex flex-row ml-[15px] mt-[10px]`}>
              <div
                className={
                  'flex items-center justify-center md:w-[45px] md:h-[45px]'
                }
              >
                <button onClick={likeOrUnlikePost}>
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
                    className={`md:h-[33px] md:w-[33px] hover:md:h-[40px] hover:md:w-[40px]`}
                  />
                </button>
              </div>
              <div
                className={
                  'flex items-center justify-center md:w-[45px] md:h-[45px]'
                }
              >
                <button>
                  <Image
                    src={`/images/icons/share.png`}
                    alt={`Like icon`}
                    width={33}
                    height={33}
                    draggable={false}
                    className={`md:h-[33px] md:w-[33px] ml-[16px] mt-[-2px] hover:md:h-[40px] hover:md:w-[40px]`}
                  />
                </button>
              </div>
            </div>
            <span className={`font-bold text-[16px] ml-6`}>
              {likesCount} likes
            </span>
            <Line thickness={2} />
            <div className={`flex flex-col h-2/3 pr-6 pb-2 gap-5`}>
              <div
                className={`flex flex-col h-2/3 overflow-y-scroll p-4 gap-2`}
              >
                {commentsLoading ? (
                  <p>Loading...</p>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <PostComment
                      key={comment.commentId}
                      postComment={comment}
                    />
                  ))
                ) : (
                  <p>There are no comments yet</p>
                )}
              </div>
              <div className={`flex flex-row w-full h-1/5 pl-3 gap-2`}>
                <textarea
                  placeholder={`PostComment`}
                  className={`w-3/4 border-2 border-[#bcb8b8] rounded-[6px] bg-white`}
                  onChange={(e) => setCommentContent(e.target.value)}
                />
                <div className={`flex w-1/4 items-center`}>
                  <button
                    className={`rounded-3xl bg-[#4f378a] w-full h-1/3 text-white hover:bg-[#d0bcff] hover:text-black cursor-pointer`}
                    onClick={() => addComment()}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
