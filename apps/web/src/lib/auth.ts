import { apiPost } from './api-client';
import type { ApiResponse, UserPublic } from '@cashdash/shared';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  referralCode?: string;
}

export interface AuthResponse {
  user: UserPublic;
  accessToken?: string;
}

export async function login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
  return apiPost<ApiResponse<AuthResponse>>('/auth/login', credentials);
}

export async function register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
  return apiPost<ApiResponse<AuthResponse>>('/auth/register', data);
}

export interface GoogleAuthData {
  credential: string;
  referralCode?: string;
}

export async function loginWithGoogle(data: GoogleAuthData): Promise<ApiResponse<AuthResponse>> {
  return apiPost<ApiResponse<AuthResponse>>('/auth/google', data);
}

export async function logout(): Promise<ApiResponse<void>> {
  return apiPost<ApiResponse<void>>('/auth/logout');
}

export async function refreshToken(): Promise<ApiResponse<AuthResponse>> {
  return apiPost<ApiResponse<AuthResponse>>('/auth/refresh');
}

export async function forgotPassword(email: string): Promise<ApiResponse<void>> {
  return apiPost<ApiResponse<void>>('/auth/forgot-password', { email });
}

export async function resetPassword(token: string, password: string): Promise<ApiResponse<void>> {
  return apiPost<ApiResponse<void>>('/auth/reset-password', { token, password });
}

export async function verifyEmail(token: string): Promise<ApiResponse<void>> {
  return apiPost<ApiResponse<void>>('/auth/verify-email', { token });
}

export async function getMe(): Promise<ApiResponse<UserPublic>> {
  const { apiGet } = await import('./api-client');
  return apiGet<ApiResponse<UserPublic>>('/auth/me');
}
