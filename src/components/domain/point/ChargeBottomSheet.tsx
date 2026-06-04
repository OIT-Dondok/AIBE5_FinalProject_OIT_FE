"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleAlert, CreditCard, Info, Loader2 } from "lucide-react";

import { BottomSheet } from "@/components/common/BottomSheet";

interface ChargeBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AMOUNTS = [5000, 10000, 30000, 50000] as const;
const MIN_CHARGE_AMOUNT = 1000;
const CHARGE_STEP_AMOUNT = 1000;

function formatKrw(value: number) {
  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

function formatInputValue(value: string) {
  if (!value) return "";
  return new Intl.NumberFormat("ko-KR").format(Number(value));
}

function getAmountError(amount: number | null) {
  if (amount == null) return "충전 금액을 입력해 주세요.";
  if (amount < MIN_CHARGE_AMOUNT) return "1,000원 이상부터 충전할 수 있어요.";
  if (amount % CHARGE_STEP_AMOUNT !== 0) return "1,000원 단위로 입력해 주세요.";
  return "";
}

export function ChargeBottomSheet({ isOpen, onClose }: ChargeBottomSheetProps) {
  const [amountInput, setAmountInput] = useState(String(PRESET_AMOUNTS[1]));
  const [mockStatus, setMockStatus] = useState<"idle" | "pending">("idle");

  const amount = useMemo(() => {
    if (!amountInput) return null;
    const numeric = Number(amountInput);
    return Number.isFinite(numeric) ? numeric : null;
  }, [amountInput]);

  const amountError = getAmountError(amount);
  const isValidAmount = amountError.length === 0 && amount != null;
  const selectedPreset = PRESET_AMOUNTS.find((preset) => preset === amount);

  useEffect(() => {
    if (!isOpen) {
      setMockStatus("idle");
      setAmountInput(String(PRESET_AMOUNTS[1]));
    }
  }, [isOpen]);

  const handleAmountChange = (next: string) => {
    setMockStatus("idle");
    const sanitized = next.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
    setAmountInput(sanitized);
  };

  const selectPreset = (value: number) => {
    setMockStatus("idle");
    setAmountInput(String(value));
  };

  const handleSubmit = () => {
    if (!isValidAmount) return;
    setMockStatus("pending");
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="도딘 충전" ariaLabel="도딘 충전 바텀시트">
      <div className="px-5 pb-6 pt-4">
        <div className="rounded-[22px] bg-primary-blue/10 px-4 py-3 text-primary-blue">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/70 shadow-sm">
              <CreditCard size={18} strokeWidth={2.4} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-text-primary">충전할 도딘을 선택해 주세요</p>
              <p className="mt-0.5 text-xs font-semibold text-text-secondary">실제 결제는 TossPayments 연동 후 활성화됩니다.</p>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-extrabold text-text-secondary">빠른 선택</p>
          <div className="mt-2 grid grid-cols-2 gap-2.5">
            {PRESET_AMOUNTS.map((preset) => {
              const isSelected = selectedPreset === preset;
              return (
                <button
                  type="button"
                  key={preset}
                  onClick={() => selectPreset(preset)}
                  className={`h-12 rounded-2xl border text-sm font-extrabold transition-all active:scale-[0.98] ${
                    isSelected
                      ? "border-primary-blue bg-primary-blue text-white shadow-sm shadow-primary-blue/20"
                      : "border-text-secondary/15 bg-background text-text-primary hover:border-primary-blue/40"
                  }`}
                  aria-pressed={isSelected}
                >
                  {formatKrw(preset)}
                </button>
              );
            })}
          </div>
        </div>

        <label className="mt-5 block">
          <span className="text-xs font-extrabold text-text-secondary">직접 입력</span>
          <div className="mt-2 flex h-13 items-center rounded-2xl border border-text-secondary/15 bg-background px-4 focus-within:border-primary-blue/80">
            <input
              type="text"
              value={formatInputValue(amountInput)}
              onChange={(event) => handleAmountChange(event.target.value)}
              inputMode="numeric"
              placeholder="1,000"
              className="min-w-0 flex-1 bg-transparent text-right text-[20px] font-black tabular-nums tracking-[-0.04em] text-text-primary outline-none placeholder:text-text-secondary/35"
              aria-invalid={amountError.length > 0}
              aria-describedby="charge-amount-helper"
            />
            <span className="ml-1 text-sm font-extrabold text-text-secondary">원</span>
          </div>
        </label>

        <div
          id="charge-amount-helper"
          className={`mt-2 flex items-center gap-1.5 text-xs font-semibold ${amountError ? "text-amber-700" : "text-text-secondary"}`}
        >
          {amountError ? <CircleAlert size={14} aria-hidden="true" /> : <Info size={14} aria-hidden="true" />}
          <span>{amountError || "1,000원 단위로 입력할 수 있어요."}</span>
        </div>

        <div className="mt-5 rounded-[22px] border border-text-secondary/10 bg-card px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-text-secondary">충전 금액</p>
              <p className="mt-1 text-[22px] font-black tracking-[-0.05em] text-text-primary tabular-nums">
                {formatKrw(amount ?? 0)}
              </p>
            </div>
            <span className="rounded-full bg-success-green/35 px-3 py-1 text-[11px] font-extrabold text-primary-green">
              결제 연동 예정
            </span>
          </div>
        </div>

        {mockStatus === "pending" && (
          <div className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-semibold leading-relaxed text-amber-800" aria-live="polite">
            결제창 연결 지점까지 확인했어요. TossPayments와 BE 충전 확정 API가 붙으면 이 버튼에서 결제창을 열 예정입니다.
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-2">
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
            {mockStatus === "pending" && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
            충전하기
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
