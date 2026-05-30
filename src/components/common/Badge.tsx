import { ReactNode } from "react";

interface BadgeProps {
    children: ReactNode;
    className?: string;
}

export const Badge = ({ children, className = "" }: BadgeProps) => {
    return (
        <span className={`inline-flex items-center justify-center px-3 py-1 text-[11px] font-extrabold rounded-full bg-gradient-to-tr from-primary-green to-[#4A7A5B] text-background shadow-sm shadow-primary-green/30 tracking-tighter select-none ${className}`}>
            {children}
        </span>
    );
};