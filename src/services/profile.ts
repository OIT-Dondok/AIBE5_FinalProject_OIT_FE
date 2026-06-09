import { api } from "@/lib/axios";
import type {
  HostOperationSummaryResponse,
  MeActivitySummaryResponse,
  MemberProfileResponse,
  ProfileUpdateResponse,
  UpdateProfileRequest,
  PresignedUrlRequest,
  PresignedUrlResponse,
} from "@/types/domain";

export const getMyProfile = () => api.get<MemberProfileResponse>("/me");

export const getMyActivitySummary = () =>
  api.get<MeActivitySummaryResponse>("/me/activity-summary");

export const getMyHostOperationSummary = () =>
  api.get<HostOperationSummaryResponse>("/me/host-operation-summary");

export const updateMyProfile = (payload: UpdateProfileRequest) =>
  api.patch<ProfileUpdateResponse>("/me/profile", payload);

export const requestProfileImageUploadUrl = (payload: PresignedUrlRequest) =>
  api.post<PresignedUrlResponse>("/uploads/presigned-url", payload);
