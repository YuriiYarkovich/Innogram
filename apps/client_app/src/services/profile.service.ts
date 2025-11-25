import { SERVER } from '@/config/apiRoutes';
import returnErrorMessage from '@/utils/showAuthError';
import { Profile } from '@/types';

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
  avatar: File | null,
  setError: (message: string) => void,
  onClose: () => void,
) => {
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
};

export const fetchProfile = async () => {
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
  console.log(`Received profile data loh: ${JSON.stringify(profileData)}`);
  return profileData;
};
