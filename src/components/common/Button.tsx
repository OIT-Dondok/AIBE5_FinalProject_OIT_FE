import { ButtonHTMLAttributes, ReactNode } from "react";

// 1. 버튼에 주입할 수 있는 가변 속성(Props) 정의
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: "primary-blue" | "primary-green" | "outline";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    fullWidth?: boolean;
}

export const Button = ({
                           children,
                           variant = "primary-blue",
                           size = "md",
                           isLoading = false,
                           fullWidth = false,
                           className = "",
                           disabled,
                           ...props
                       }: ButtonProps) => {

    // 2. 테마 변수 기반 스타일 매핑 (globals.css 엔진 연동)
    const variantStyles = {
        "primary-blue": "bg-primary-blue text-white hover:opacity-90 active:scale-[0.99] shadow-md shadow-primary-blue/10",
        "primary-green": "bg-primary-green text-white hover:opacity-90 active:scale-[0.99] shadow-md shadow-primary-green/10",
        outline: "border border-text-secondary text-text-primary bg-transparent hover:bg-text-secondary/5 active:scale-[0.99]",
    };

    const sizeStyles = {
        sm: "py-1.5 px-3 text-xs font-medium rounded-button",
        md: "py-2.5 px-4 text-sm font-semibold rounded-button",
        lg: "py-4 px-6 text-base font-bold rounded-button", // 와이어프레임 최하단 CTA 규격
    };

    // 3. 조건별 클래스 조합
    const baseStyles = "inline-flex items-center justify-center transition-all duration-200 select-none focus:outline-none disabled:opacity-50 disabled:pointer-events-none disabled:scale-100";
    const widthStyle = fullWidth ? "w-full" : "";
    const combinedClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`;

    return (
        <button
            className={combinedClasses}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                // 로딩 중일 때 보여줄 미니멀 스피너 애니메이션
                <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>처리 중...</span>
                </div>
            ) : (
                children
            )}
        </button>
    );
};