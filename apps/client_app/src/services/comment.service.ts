import { SERVER } from '@/config/apiRoutes';
import returnErrorMessage from '@/utils/showAuthError';

export const addComment = async (
  commentContent: string,
  post: Post,
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
      postId: post.postId,
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
  await fetchComments(post, setCommentsLoading, setComments);
};

export const fetchComments = async (
  post: Post,
  setCommentsLoading: (isLoading: boolean) => void,
  setComments: (commentsData: PostComment[]) => void,
) => {
  try {
    setCommentsLoading(true);
    const response: Response = await fetch(
      `${SERVER.API.GET_COMMENTS_OF_POST}${post.postId}`,
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
