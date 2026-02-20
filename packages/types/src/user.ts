export type AuthProvider = 'GOOGLE' | 'LOCAL';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: AuthProvider;
  createdAt: string;
}
