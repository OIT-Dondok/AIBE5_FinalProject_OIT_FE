import { ButtonHTMLAttributes } from "react";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  isActive?: boolean;
  chipType?: "status" | "category";
}

const statusStyles = {
  active: "bg-card text-text-primary font-semibold shadow-sm",
  inactive: "bg-transparent text-text-secondary font-medium hover:text-text-primary",
  base: "py-2.5 px-4 text-sm rounded-xl transition-colors duration-150",
};

const categoryStyles = {
  active: "bg-primary-green text-white font-semibold shadow-sm shadow-primary-green/25",
  inactive: "bg-transparent text-text-secondary font-medium hover:text-text-primary",
  base: "py-1.5 px-3 text-xs rounded-full transition-colors duration-150",
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
