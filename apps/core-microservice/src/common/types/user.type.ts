export interface UserInAccessToken {
  profileId: string;
  role: string;
}

export type UserInWebSocket = {
  clientId: string;
  profileId: string;
};

export function isUserInAccessToken(obj: unknown): obj is UserInAccessToken {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as any).id === 'number' &&
    typeof (obj as any).name === 'string'
  );
}
