"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CircleAlert, Info, Loader2, RotateCcw } from "lucide-react";

import { BottomSheet } from "@/components/common/BottomSheet";
import {
  CHARGE_AMOUNT_POLICY,
  buildTossPaymentRequest,
  buildTossRedirectUrl,
  createChargeOrderId,
  createPendingChargeOrder,
  formatChargeAmountInput,
  getChargeAmountError,
  getTossClientConfigState,
  parseChargeAmountInput,
  resolveChargeInitialAmount,
  writePendingChargeOrder,
} from "@/components/domain/point/pointChargeFlow";
import { formatKrw } from "@/components/domain/point/pointViewModel";
import { requestTossPayment } from "@/components/domain/point/tossPaymentAdapter";

interface ChargeBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance?: number;
  initialAmount?: number;
}

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN;

function formatQuickAdd(value: number) {
  return `+${new Intl.NumberFormat("ko-KR").format(value / 10000)}만`;
}

export function ChargeBottomSheet({ isOpen, onClose, currentBalance, initialAmount }: ChargeBottomSheetProps) {
  const initialAmountInput = useMemo(() => String(resolveChargeInitialAmount(initialAmount)), [initialAmount]);
  const [amountInput, setAmountInput] = useState(initialAmountInput);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "launching">("idle");
  const [submitError, setSubmitError] = useState("");
  const submitLockRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    queueMicrotask(() => {
      setAmountInput(initialAmountInput);
      setPaymentStatus("idle");
      setSubmitError("");
      submitLockRef.current = false;
    });
  }, [initialAmountInput, isOpen]);

  const amount = useMemo(() => {
    if (!amountInput) return null;
    const numeric = Number(amountInput);
    return Number.isFinite(numeric) ? numeric : null;
  }, [amountInput]);

  const amountError = getChargeAmountError(amount);
  const tossConfig = getTossClientConfigState(TOSS_CLIENT_KEY);
  const configError = tossConfig.enabled ? "" : tossConfig.errorMessage;
  const isValidAmount = amountError.length === 0 && amount != null;
  const canSubmit = isValidAmount && tossConfig.enabled && paymentStatus === "idle";
  const projectedBalance =
    currentBalance != null && isValidAmount && amount != null ? currentBalance + amount : null;

  const handleAmountChange = (next: string) => {
    setPaymentStatus("idle");
    setSubmitError("");
    setAmountInput(parseChargeAmountInput(next).sanitized);
  };

  const addAmount = (delta: number) => {
    setPaymentStatus("idle");
    setSubmitError("");
    const base = amount ?? 0;
    const next = Math.min(base + delta, CHARGE_AMOUNT_POLICY.max);
    setAmountInput(String(next));
  };

  const resetAmount = () => {
    setPaymentStatus("idle");
    setSubmitError("");
    setAmountInput("");
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitLockRef.current || amount == null || !tossConfig.enabled) return;

    submitLockRef.current = true;
    setPaymentStatus("launching");
    setSubmitError("");

    try {
      const orderId = createChargeOrderId();
      const pendingOrder = createPendingChargeOrder(orderId, amount);
      const fallbackOrigin = typeof window === "undefined" ? undefined : window.location.origin;
      const successUrl = buildTossRedirectUrl({
        appOrigin: APP_ORIGIN,
        fallbackOrigin,
        path: "/my/dodin/charge/success",
      });
      const failUrl = buildTossRedirectUrl({
        appOrigin: APP_ORIGIN,
        fallbackOrigin,
        path: "/my/dodin/charge/fail",
      });

      writePendingChargeOrder(typeof window === "undefined" ? undefined : window.sessionStorage, pendingOrder);
      await requestTossPayment({
        clientKey: tossConfig.clientKey,
        customerKey: orderId,
        request: buildTossPaymentRequest({ amount, failUrl, orderId, successUrl }),
      });
    } catch (error) {
      submitLockRef.current = false;
      setPaymentStatus("idle");
      setSubmitError(error instanceof Error ? error.message : "결제창을 열지 못했어요. 다시 시도해 주세요.");
    }
  };

  const handleClose = () => {
    submitLockRef.current = false;
    setPaymentStatus("idle");
    setSubmitError("");
    setAmountInput(initialAmountInput);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="도딘 충전" ariaLabel="도딘 충전 바텀시트">
      <div className="px-5 pb-6 pt-4">
        <div className="relative overflow-hidden rounded-[26px] border border-primary-green/15 bg-primary-green/[0.06] px-5 pb-5 pt-6 duration-300 animate-in fade-in slide-in-from-bottom-2">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-6 -top-7 h-28 w-28 rounded-full bg-primary-green/[0.07] blur-[2px]"
          />
          <div className="relative flex items-center justify-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-primary-green/40 font-serif text-[13px] font-bold leading-none text-primary-green">
              D
            </span>
            <p className="text-xs font-extrabold tracking-tight text-primary-green">충전할 도딘</p>
          </div>

          <label className="mt-3 flex items-baseline justify-center gap-1">
            <input
              type="text"
              value={formatChargeAmountInput(amountInput)}
              onChange={(event) => handleAmountChange(event.target.value)}
              inputMode="numeric"
              placeholder="0"
              aria-label="충전 금액"
              aria-invalid={amountError.length > 0}
              aria-describedby="charge-amount-helper"
              className="w-auto min-w-0 max-w-[220px] bg-transparent text-center text-[40px] font-black leading-none tracking-[-0.05em] tabular-nums text-text-primary caret-primary-blue outline-none placeholder:text-text-secondary/25"
              size={Math.max(formatChargeAmountInput(amountInput).length, 1)}
            />
            <span className="text-[22px] font-black tracking-[-0.04em] text-text-primary/55">원</span>
          </label>

          <div className="relative mt-4 flex items-center justify-center gap-1.5">
            {CHARGE_AMOUNT_POLICY.presets.map((delta) => (
              <button
                type="button"
                key={delta}
                onClick={() => addAmount(delta)}
                disabled={paymentStatus === "launching"}
                className="rounded-full border border-primary-green/25 bg-card/70 px-3 py-1.5 text-[12px] font-extrabold text-primary-green shadow-sm transition-all hover:border-primary-green/50 active:scale-[0.94] disabled:opacity-50"
              >
                {formatQuickAdd(delta)}
              </button>
            ))}
            <button
              type="button"
              onClick={resetAmount}
              disabled={paymentStatus === "launching"}
              aria-label="금액 초기화"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-text-secondary/10 text-text-secondary transition-all hover:bg-text-secondary/15 active:scale-[0.94] disabled:opacity-50"
            >
              <RotateCcw size={14} strokeWidth={2.4} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          id="charge-amount-helper"
          className={`mt-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold ${
            amountError ? "text-amber-700" : "text-text-secondary"
          }`}
        >
          {amountError ? <CircleAlert size={14} aria-hidden="true" /> : <Info size={14} aria-hidden="true" />}
          <span>{amountError || "1,000원 단위로 충전할 수 있어요."}</span>
        </div>

        {currentBalance != null && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-[20px] border border-text-secondary/10 bg-card px-4 py-3.5 shadow-sm duration-300 animate-in fade-in slide-in-from-bottom-2 [animation-delay:60ms] [animation-fill-mode:both]">
            <p className="text-xs font-bold text-text-secondary">충전 후 사용가능 도딘</p>
            <div className="flex items-baseline gap-1.5">
              {projectedBalance != null ? (
                <>
                  <span className="text-[11px] font-semibold text-text-secondary/60 tabular-nums">
                    {formatKrw(currentBalance)}
                  </span>
                  <span className="text-[11px] font-bold text-primary-green">→</span>
                  <span className="text-[17px] font-black tracking-[-0.03em] text-primary-green tabular-nums">
                    {formatKrw(projectedBalance)}
                  </span>
                </>
              ) : (
                <span className="text-[15px] font-black tracking-[-0.03em] text-text-primary/40 tabular-nums">
                  {formatKrw(currentBalance)}
                </span>
              )}
            </div>
          </div>
        )}

        <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-text-secondary/70">
          <span className="rounded-full bg-success-green/45 px-2 py-0.5 text-[10px] font-extrabold text-primary-green">
            결제 연동
          </span>
          TossPayments 결제 후 서버 확인이 완료되어야 도딘이 충전돼요.
        </p>

        {(submitError || configError) && (
          <div
            className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-semibold leading-relaxed text-amber-800 duration-200 animate-in fade-in"
            aria-live="polite"
          >
            {submitError || configError}
          </div>
        )}

        <div className="mt-6 grid grid-cols-[1fr_2fr] gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="h-12 rounded-2xl bg-text-secondary/10 text-sm font-extrabold text-text-primary transition-transform active:scale-[0.98]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex h-12 items-center justify-center gap-1.5 rounded-2xl bg-primary-blue text-sm font-extrabold text-white shadow-sm shadow-primary-blue/20 transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-text-secondary/25 disabled:text-text-secondary"
          >
            {paymentStatus === "launching" && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
            {isValidAmount && amount != null ? `${formatKrw(amount)} 충전하기` : "충전하기"}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
