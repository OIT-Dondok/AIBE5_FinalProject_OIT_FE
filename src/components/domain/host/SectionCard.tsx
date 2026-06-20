import type { ReactNode } from "react";

type SectionCardProps = {
  children: ReactNode;
  className?: string;
  isTabContent?: boolean;
};

export function SectionCard({ children, className = "", isTabContent = true }: SectionCardProps) {
  const cardStyles = isTabContent
    ? "rounded-b-[24px] rounded-t-none border-t-0"
    : "rounded-[24px]";

  return (
    <section
      className={`bg-white ${cardStyles} shadow-sm border border-[#E5DEC9] overflow-hidden ${className}`}
    >
      {children}
    </section>
  );
}

