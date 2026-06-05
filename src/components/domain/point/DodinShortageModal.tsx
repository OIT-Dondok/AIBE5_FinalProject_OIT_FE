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

function AmountRow({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-background px-4 py-3">
      <span className="text-xs font-bold text-text-secondary">{label}</span>
      <span className={`text-sm font-black tabular-nums ${emphasis ? "text-red-400" : "text-text-primary"}`}>{value}</span>
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

  const handleCharge = () => {
    onCharge();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="도딘이 부족합니다" className="overflow-hidden p-0">
      <div className="px-5 pb-5 pt-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <AlertTriangle size={28} strokeWidth={2.4} aria-hidden="true" />
        </div>

        <div className="mt-4 text-center">
          <h2 className="text-xl font-black tracking-tight text-text-primary">도딘이 부족합니다</h2>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <AmountRow label="필요한 도딘" value={formatKrw(requiredAmount)} />
          <AmountRow label="현재 사용가능" value={formatKrw(currentBalance)} />
          <AmountRow label="부족한 도딘" value={formatKrw(shortageAmount)} emphasis />
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <Button type="button" variant="primary-blue" size="lg" fullWidth onClick={handleCharge}>
            <Plus size={18} aria-hidden="true" />
            <span className="px-2">도딘 충전하기</span>
          </Button>
          <Button type="button" variant="outline" fullWidth onClick={onClose}>
            나중에
          </Button>
        </div>
      </div>
    </Modal>
  );
}
