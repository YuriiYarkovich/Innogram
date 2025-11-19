import { SERVER } from '@/config/apiRoutes';
import PostComment from '@/components/post/post-comment';

export default class FetchService {
  async fetchProfile(setCurProfile: (data: Profile) => void) {
    const res: Response = await fetch(SERVER.API.GET_CURRENT_PROFILE_INFO, {
      credentials: 'include',
    });
    const data: Profile = await res.json();
    setCurProfile(data);
  }

  async fetchPostsOfsubscribedOnProfiles(
    setPosts: (data: Post[]) => void,
    setLoading: (state: boolean) => void,
  ) {
    try {
      const res: Response = await fetch(SERVER.API.GET_POSTS_OF_SUBSCRIBED_ON, {
        credentials: 'include',
      });
      const data: Post[] = await res.json();
      setPosts(data);
    } finally {
      setLoading(false);
    }
  }

  async fetchPostsOfProfile(
    profileId: string,
    setPosts: (postData: Post[]) => void,
  ) {
    const resPosts: Response = await fetch(
      `${SERVER.API.GEL_ALL_POSTS_OF_PROFILE}${profileId}`,
      {
        credentials: 'include',
      },
    );
    const postsData: Post[] = await resPosts.json();
    setPosts(postsData);
  }

  async fetchFullProfileData(
    username: string | undefined,
    setFollowersAmount: (subscribersAmount: number) => void,
    setIsFollowed: (isSubscribed: boolean) => void,
    setProfile: (profileData: Profile) => void,
    updatePostsArray: (profileId: string) => Promise<void>,
    setProfileLoading: (isProfileLoading: boolean) => void,
    setPostsLoading: (isPostsLoading: boolean) => void,
  ) {
    let profileData: Profile;
    try {
      if (!username) {
        const resProfile: Response = await fetch(
          SERVER.API.GET_CURRENT_PROFILE_INFO,
          {
            credentials: 'include',
          },
        );
        profileData = await resProfile.json();
      } else {
        const resProfile: Response = await fetch(
          `${SERVER.API.GET_CURRENT_PROFILE_INFO}/${username}`,
          {
            credentials: 'include',
          },
        );
        profileData = await resProfile.json();
      }
      setFollowersAmount(profileData.subscribersAmount);
      setIsFollowed(profileData.isSubscribed);
      setProfile(profileData);
      await updatePostsArray(profileData?.profileId);
    } finally {
      setProfileLoading(false);
      setPostsLoading(false);
    }
  }

  async fetchComments(
    post: Post,
    setCommentsLoading: (isLoading: boolean) => void,
    setComments: (commentsData: PostComment[]) => void,
  ) {
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
      console.log(`Comments data: ${JSON.stringify(commentsData)}`);
      setComments(commentsData);
    } finally {
      setCommentsLoading(false);
    }
  }
}
