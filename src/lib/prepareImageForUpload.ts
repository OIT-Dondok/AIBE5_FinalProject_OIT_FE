// 업로드 전 이미지 전처리.
// - HEIF/HEIC는 백엔드/브라우저 호환을 위해 JPEG로 변환 (EXIF 소실 → converted=true로 알림)
// - 그 외 허용 포맷(JPEG/PNG/GIF/BMP/WEBP)은 원본 그대로 업로드
// - 그 외 포맷은 지원하지 않음(throw)

export interface PreparedImage {
  /** 업로드할 파일 (HEIC면 변환된 JPEG, 아니면 원본) */
  file: File;
  /** presigned URL 요청·S3 PUT에 사용할 Content-Type */
  contentType: string;
  /** HEIC→JPEG 변환이 일어났는지 (EXIF 소실 경고용) */
  converted: boolean;
}

/** 원본 그대로 업로드 가능한 허용 포맷 (백엔드가 원본 수신) */
const PASSTHROUGH_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/webp',
]);

const HEIC_EXTENSION = /\.(heic|heif)$/i;
const JPEG_QUALITY = 0.8;

/** 지원하지 않는 이미지 포맷일 때 발생 */
export class UnsupportedImageError extends Error {
  constructor() {
    super('지원하지 않는 이미지 형식이에요. JPG·PNG·GIF·BMP·WEBP·HEIC만 업로드할 수 있어요.');
    this.name = 'UnsupportedImageError';
  }
}

/** HEIC/HEIF 여부 판별. 일부 브라우저가 type을 비워 주므로 확장자도 함께 확인 */
function isHeic(file: File): boolean {
  const type = file.type.toLowerCase();
  if (type.includes('heic') || type.includes('heif')) return true;
  return HEIC_EXTENSION.test(file.name);
}

/** HEIC 파일명을 .jpg로 보정 */
function toJpegFileName(name: string): string {
  return HEIC_EXTENSION.test(name) ? name.replace(HEIC_EXTENSION, '.jpg') : `${name}.jpg`;
}

/**
 * 업로드할 이미지를 전처리해 { file, contentType, converted }를 반환한다.
 * @throws {UnsupportedImageError} 허용되지 않는 포맷
 * @throws {Error} HEIC 변환 실패
 */
export async function prepareImageForUpload(file: File): Promise<PreparedImage> {
  if (isHeic(file)) {
    // heic2any는 브라우저 전용(window/canvas 사용) → 사용 시점에 동적 import
    const { default: heic2any } = await import('heic2any');
    const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: JPEG_QUALITY });
    const jpegBlob = Array.isArray(result) ? result[0] : result;
    const jpegFile = new File([jpegBlob], toJpegFileName(file.name), { type: 'image/jpeg' });
    return { file: jpegFile, contentType: 'image/jpeg', converted: true };
  }

  const type = file.type.toLowerCase();
  if (!PASSTHROUGH_MIME_TYPES.has(type)) {
    throw new UnsupportedImageError();
  }
  return { file, contentType: type, converted: false };
}
