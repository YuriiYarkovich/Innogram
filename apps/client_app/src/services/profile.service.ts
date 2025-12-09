import { SERVER } from '@/config/apiRoutes';
import returnErrorMessage from '@/utils/showAuthError';
import { Profile, SubscriptionRequest } from '@/types';

export const handleOnProfileFollowing = async (profile: Profile) => {
  const response: Response = await fetch(`${SERVER.API.FOLLOW}${profile.id}`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) console.error(response.json());
};

export const handleProfileUnfollow = async (profile: Profile) => {
  const response: Response = await fetch(
    `${SERVER.API.UNFOLLOW}${profile.id}`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  );

  if (!response.ok) console.error(response.json());
};

export const editProfile = async (
  username: string,
  bio: string,
  birthday: string,
  avatar: File | string | null | undefined,
  setError: (message: string) => void,
  onClose: () => void,
) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('bio', bio);
  formData.append('birthday', birthday);

  if (avatar) {
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
      console.error(`Error message: ${finalMessage}`);
    }
    return;
  }

  if (res.ok) {
    onClose();
    location.replace(`/profile/${username}`);
  }
};

export const fetchProfile = async (): Promise<Profile> => {
  const res: Response = await fetch(SERVER.API.GET_CURRENT_PROFILE_INFO, {
    credentials: 'include',
  });
  return await res.json();
};

export const fetchFullProfileData = async (username: string | undefined) => {
  let profileData: Profile;
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
  return profileData;
};

export const fetchAllSubscriptions = async (
  profileId: string,
): Promise<Profile[]> => {
  const response: Response = await fetch(
    `${SERVER.API.GET_ALL_SUBSCRIPTIONS}${profileId}`,
    {
      credentials: 'include',
      method: 'GET',
    },
  );

  if (!response.ok) console.error(response.json());

  const receivedSubscriptions: Profile[] = await response.json();

  return receivedSubscriptions;
};

export const fetchAllSubscribers = async (
  profileId: string,
): Promise<Profile[]> => {
  const response: Response = await fetch(
    `${SERVER.API.GET_ALL_SUBSCRIBERS}${profileId}`,
    {
      method: 'GET',
      credentials: 'include',
    },
  );

  if (!response.ok) console.error(response.json());

  return await response.json();
};

export const deleteSubscriber = async (deletingSubscriberProfileId: string) => {
  const response: Response = await fetch(
    `${SERVER.API.DELETE_SUBSCRIBER}${deletingSubscriberProfileId}`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  );

  if (!response.ok) console.error(response.json());
};

export const changeProfileVisibilityStatus = async (): Promise<Profile> => {
  const response: Response = await fetch(
    `${SERVER.API.CHANGE_VISIBILITY_OF_PROFILE_STATUS}`,
    {
      method: 'PUT',
      credentials: 'include',
    },
  );

  if (!response.ok) console.error(response.json());

  return await response.json();
};

export const fetchAllSubscriptionsRequests = async (): Promise<
  SubscriptionRequest[]
> => {
  const response: Response = await fetch(
    `${SERVER.API.GET_ALL_SUBSCRIPTIONS_REQUESTS}`,
    {
      method: 'GET',
      credentials: 'include',
    },
  );

  if (!response.ok) console.error(response.json());

  const receivedRequests: SubscriptionRequest[] = await response.json();
  console.log(`Received requests: ${JSON.stringify(receivedRequests)}`);

  return receivedRequests;
};

export const acceptRequest = async (subscriptionId: string) => {
  const response: Response = await fetch(
    `${SERVER.API.ACCEPT_REQUEST}${subscriptionId}`,
    {
      method: 'PUT',
      credentials: 'include',
    },
  );

  if (!response.ok) console.error(response.json());
};

export const rejectRequest = async (subscriptionId: string) => {
  const response: Response = await fetch(
    `${SERVER.API.REJECT_REQUEST}${subscriptionId}`,
    {
      method: 'PUT',
      credentials: 'include',
    },
  );

  if (!response.ok) console.error(response.json());
};
