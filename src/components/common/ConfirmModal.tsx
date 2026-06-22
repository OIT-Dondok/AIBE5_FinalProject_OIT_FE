"use client";

import type { ReactNode } from "react";
import { Check, X, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: ReactNode;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  confirmVariant?: "primary-green" | "primary-blue" | "danger" | "outline";
  iconType?: "success" | "error" | "warning" | "none";
  customIcon?: ReactNode;
  showCancel?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
  isLoading = false,
  confirmVariant = "primary-green",
  iconType = "none",
  customIcon,
  showCancel = true,
}: ConfirmModalProps) {

  const getIcon = () => {
    switch (iconType) {
      case "success":
        return (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F2EB] text-primary-green">
            <Check size={24} strokeWidth={2.8} />
          </div>
        );
      case "error":
        return (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FCEDEC] text-[#DB5C55]">
            <X size={24} strokeWidth={2.8} />
          </div>
        );
      case "warning":
        return (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <AlertTriangle size={24} strokeWidth={2.4} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel={title}>
      <div className="flex flex-col gap-4 p-6">
        {customIcon ? (
          <div className="mb-1 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#ECECF1] text-text-primary">
            {customIcon}
          </div>
        ) : (
          iconType !== "none" && <div className="mb-1">{getIcon()}</div>
        )}
        <div className="flex flex-col gap-2 text-center">
          <h3 className="text-base font-bold text-text-primary">{title}</h3>
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
            {description}
          </p>
        </div>
        <div className="flex gap-2">
          {showCancel && (
            <Button
              type="button"
              variant="outline"
              size="md"
              fullWidth
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
          )}
          <Button
            type="button"
            variant={confirmVariant}
            size="md"
            fullWidth
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
