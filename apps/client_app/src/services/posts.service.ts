import { SERVER } from '@/config/apiRoutes';
import { Post } from '@/types';

export const createPost = async (
  content: string,
  files: File[],
  onClose: () => void,
) => {
  const formData = new FormData();
  formData.append('content', content);

  files.forEach((file) => {
    formData.append('files', file);
  });

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

export const fetchPostsOfProfile = async (
  profileId: string,
): Promise<Post[]> => {
  const response: Response = await fetch(
    `${SERVER.API.GEL_ALL_POSTS_OF_PROFILE}${profileId}`,
    {
      credentials: 'include',
    },
  );

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  return await response.json();
};

export const fetchPostsOfSubscribedOnProfiles = async (): Promise<Post[]> => {
  const response: Response = await fetch(
    SERVER.API.GET_POSTS_OF_SUBSCRIBED_ON,
    {
      credentials: 'include',
    },
  );

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  const receivedPosts: Post[] = await response.json();

  receivedPosts.forEach((post) => console.log(JSON.stringify(post)) + '\n');

  return receivedPosts;
};

export const updatePost = async (
  postId: string,
  content: string,
  files: File[],
): Promise<Post> => {
  const formData = new FormData();
  formData.append('content', content);

  files.forEach((file) => {
    formData.append('files', file);
  });

  const response: Response = await fetch(`${SERVER.API.UPDATE_POST}${postId}`, {
    method: 'PUT',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  return await response.json();
};
