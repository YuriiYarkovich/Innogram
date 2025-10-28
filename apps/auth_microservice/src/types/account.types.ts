export interface Account {
  id: string;
  userId: string;
  email: string;
  provider: string;
}

export interface AccountWithProfileId {
  id: string;
  email: string;
  userId: string;
  role: string;
  profileId: string;
}
