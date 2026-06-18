"use client";

import { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlert, Loader2 } from "lucide-react";

import type { ErrorResponse } from "@/types/common";

import {
  buildPointChargePayload,
  buildWalletConfirmedUrl,
  classifyPendingOrder,
  clearPendingChargeOrder,
  parseTossSuccessParams,
  readPendingChargeOrder,
  shouldConfirmOnRouteEnter,
} from "@/components/domain/point/pointChargeFlow";
import { chargePoints } from "@/services/point";

interface ChargeSuccessClientProps {
  queryString: string;
}

type ConfirmState =
  | "invalid_params"
  | "pending_mismatch"
  | "confirming"
  | "confirmed_refreshing"
  | "confirm_failed_retry_visible"
  | "confirm_failed_no_retry";

// 재시도해도 동일하게 실패하는(정보 불일치) 코드 — 재시도 대신 문의 안내
const NON_RETRYABLE_CHARGE_CODES = new Set([
  "PAYMENT_ID_REUSED_WITH_DIFFERENT_AMOUNT",
  "INVALID_AMOUNT",
  "INVALID_PAYMENT_ID",
]);

export function ChargeSuccessClient({ queryString }: ChargeSuccessClientProps) {
  const router = useRouter();
  const parsedParams = useMemo(() => parseTossSuccessParams(new URLSearchParams(queryString)), [queryString]);
  const [state, setState] = useState<ConfirmState>(() => (parsedParams.ok ? "confirming" : "invalid_params"));
  const [message, setMessage] = useState("도딘 충전을 확인하고 있어요.");

  const confirmCharge = async () => {
    if (!parsedParams.ok) return;

    const pending = readPendingChargeOrder(typeof window === "undefined" ? undefined : window.sessionStorage);
    const pendingStatus = classifyPendingOrder(pending, {
      amount: parsedParams.amount,
      orderId: parsedParams.orderId,
    });

    if (!shouldConfirmOnRouteEnter(pendingStatus.status)) {
      setState("pending_mismatch");
      setMessage(pendingStatus.message ?? "결제 세션 정보가 일치하지 않아요. 다시 시도하거나 문의해주세요.");
      return;
    }

    setState("confirming");
    setMessage("서버에서 결제 성공 여부를 확인하고 있어요.");

    try {
      const { data } = await chargePoints(
        buildPointChargePayload({
          amount: parsedParams.amount,
          orderId: parsedParams.orderId,
          paymentKey: parsedParams.paymentKey,
        }),
      );

      clearPendingChargeOrder(typeof window === "undefined" ? undefined : window.sessionStorage);
      setState("confirmed_refreshing");
      setMessage("충전이 확인됐어요. 지갑을 새로고침하고 있어요.");
      router.replace(buildWalletConfirmedUrl({ amount: data.amount, pointHistoryId: data.point_history_id }));
    } catch (error) {
      const code = isAxiosError<ErrorResponse>(error)
        ? error.response?.data?.code
        : undefined;

      if (code && NON_RETRYABLE_CHARGE_CODES.has(code)) {
        setState("confirm_failed_no_retry");
        setMessage("결제 정보가 일치하지 않아요. 고객센터로 문의해 주세요.");
        return;
      }

      setState("confirm_failed_retry_visible");
      setMessage("결제는 완료됐을 수 있어요. 같은 결제 건으로 서버 확인을 다시 시도해 주세요.");
    }
  };

  const retryConfirm = () => {
    queueMicrotask(() => {
      void confirmCharge();
    });
  };

  useEffect(() => {
    if (!parsedParams.ok) {
      queueMicrotask(() => {
        setState("invalid_params");
        setMessage("결제 승인 정보가 올바르지 않아요. 다시 시도해 주세요.");
      });
      return;
    }

    queueMicrotask(() => {
      void confirmCharge();
    });
    // confirmCharge intentionally runs once for the current redirect params.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedParams]);

  const canRetry =
    state === "confirm_failed_retry_visible" ||
    state === "confirm_failed_no_retry" ||
    state === "invalid_params" ||
    state === "pending_mismatch";

  return (
    <main className="min-h-screen w-full bg-background px-5 py-14">
      <section className="mx-auto flex w-full max-w-[430px] flex-col items-center rounded-[28px] bg-card px-5 py-10 text-center shadow-card">
        {canRetry ? (
          <CircleAlert size={34} className="text-amber-700" aria-hidden="true" />
        ) : (
          <Loader2 size={34} className="animate-spin text-primary-blue" aria-hidden="true" />
        )}
        <h1 className="mt-5 text-xl font-black tracking-[-0.04em] text-text-primary">도딘 충전 확인</h1>
        <p className="mt-3 text-sm font-semibold leading-relaxed text-text-secondary">{message}</p>

        {canRetry &&
          (state === "confirm_failed_no_retry" ? (
            <Link
              href="/my/dodin"
              className="mt-7 w-full rounded-2xl bg-primary-blue px-4 py-3 text-center text-sm font-extrabold text-white"
            >
              지갑으로
            </Link>
          ) : (
            <div className="mt-7 grid w-full grid-cols-2 gap-2">
              <Link
                href="/my/dodin"
                className="rounded-2xl bg-text-secondary/10 px-4 py-3 text-sm font-extrabold text-text-primary"
              >
                지갑으로
              </Link>
              {state === "confirm_failed_retry_visible" ? (
                <button
                  type="button"
                  onClick={retryConfirm}
                  className="rounded-2xl bg-primary-blue px-4 py-3 text-sm font-extrabold text-white"
                >
                  확인 재시도
                </button>
              ) : (
                <Link href="/my/dodin" className="rounded-2xl bg-primary-blue px-4 py-3 text-sm font-extrabold text-white">
                  지갑에서 다시 시작
                </Link>
              )}
            </div>
          ))}
      </section>
    </main>
  );
}
