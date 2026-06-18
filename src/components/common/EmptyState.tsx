import { ReactNode } from "react";
import { Button } from "@/components/common/Button";

interface EmptyStateProps {
  icon: string | ReactNode;
  title: string;
  description?: string;
  actionButtonText?: string;
  onActionClick?: () => void;
  className?: string;
}

export const EmptyState = ({
  icon,
  title,
  description,
  actionButtonText,
  onActionClick,
  className = "py-12 px-6",
}: EmptyStateProps) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 text-center ${className}`}>
      <div className="text-5xl leading-none">{icon}</div>
      <div className="flex flex-col gap-1.5">
        <p className="text-base font-semibold text-text-primary">{title}</p>
        {description && (
          <p className="text-sm text-text-secondary leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actionButtonText && (
        <Button variant="primary-blue" size="md" onClick={onActionClick}>
          {actionButtonText}
        </Button>
      )}
    </div>
  );
};
