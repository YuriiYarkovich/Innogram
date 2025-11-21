'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import PostComment from '@/components/post/post-comment';
import Line from '@/components/line';
import ActionsService from '@/services/actions.service';
import FetchService from '@/services/fetch.service';

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
  const [isRespondingOnComment, setIsRespondingOnComment] =
    useState<boolean>(false);
  const [respondingComment, setRespondingComment] = useState<
    PostComment | undefined
  >(undefined);

  const actionsService: ActionsService = new ActionsService();
  const fetchService: FetchService = new FetchService();

  const likeOrUnlikePost = async (e: React.FormEvent) => {
    e.preventDefault();

    const response: Response = await actionsService.likeOrUnlikePost(
      liked,
      post,
    );

    if (response.ok) {
      setLiked((prev) => !prev);
      setLikesCount((prev) => prev - 1);
    }
  };

  useEffect(() => {
    fetchService.fetchComments(post, setCommentsLoading, setComments);
  }, []);

  const setCommentToRespond = (comment: PostComment) => {
    setRespondingComment(comment);
    setIsRespondingOnComment(true);
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
      <div className={`flex w-full h-3/4 justify-center`}>
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
          <div className={`flex flex-col w-1/2 h-full`}>
            <div
              className={`flex flex-row h-1/6 gap-4 p-3.5 items-center cursor-pointer`}
            >
              <a
                className={`flex flex-row cursor-pointer gap-4 items-center`}
                href={`/profile/${post.username}`}
              >
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
              </a>
              <span className={`text-[16px] text-[#79747e] ml-2`}>
                {Number(post.timePast) >= 24
                  ? `${Math.floor(Number(post.timePast) / 24)} d`
                  : `${post.timePast} h`}
              </span>
              {post.isCreator ? (
                <button
                  className={`ml-auto mr-9 cursor-pointer`}
                  onClick={async () => actionsService.deletePost(post, onClose)}
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
            <div className={`flex flex-col h-2/3 pr-6 pb-2 gap-2`}>
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
                      onDeleteComment={() =>
                        fetchService.fetchComments(
                          post,
                          setCommentsLoading,
                          setComments,
                        )
                      }
                      onResponseClick={setCommentToRespond}
                    />
                  ))
                ) : (
                  <p>There are no comments yet</p>
                )}
              </div>

              {isRespondingOnComment ? (
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
                      <Image
                        src={`/images/icons/cross.svg`}
                        alt={`arrow`}
                        height={23}
                        width={23}
                        draggable={false}
                        className={`h-full hover:md:w-[30px] hover:md:h-[30px]`}
                        onClick={() => setIsRespondingOnComment(false)}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <></>
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
                      className={`rounded-3xl bg-[#4f378a] w-full h-1/3 text-white hover:bg-[#d0bcff] hover:text-black cursor-pointer`}
                      onClick={() =>
                        actionsService.addComment(
                          commentContent,
                          post,
                          respondingComment,
                          isRespondingOnComment,
                          setIsRespondingOnComment,
                          setCommentsLoading,
                          setComments,
                        )
                      }
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
    </div>
  );
}
