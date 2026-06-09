import { api } from '@/lib/axios';
import type { PresignedUrlRequest, PresignedUrlResponse } from '@/types/domain';

export const getPresignedUrl = (body: PresignedUrlRequest) =>
  api.post<PresignedUrlResponse>('/uploads/presigned-url', body);

export const uploadToS3 = async (
  uploadUrl: string,
  file: File,
): Promise<void> => {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`S3 upload failed: ${response.status}`);
  }
};
