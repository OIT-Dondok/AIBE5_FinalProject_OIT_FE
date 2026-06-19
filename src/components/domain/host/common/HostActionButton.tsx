import type { ButtonHTMLAttributes, ReactNode } from "react";

type HostActionButtonVariant =
  | "approve"
  | "approveDisabled"
  | "reject"
  | "danger"
  | "cancel"
  | "primary"
  | "primaryDisabled"
  | "neutral";

interface HostActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant: HostActionButtonVariant;
  icon?: ReactNode;
}

const variantClassNames: Record<HostActionButtonVariant, string> = {
  approve: "bg-primary-green text-white shadow-sm shadow-primary-green/20 hover:bg-[#3F7A55]",
  approveDisabled: "bg-primary-green/45 text-white/80 cursor-not-allowed shadow-none",
  reject: "bg-[#FCEDEC] text-[#DB5C55] hover:bg-[#F8DEDC]",
  danger: "bg-[#DB5C55] text-white hover:bg-[#C84D46]",
  cancel: "border-2 border-[#EDE8DF] bg-card text-text-primary hover:bg-[#EDE8DF]",
  primary: "bg-[#4C73D9] text-white shadow-sm hover:bg-[#3358BD]",
  primaryDisabled: "bg-[#A0B1DF] text-white shadow-sm",
  neutral: "bg-text-primary text-white hover:bg-[#3A362E]",
};

export function HostActionButton({
  children,
  variant,
  icon,
  className = "",
  ...props
}: HostActionButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex h-[52px] min-h-[52px] items-center justify-center gap-1.5 rounded-xl text-base font-extrabold leading-none transition-colors active:scale-[0.98] ${variantClassNames[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
