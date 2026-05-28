interface SkeletonProps {
  variant?: "text" | "circle" | "rect";
  width?: string | number;
  height?: string | number;
  className?: string;
}

const variantStyles: Record<NonNullable<SkeletonProps["variant"]>, string> = {
  text: "rounded",
  circle: "rounded-full",
  rect: "rounded-md",
};

export const Skeleton = ({
  variant = "rect",
  width,
  height,
  className = "",
}: SkeletonProps) => {
  return (
    <div
      className={`bg-gray-200 animate-pulse ${variantStyles[variant]} ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    />
  );
};
