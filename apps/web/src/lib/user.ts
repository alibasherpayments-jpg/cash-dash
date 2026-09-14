import { apiGet, apiPut } from "./api-client";
import type { ApiResponse, UserPublic } from "@cashdash/shared";

export interface UpdateProfilePayload {
  avatarUrl?: string;
  country?: string;
  bio?: string;
  isLeaderboardVisible?: boolean;
  isProfileVisible?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
}

export async function updateUserProfile(payload: UpdateProfilePayload): Promise<ApiResponse<any>> {
  return apiPut<ApiResponse<any>>("/users/me/profile", payload);
}

export async function getCurrentUser(): Promise<ApiResponse<UserPublic>> {
  return apiGet<ApiResponse<UserPublic>>("/users/me");
}
