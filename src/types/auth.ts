export type Plan = 'FREE' | 'PRO' | 'PREMIUM';

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  plan: Plan;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expires: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
  token?: string;
}
