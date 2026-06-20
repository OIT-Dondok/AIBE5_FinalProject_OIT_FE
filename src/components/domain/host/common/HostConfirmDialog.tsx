"use client";

import type { ReactNode } from "react";
import { ConfirmModal } from "@/components/common/ConfirmModal";

type HostConfirmTone = "approve" | "danger" | "neutral";

interface HostConfirmDialogProps {
  title: string;
  description: ReactNode;
  tone: HostConfirmTone;
  confirmLabel: string;
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
  icon?: ReactNode;
  labelledById?: string;
}

export function HostConfirmDialog({
  title,
  description,
  tone,
  confirmLabel,
  cancelLabel = "취소",
  onCancel,
  onConfirm,
  isSubmitting = false,
  icon,
}: HostConfirmDialogProps) {

  const getIconType = (): "success" | "error" | "warning" | "none" => {
    switch (tone) {
      case "approve":
        return "success";
      case "danger":
        return "error";
      case "neutral":
      default:
        return "warning";
    }
  };

  const getConfirmVariant = (): "primary-green" | "primary-blue" | "danger" | "outline" => {
    switch (tone) {
      case "approve":
        return "primary-green";
      case "danger":
        return "danger";
      case "neutral":
      default:
        return "outline";
    }
  };

  return (
    <ConfirmModal
      isOpen={true}
      onClose={onCancel}
      onConfirm={onConfirm}
      title={title}
      description={description}
      confirmText={confirmLabel}
      cancelText={cancelLabel}
      isLoading={isSubmitting}
      confirmVariant={getConfirmVariant()}
      iconType={getIconType()}
      customIcon={icon}
    />
  );
}
