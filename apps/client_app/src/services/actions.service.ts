import { SERVER } from '@/config/apiRoutes';
import { router } from 'next/client';
import { getDeviceId } from '@/utils/device';
import returnErrorMessage from '@/utils/showAuthError';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import FetchService from '@/services/fetch.service';

export default class ActionsService {
  private fetchService: FetchService = new FetchService();

  async handleLogout() {
    const response: Response = await fetch(SERVER.API.LOG_OUT, {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      router.push(`/`);
    } else {
      console.error(`Message: ${JSON.stringify(response.json())}`);
    }
  }

  async handleFollowing(profile: Profile) {
    const response: Response = await fetch(
      `${SERVER.API.FOLLOW}${profile.profileId}`,
      {
        method: 'POST',
        credentials: 'include',
      },
    );

    if (!response.ok) console.error(response.json());
  }

  async handleUnfollow(profile: Profile) {
    const response: Response = await fetch(
      `${SERVER.API.UNFOLLOW}${profile.profileId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      },
    );

    if (!response.ok) console.error(response.json());
  }

  async submitLogin(
    email: string,
    password: string,
    setError: (message: string) => void,
    router: AppRouterInstance,
  ) {
    const deviceId: string = getDeviceId();
    const response: Response = await fetch(SERVER.API.LOG_IN, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'x-device-id': deviceId,
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    if (!response.ok) {
      const finalMessage: string | undefined =
        await returnErrorMessage(response);
      if (finalMessage) setError(finalMessage);
      return;
    }

    if (response.status === 201) {
      router.push(`/feed`);
    }
  }
  async submitRegistration(
    email: string,
    password: string,
    username: string,
    birthday: string,
    bio: string,
    setError: (message: string) => void,
    router: AppRouterInstance,
  ) {
    const deviceId: string = getDeviceId();
    const response: Response = await fetch(SERVER.API.REGISTRATION, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'x-device-id': deviceId,
      },
      body: JSON.stringify({
        email,
        password,
        username,
        birthday,
        bio,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      const finalMessage: string | undefined =
        await returnErrorMessage(response);
      if (finalMessage) setError(finalMessage);
      return;
    }

    if (response.status === 201) {
      router.push('/feed');
    }
  }

  async createPost(content: string, file: File | null, onClose: () => void) {
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
  }

  async likeOrUnlikePost(liked: boolean, post: Post) {
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
  }

  async addComment(
    commentContent: string,
    post: Post,
    respondingComment: PostComment | undefined,
    isRespondingOnComment: boolean,
    setIsRespondingOnComment: (isRespondingOnComment: boolean) => void,
    setCommentsLoading: (isCommentsLoading: boolean) => void,
    setComments: (comments: PostComment[]) => void,
  ) {
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
      const finalMessage: string | undefined =
        await returnErrorMessage(response);
      if (finalMessage) console.error(finalMessage);
      return;
    }

    if (isRespondingOnComment) setIsRespondingOnComment(false);
    await this.fetchService.fetchComments(
      post,
      setCommentsLoading,
      setComments,
    );
  }

  async deletePost(post: Post, onClose: () => void) {
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
  }

  async editProfile(
    username: string,
    bio: string,
    birthday: string,
    avatar: File | null,
    setError: (message: string) => void,
    onClose: () => void,
  ) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('bio', bio);
    formData.append('birthday', birthday);

    if (avatar) {
      console.log(`Sending file`);
      formData.append('file', avatar);
    }

    const res: Response = await fetch(SERVER.API.EDIT_PROFILE, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
    });

    if (!res.ok) {
      const finalMessage: string | undefined = await returnErrorMessage(res);
      if (finalMessage) {
        setError(finalMessage);
        console.log(`Error message: ${finalMessage}`);
      }
      return;
    }

    if (res.ok) {
      onClose();
      location.replace(`/profile/${username}`);
    }
  }
}
