"use client";

import { AlertTriangle, Plus } from "lucide-react";

import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { formatKrw } from "@/components/domain/point/pointViewModel";

interface DodinShortageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCharge: () => void;
  requiredAmount: number;
  currentBalance: number;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs font-semibold text-text-secondary">{label}</span>
      <span className="text-sm font-bold tabular-nums text-text-primary">{value}</span>
    </div>
  );
}

export function DodinShortageModal({
  isOpen,
  onCharge,
  onClose,
  requiredAmount,
  currentBalance,
}: DodinShortageModalProps) {
  const shortageAmount = Math.max(requiredAmount - currentBalance, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="도딘이 부족합니다" className="overflow-hidden p-0">
      <div className="px-5 pb-5 pt-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <AlertTriangle size={28} strokeWidth={2.4} aria-hidden="true" />
        </div>

        <div className="mt-4 text-center">
          <h2 className="text-xl font-black tracking-tight text-text-primary">도딘이 부족해요</h2>
          <p className="mt-1.5 text-xs font-medium text-text-secondary">
            충전하면 바로 이어서 진행할 수 있어요
          </p>
        </div>

        {/* 금액 내역: 필요·보유는 보조 행, 부족액은 점선 아래 강조 */}
        <div className="mt-5 rounded-2xl bg-background px-4 py-4">
          <div className="flex flex-col gap-2.5">
            <InfoRow label="필요한 도딘" value={formatKrw(requiredAmount)} />
            <InfoRow label="현재 사용가능" value={formatKrw(currentBalance)} />
          </div>

          <div className="mt-3 flex items-center justify-between gap-4 border-t border-dashed border-text-secondary/25 pt-3">
            <span className="text-xs font-bold text-text-secondary">부족한 도딘</span>
            <span className="text-xl font-black tabular-nums text-amber-600">
              {formatKrw(shortageAmount)}
            </span>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <Button type="button" variant="outline" size="md" fullWidth onClick={onClose}>
            나중에
          </Button>
          <Button type="button" variant="primary-blue" size="md" fullWidth className="gap-1.5" onClick={onCharge}>
            <Plus size={16} strokeWidth={2.8} aria-hidden="true" />
            충전하기
          </Button>
        </div>
      </div>
    </Modal>
  );
}
