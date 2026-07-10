import { SERVER } from '@/config/apiRoutes';
import returnErrorMessage from '@/utils/showAuthError';
import { PostComment } from '@/types';

export const addComment = async (
  commentContent: string,
  postId: string,
  respondingComment: PostComment | undefined,
  isRespondingOnComment: boolean,
  setIsRespondingOnComment: (isRespondingOnComment: boolean) => void,
  setCommentsLoading: (isCommentsLoading: boolean) => void,
  setComments: (comments: PostComment[]) => void,
) => {
  const response: Response = await fetch(SERVER.API.ADD_COMMENT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: commentContent,
      postId,
      isAnswer: false,
      parentCommentId: respondingComment?.commentId || '',
    }),
    credentials: 'include',
  });

  if (!response.ok) {
    const finalMessage: string | undefined = await returnErrorMessage(response);
    if (finalMessage) console.error(finalMessage);
    return;
  }

  if (isRespondingOnComment) setIsRespondingOnComment(false);
  await fetchComments(postId, setCommentsLoading, setComments);
};

export const fetchComments = async (
  postId: string,
  setCommentsLoading: (isLoading: boolean) => void,
  setComments: (commentsData: PostComment[]) => void,
) => {
  try {
    setCommentsLoading(true);
    const response: Response = await fetch(
      `${SERVER.API.GET_COMMENTS_OF_POST}${postId}`,
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
