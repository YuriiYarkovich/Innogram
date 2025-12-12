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

  if (!response.ok) console.error(response.json());

  if (response.status === 201) {
    onClose();
    location.reload();
  }
};

export const likeOrUnlikePost = async (liked: boolean, post: Post | null) => {
  let response: Response;
  if (!liked) {
    response = await fetch(`${SERVER.API.LIKE_POST}${post?.postId}`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
  } else {
    response = await fetch(`${SERVER.API.UNLIKE_POST}${post?.postId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) console.error(response.json());
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

  if (!response.ok) console.error(response.json());

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

  if (!response.ok) console.error(response.json());
  return await response.json();
};

export const fetchPostsOfSubscribedOnProfiles = async (
  lastLoadedPostCreatedAt: string,
): Promise<Post[]> => {
  const url = new URL(SERVER.API.GET_POSTS_OF_SUBSCRIBED_ON);

  if (lastLoadedPostCreatedAt) {
    url.searchParams.set('lastLoadedPostCreatedAt', lastLoadedPostCreatedAt);
  }

  const response: Response = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    console.error(await response.json());
    return [];
  }

  return await response.json();
};

export const fetchFirstPostOfSubscribedOnProfiles =
  async (): Promise<Post | null> => {
    const url = new URL(SERVER.API.PRELOAD_FIRST_POST_OF_SUBSCRIBED_ON);

    const response: Response = await fetch(url.toString(), {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      console.error(await response.json());
      return null;
    }

    const receivedData = await response.json();

    const receivedPost: Post = Array.isArray(receivedData)
      ? receivedData[0]
      : receivedData;

    return receivedPost || null;
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

  if (!response.ok) console.error(response.json());

  return await response.json();
};

export const archivePost = async (postId: string): Promise<Post> => {
  const response: Response = await fetch(
    `${SERVER.API.ARCHIVE_POST}${postId}`,
    {
      method: 'PUT',
      credentials: 'include',
    },
  );

  if (!response.ok) console.error(response.json());

  return await response.json();
};

export const unarchivePost = async (postId: string): Promise<Post> => {
  const response: Response = await fetch(
    `${SERVER.API.UNARCHIVE_POST}${postId}`,
    {
      method: 'PUT',
      credentials: 'include',
    },
  );

  if (!response.ok) console.error(response.json());

  return await response.json();
};

export const fetchAllArchivedPosts = async (): Promise<Post[]> => {
  const response: Response = await fetch(
    `${SERVER.API.GET_ALL_ARCHIVED_POSTS}`,
    {
      method: 'GET',
      credentials: 'include',
    },
  );

  if (!response.ok) console.error(response.json());

  return await response.json();
};

export const fetchActivity = async (): Promise<Post[]> => {
  const response: Response = await fetch(SERVER.API.GET_ACTIVITY, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) console.error(response.json());

  return await response.json();
};

export const fetchSinglePost = async (postId: string): Promise<Post> => {
  const response: Response = await fetch(
    `${SERVER.API.FETCH_POST_BY_ID}${postId}`,
    {
      method: 'GET',
      credentials: 'include',
    },
  );

  if (!response.ok) console.error(response.json());

  return await response.json();
};
