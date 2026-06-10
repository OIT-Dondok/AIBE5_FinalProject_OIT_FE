import type { ReactNode } from "react";

import { HostActionButton } from "@/components/domain/host/common/HostActionButton";

type HostConfirmTone = "approve" | "danger" | "neutral";

interface HostConfirmDialogProps {
  title: string;
  description: ReactNode;
  icon: ReactNode;
  tone: HostConfirmTone;
  confirmLabel: string;
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
  labelledById?: string;
  isSubmitting?: boolean;
}

const iconToneClassNames: Record<HostConfirmTone, string> = {
  approve: "bg-[#E8F2EB] text-primary-green",
  danger: "bg-[#FCEDEC] text-[#DB5C55]",
  neutral: "bg-[#EFEDE8] text-text-secondary",
};

const confirmVariantByTone: Record<HostConfirmTone, "approve" | "danger" | "neutral"> = {
  approve: "approve",
  danger: "danger",
  neutral: "neutral",
};

export function HostConfirmDialog({
  title,
  description,
  icon,
  tone,
  confirmLabel,
  cancelLabel = "취소",
  onCancel,
  onConfirm,
  labelledById,
  isSubmitting = false,
}: HostConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center bg-black/40 px-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledById}
      aria-label={!labelledById ? title : undefined}
      onClick={() => {
        if (!isSubmitting) onCancel();
      }}
    >
      <div className="w-full max-w-[340px] rounded-2xl bg-card px-5 py-5 shadow-lg" onClick={(event) => event.stopPropagation()}>
        <div className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full ${iconToneClassNames[tone]}`}>
          {icon}
        </div>
        <h2 id={labelledById} className="mt-3 text-center text-base font-extrabold text-text-primary">
          {title}
        </h2>
        <p className="mt-2 text-center text-sm font-medium leading-relaxed text-text-secondary">{description}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <HostActionButton variant="cancel" onClick={onCancel} disabled={isSubmitting}>
            {cancelLabel}
          </HostActionButton>
          <HostActionButton
            variant={confirmVariantByTone[tone]}
            onClick={onConfirm}
            disabled={isSubmitting}
            className="disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "처리 중..." : confirmLabel}
          </HostActionButton>
        </div>
      </div>
    </div>
  );
}
