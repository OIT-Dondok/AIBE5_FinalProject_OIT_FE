import { ReactNode } from "react";

interface BadgeProps {
    children: ReactNode;
    className?: string;
}

export const Badge = ({ children, className = "" }: BadgeProps) => {
    return (
        <span className={`
      inline-flex items-center justify-center 
      px-3 py-1 text-[11px] font-extrabold 
      rounded-full border-0
      /* 방장 전용 프리미엄 그라데이션: 그린에서 딥그린으로 */
      bg-gradient-to-tr from-[#5E9B73] to-[#4A7A5B] 
      /* 금빛 텍스트 효과로 고급스러움 추가 */
      text-[#F5F0E6] 
      /* 입체감을 위한 은은한 그림자 */
      shadow-[0_2px_4px_rgba(74,122,91,0.3)]
      tracking-tighter select-none
      ${className}
    `}>
      {children}
    </span>
    );
};