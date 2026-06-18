export const DEFAULT_OAUTH_FAILURE_REASON = "oauth_login_failed";

export const OAUTH_FAILURE_MESSAGES: Record<string, string> = {
  oauth_email_not_verified: "Google 이메일 인증이 필요합니다.",
  oauth_account_conflict: "이미 다른 OAuth 계정과 연결된 이메일입니다.",
  member_deactivated: "비활성화된 회원입니다.",
  [DEFAULT_OAUTH_FAILURE_REASON]: "Google 로그인에 실패했습니다. 다시 시도해주세요.",
};

export function getOAuthFailureMessage(reason: string | null) {
  if (!reason) return OAUTH_FAILURE_MESSAGES[DEFAULT_OAUTH_FAILURE_REASON];
  return OAUTH_FAILURE_MESSAGES[reason] ?? OAUTH_FAILURE_MESSAGES[DEFAULT_OAUTH_FAILURE_REASON];
}

export function getOAuthLoginErrorHref(reason: string | null) {
  return `/login?oauthError=${encodeURIComponent(reason ?? DEFAULT_OAUTH_FAILURE_REASON)}`;
}
