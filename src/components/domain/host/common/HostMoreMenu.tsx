"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";

type HostMoreMenuItemTone = "default" | "danger";

interface HostMoreMenuItem {
  label: string;
  icon: ReactNode;
  tone?: HostMoreMenuItemTone;
  onClick: () => void;
  disabled?: boolean;
}

interface HostMoreMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  items: HostMoreMenuItem[];
  alignClassName?: string;
}

const itemClassNames: Record<HostMoreMenuItemTone, string> = {
  default: "text-text-primary hover:bg-[#FAF7EE]",
  danger: "text-[#DB5C55] hover:bg-[#FCEDEC]",
};

export function HostMoreMenu({ isOpen, onToggle, items, alignClassName = "right-0 top-10" }: HostMoreMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const onToggleRef = useRef(onToggle);
  onToggleRef.current = onToggle;

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        onToggleRef.current();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-label="메뉴 열기"
        aria-expanded={isOpen}
        onClick={onToggle}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition hover:bg-[#EBE7DD]/70 active:scale-95"
      >
        <MoreHorizontal size={20} strokeWidth={2.4} />
      </button>

      {isOpen && (
        <div
          className={`absolute z-20 w-36 overflow-hidden rounded-xl border border-text-secondary/10 bg-white shadow-[0_8px_20px_rgba(40,37,31,0.12)] ${alignClassName}`}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              disabled={item.disabled}
              onClick={item.onClick}
              className={`flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-medium transition ${
                item.disabled
                  ? "text-text-secondary/40 cursor-not-allowed bg-transparent"
                  : itemClassNames[item.tone ?? "default"]
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
