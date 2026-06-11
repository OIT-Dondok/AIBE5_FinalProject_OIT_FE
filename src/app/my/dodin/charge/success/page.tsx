import { ChargeSuccessClient } from "@/app/my/dodin/charge/success/ChargeSuccessClient";

interface ChargeSuccessPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ChargeSuccessPage({ searchParams }: ChargeSuccessPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") query.set(key, value);
  }

  return <ChargeSuccessClient queryString={query.toString()} />;
}
