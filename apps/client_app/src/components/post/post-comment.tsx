import React, { useEffect, useState } from 'react';
import Line from '@/components/line';
import { SERVER } from '@/config/apiRoutes';
import CommentContent from '@/components/post/comment-content';

const PostComment = ({
  postComment,
  onDeleteComment,
  onResponseClick,
}: {
  postComment: PostComment;
  onDeleteComment: () => void;
  onResponseClick: (responseComment: PostComment) => void;
}) => {
  const [responses, setResponses] = useState<PostComment[]>([]);
  const [isResponsesOpen, setIsResponsesOpen] = useState<boolean>(false);
  const [isResponsesLoading, setIsResponsesLoading] = useState<boolean>(false);

  const fetchResponses = async () => {
    setIsResponsesLoading(true);
    const response: Response = await fetch(
      `${SERVER.API.GET_ALL_COMMENT_RESPONSES}${postComment.commentId}`,
      {
        method: 'GET',
        credentials: 'include',
      },
    );

    if (!response.ok) {
      const message: string = await response.json();
      console.error(message);
    }

    const responsesData: PostComment[] = await response.json();
    console.log(`Responses: ${JSON.stringify(responsesData)}`);
    setResponses(responsesData);
  };

  const deleteComment = async (commentId: string) => {
    const response: Response = await fetch(
      `${SERVER.API.DELETE_COMMENT}${commentId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      },
    );

    if (!response.ok) {
      const message: string = await response.json();
      console.error(message);
    } else onDeleteComment();
  };

  const toggleAccordion = () => {
    if (!isResponsesOpen) {
      setIsResponsesLoading(true);
      fetchResponses().then(() => setIsResponsesLoading(false));
    }
    setIsResponsesOpen((prev) => !prev);
  };

  return (
    <div className={`flex flex-col max-h-full`}>
      <CommentContent
        postComment={postComment}
        onResponseClick={onResponseClick}
        deleteComment={deleteComment}
      />

      {/*RESPONSES*/}
      {postComment.responsesAmount > 0 && (
        <div className="flex w-full justify-center">
          <span
            className="text-[13px] font-semibold cursor-pointer"
            onClick={toggleAccordion}
          >
            {isResponsesOpen
              ? 'Hide responses'
              : `Watch responses (${postComment.responsesAmount})`}
          </span>
        </div>
      )}

      {/* Аккордеон */}
      <div
        className={`transition-all ease-in-out overflow-hidden ${
          isResponsesOpen
            ? 'max-h-[9999px] opacity-100 py-2'
            : 'max-h-0 opacity-0 py-0'
        } duration-500`}
      >
        {isResponsesOpen && (
          <div className="w-full max-w-sm mx-auto">
            {isResponsesLoading ? (
              <span className="text-[14px]">Responses loading...</span>
            ) : (
              responses.map((response: PostComment) => (
                <div
                  key={response.commentId}
                  className="flex flex-col w-full ml-10"
                >
                  <CommentContent
                    postComment={response}
                    onResponseClick={() => onResponseClick(postComment)}
                    deleteComment={deleteComment}
                  />
                  <Line thickness={1} marginBottom={10} />
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <Line thickness={1} color={`#624b98`} />
    </div>
  );
};

export default PostComment;
