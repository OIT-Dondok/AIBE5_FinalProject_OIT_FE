import { isAxiosError } from "axios";

import type { ErrorResponse } from "@/types/common";

// 호출부에서 fallback을 안 넘겨도 안전하도록 하는 기본 문구
const DEFAULT_FALLBACK = "요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.";

/**
 * API 에러를 사용자용 문구로 변환한다.
 *
 * 우선순위: codeMap[code] → BE message(error.response.data.message) → fallback
 * - axios 에러가 아니거나(네트워크/취소 등) code가 codeMap에 없으면 BE message 또는 fallback으로 폴백한다.
 * - codeMap은 호출부 문맥에 맞는 코드별 문구를 직접 전달한다(전역 맵 없음).
 *
 * @example
 * const CODE_MAP = { NICKNAME_ALREADY_EXISTS: "이미 사용 중인 닉네임이에요." };
 * showToast(getApiErrorMessage(err, CODE_MAP, "프로필 수정에 실패했어요."), "error");
 */
export function getApiErrorMessage(
  error: unknown,
  codeMap: Record<string, string> = {},
  fallback: string = DEFAULT_FALLBACK,
): string {
  if (!isAxiosError<ErrorResponse>(error)) {
    return fallback;
  }

  const code = error.response?.data?.code;
  return (code && codeMap[code]) || error.response?.data?.message || fallback;
}
