import { Crown } from "lucide-react";

import { Badge } from "@/components/common/Badge";

interface HostBadgeProps {
  count?: number;
  label?: string;
  compact?: boolean;
  className?: string;
}

export function HostBadge({ count, label, compact = false, className = "" }: HostBadgeProps) {
  const hasCount = typeof count === "number";
  const text = hasCount ? `방장 ${count}회` : label;
  const hasText = Boolean(text);
  const compactClassName = compact ? "relative !h-6 !w-[25px] !px-0" : "";
  const crownSize = compact ? 11 : 12;

  if (compact) {
    return (
      <Badge className={`${compactClassName} ${className}`}>
        <Crown
          size={crownSize}
          className="absolute left-1/2 top-1/2 block -translate-y-1/2 translate-x-[calc(-50%-0.5px)]"
          fill="currentColor"
        />
      </Badge>
    );
  }

  return (
    <Badge className={`${compactClassName} ${className}`}>
      <Crown size={crownSize} className={hasText ? "mr-1" : ""} fill="currentColor" />
      {text}
    </Badge>
  );
}
