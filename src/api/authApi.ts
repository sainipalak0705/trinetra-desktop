/**
 * Authentication API Service
 */
import { apiFetch } from './client';

export interface UserInfo {
  username: string;
  full_name: string;
  role: 'admin' | 'operator' | string;
  created_at?: string;
  last_login?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserInfo;
}

export const authApi = {
  async login(username: string, password: string): Promise<LoginResponse> {
    return apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  async getMe(): Promise<UserInfo> {
    return apiFetch<UserInfo>('/auth/me');
  },
};
