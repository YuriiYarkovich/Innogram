import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { SERVER } from '@/config/apiRoutes';
import { getDeviceId } from '@/utils/device';
import returnErrorMessage from '@/utils/showAuthError';

export const handleLogout = async (router: AppRouterInstance) => {
  const response: Response = await fetch(SERVER.API.LOG_OUT, {
    method: 'POST',
    credentials: 'include',
  });

  if (response.ok) {
    router.push(`/`);
  } else {
    console.error(`Message: ${JSON.stringify(response.json())}`);
  }
};

export const submitLogin = async (
  email: string,
  password: string,
  setError: (message: string) => void,
  router: AppRouterInstance,
) => {
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
    const finalMessage: string | undefined = await returnErrorMessage(response);
    if (finalMessage) setError(finalMessage);
    return;
  }

  if (response.status === 201) {
    router.push(`/feed`);
  }
};

export const submitRegistration = async (
  email: string,
  password: string,
  username: string,
  birthday: string,
  bio: string,
  setError: (message: string) => void,
  router: AppRouterInstance,
) => {
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
    const finalMessage: string | undefined = await returnErrorMessage(response);
    if (finalMessage) setError(finalMessage);
    return;
  }

  if (response.status === 201) {
    router.push('/feed');
  }
};
