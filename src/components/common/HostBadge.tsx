import { Crown } from "lucide-react";

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
  const crownSize = compact ? 11 : 12;

  if (compact) {
    return (
      <span
        className={`relative inline-flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-md shadow-amber-300/20 select-none ${className}`}
      >
        <Crown
          size={crownSize}
          className="absolute left-1/2 top-1/2 block -translate-y-1/2 -translate-x-1/2"
          fill="white"
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-0.5 text-[10px] font-black rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-md shadow-amber-300/30 tracking-wide select-none ${className}`}
    >
      <Crown size={crownSize} className={hasText ? "mr-1" : ""} fill="white" />
      {text}
    </span>
  );
}
