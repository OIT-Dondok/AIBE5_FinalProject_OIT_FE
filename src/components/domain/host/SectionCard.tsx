import type { ReactNode } from "react";

export function SectionCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`bg-card rounded-card shadow-card border border-text-secondary/10 overflow-hidden ${className}`}>
      {children}
    </section>
  );
}

