export interface User {
  isActive: boolean;
  isEmailVerified: boolean;
  email: string;
  lastUpdatedAt: number;
  createdAt: number;
  userId: string;
  websiteIdentifier: string;
  githubUserName: string;
}
