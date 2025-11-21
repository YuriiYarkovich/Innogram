import { SERVER } from '@/config/apiRoutes';

export const createPost = async (
  content: string,
  file: File | null,
  onClose: () => void,
) => {
  const formData = new FormData();
  formData.append('content', content);
  if (file) {
    formData.append('files', file);
  }

  const response: Response = await fetch(SERVER.API.CREATE_POST, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  if (response.status === 201) {
    onClose();
    location.reload();
  }
};

export const likeOrUnlikePost = async (liked: boolean, post: Post) => {
  let response: Response;
  if (!liked) {
    response = await fetch(`${SERVER.API.LIKE_POST}${post.postId}`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
  } else {
    response = await fetch(`${SERVER.API.UNLIKE_POST}${post.postId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
  }
  return response;
};

export const deletePost = async (post: Post, onClose: () => void) => {
  const response: Response = await fetch(
    `${SERVER.API.DELETE_POST}${post.postId}`,
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

export const fetchPostsOfProfile = async (profileId: string) => {
  const resPosts: Response = await fetch(
    `${SERVER.API.GEL_ALL_POSTS_OF_PROFILE}${profileId}`,
    {
      credentials: 'include',
    },
  );
  return await resPosts.json();
};

export const fetchPostsOfSubscribedOnProfiles = async () => {
  const res: Response = await fetch(SERVER.API.GET_POSTS_OF_SUBSCRIBED_ON, {
    credentials: 'include',
  });
  return await res.json();
};
