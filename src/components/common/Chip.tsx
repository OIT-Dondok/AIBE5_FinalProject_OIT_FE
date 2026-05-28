import { ButtonHTMLAttributes } from "react";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  isActive?: boolean;
  chipType?: "status" | "category";
}

const statusStyles = {
  active: "bg-white text-text-primary shadow-sm",
  inactive: "bg-transparent text-text-secondary",
  base: "py-3 px-4 text-sm font-medium rounded-xl",
};

const categoryStyles = {
  active: "bg-primary-green text-white",
  inactive: "bg-transparent text-text-secondary",
  base: "py-1.5 px-3 text-xs font-medium rounded-full",
};

export const Chip = ({
  label,
  isActive = false,
  chipType = "category",
  className = "",
  ...props
}: ChipProps) => {
  const styles = chipType === "status" ? statusStyles : categoryStyles;

  return (
    <button
      className={`inline-flex items-center transition-colors ${styles.base} ${
        isActive ? styles.active : styles.inactive
      } ${className}`}
      {...props}
    >
      {label}
    </button>
  );
};
