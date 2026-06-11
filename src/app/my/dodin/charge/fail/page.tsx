import Link from "next/link";
import { CircleAlert } from "lucide-react";

import { parseTossFailParams } from "@/components/domain/point/pointChargeFlow";

interface ChargeFailPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ChargeFailPage({ searchParams }: ChargeFailPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") query.set(key, value);
  }

  const fail = parseTossFailParams(query);
  const title = fail.isCanceled ? "결제가 취소됐어요" : "결제를 완료하지 못했어요";

  return (
    <main className="min-h-screen w-full bg-background px-5 py-14">
      <section className="mx-auto flex w-full max-w-[430px] flex-col items-center rounded-[28px] bg-card px-5 py-10 text-center shadow-card">
        <CircleAlert size={34} className="text-amber-700" aria-hidden="true" />
        <h1 className="mt-5 text-xl font-black tracking-[-0.04em] text-text-primary">{title}</h1>
        <p className="mt-3 text-sm font-semibold leading-relaxed text-text-secondary">{fail.message}</p>
        <p className="mt-3 rounded-full bg-text-secondary/10 px-3 py-1 text-[11px] font-bold text-text-secondary">
          {fail.code}
        </p>

        <div className="mt-7 grid w-full grid-cols-2 gap-2">
          <Link
            href="/my/dodin"
            className="rounded-2xl bg-text-secondary/10 px-4 py-3 text-sm font-extrabold text-text-primary"
          >
            지갑으로
          </Link>
          <Link href="/my/dodin" className="rounded-2xl bg-primary-blue px-4 py-3 text-sm font-extrabold text-white">
            다시 충전
          </Link>
        </div>
      </section>
    </main>
  );
}
