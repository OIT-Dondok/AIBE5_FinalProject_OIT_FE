"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleAlert, Info, Loader2, RotateCcw } from "lucide-react";

import { BottomSheet } from "@/components/common/BottomSheet";

interface ChargeBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance?: number;
}

const QUICK_ADD_AMOUNTS = [10000, 30000, 50000, 100000] as const;
const MIN_CHARGE_AMOUNT = 1000;
const CHARGE_STEP_AMOUNT = 1000;
const MAX_CHARGE_AMOUNT = 1000000;

function formatKrw(value: number) {
  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

function formatQuickAdd(value: number) {
  return `+${new Intl.NumberFormat("ko-KR").format(value / 10000)}만`;
}

function formatInputValue(value: string) {
  if (!value) return "";
  return new Intl.NumberFormat("ko-KR").format(Number(value));
}

function getAmountError(amount: number | null) {
  if (amount == null) return "충전 금액을 입력해 주세요.";
  if (amount < MIN_CHARGE_AMOUNT) return "1,000원 이상부터 충전할 수 있어요.";
  if (amount % CHARGE_STEP_AMOUNT !== 0) return "1,000원 단위로 입력해 주세요.";
  if (amount > MAX_CHARGE_AMOUNT) return "한 번에 1,000,000원까지 충전할 수 있어요.";
  return "";
}

export function ChargeBottomSheet({ isOpen, onClose, currentBalance }: ChargeBottomSheetProps) {
  const [amountInput, setAmountInput] = useState(String(QUICK_ADD_AMOUNTS[0]));
  const [mockStatus, setMockStatus] = useState<"idle" | "pending">("idle");

  const amount = useMemo(() => {
    if (!amountInput) return null;
    const numeric = Number(amountInput);
    return Number.isFinite(numeric) ? numeric : null;
  }, [amountInput]);

  const amountError = getAmountError(amount);
  const isValidAmount = amountError.length === 0 && amount != null;
  const projectedBalance =
    currentBalance != null && isValidAmount && amount != null ? currentBalance + amount : null;

  useEffect(() => {
    if (!isOpen) {
      setMockStatus("idle");
      setAmountInput(String(QUICK_ADD_AMOUNTS[0]));
    }
  }, [isOpen]);

  const handleAmountChange = (next: string) => {
    setMockStatus("idle");
    const sanitized = next.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "").slice(0, 7);
    setAmountInput(sanitized);
  };

  const addAmount = (delta: number) => {
    setMockStatus("idle");
    const base = amount ?? 0;
    const next = Math.min(base + delta, MAX_CHARGE_AMOUNT);
    setAmountInput(String(next));
  };

  const resetAmount = () => {
    setMockStatus("idle");
    setAmountInput("");
  };

  const handleSubmit = () => {
    if (!isValidAmount) return;
    setMockStatus("pending");
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="도딘 충전" ariaLabel="도딘 충전 바텀시트">
      <div className="px-5 pb-6 pt-4">
        {/* 히어로 — 충전 금액 입력 */}
        <div className="relative overflow-hidden rounded-[26px] border border-primary-green/15 bg-primary-green/[0.06] px-5 pb-5 pt-6 duration-300 animate-in fade-in slide-in-from-bottom-2">
          {/* 도딘 코인 모티프 (배경 지폐 패턴과 동일 D 코인) */}
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
              value={formatInputValue(amountInput)}
              onChange={(event) => handleAmountChange(event.target.value)}
              inputMode="numeric"
              placeholder="0"
              aria-label="충전 금액"
              aria-invalid={amountError.length > 0}
              aria-describedby="charge-amount-helper"
              className="w-auto min-w-0 max-w-[220px] bg-transparent text-center text-[40px] font-black leading-none tracking-[-0.05em] tabular-nums text-text-primary caret-primary-blue outline-none placeholder:text-text-secondary/25"
              size={Math.max(formatInputValue(amountInput).length, 1)}
            />
            <span className="text-[22px] font-black tracking-[-0.04em] text-text-primary/55">원</span>
          </label>

          <div className="relative mt-4 flex items-center justify-center gap-1.5">
            {QUICK_ADD_AMOUNTS.map((delta) => (
              <button
                type="button"
                key={delta}
                onClick={() => addAmount(delta)}
                className="rounded-full border border-primary-green/25 bg-card/70 px-3 py-1.5 text-[12px] font-extrabold text-primary-green shadow-sm transition-all hover:border-primary-green/50 active:scale-[0.94]"
              >
                {formatQuickAdd(delta)}
              </button>
            ))}
            <button
              type="button"
              onClick={resetAmount}
              aria-label="금액 초기화"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-text-secondary/10 text-text-secondary transition-all hover:bg-text-secondary/15 active:scale-[0.94]"
            >
              <RotateCcw size={14} strokeWidth={2.4} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* 헬퍼 / 에러 */}
        <div
          id="charge-amount-helper"
          className={`mt-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold ${
            amountError ? "text-amber-700" : "text-text-secondary"
          }`}
        >
          {amountError ? (
            <CircleAlert size={14} aria-hidden="true" />
          ) : (
            <Info size={14} aria-hidden="true" />
          )}
          <span>{amountError || "1,000원 단위로 충전할 수 있어요."}</span>
        </div>

        {/* 충전 후 예상 잔액 */}
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

        {/* 결제 연동 예정 안내 */}
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-text-secondary/70">
          <span className="rounded-full bg-success-green/45 px-2 py-0.5 text-[10px] font-extrabold text-primary-green">
            결제 연동 예정
          </span>
          실제 결제는 TossPayments 연동 후 활성화됩니다.
        </p>

        {mockStatus === "pending" && (
          <div
            className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-semibold leading-relaxed text-amber-800 duration-200 animate-in fade-in"
            aria-live="polite"
          >
            결제창 연결 지점까지 확인했어요. TossPayments와 BE 충전 확정 API가 붙으면 이 버튼에서 결제창을 열 예정입니다.
          </div>
        )}

        {/* CTA */}
        <div className="mt-6 grid grid-cols-[1fr_2fr] gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-2xl bg-text-secondary/10 text-sm font-extrabold text-text-primary transition-transform active:scale-[0.98]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValidAmount}
            className="flex h-12 items-center justify-center gap-1.5 rounded-2xl bg-primary-blue text-sm font-extrabold text-white shadow-sm shadow-primary-blue/20 transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-text-secondary/25 disabled:text-text-secondary"
          >
            {mockStatus === "pending" && (
              <Loader2 size={15} className="animate-spin" aria-hidden="true" />
            )}
            {isValidAmount && amount != null ? `${formatKrw(amount)} 충전하기` : "충전하기"}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
