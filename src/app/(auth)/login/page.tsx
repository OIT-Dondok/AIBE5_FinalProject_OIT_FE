import { getOAuthFailureMessage } from "@/lib/oauth";
import { LoginPageClient } from "./LoginPageClient";

type LoginPageProps = {
  searchParams: Promise<{
    oauthError?: string | string[];
  }>;
};

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const oauthError = getSingleParam((await searchParams).oauthError);
  const loginNotice = oauthError ? getOAuthFailureMessage(oauthError) : "";

  return <LoginPageClient loginNotice={loginNotice} />;
}
