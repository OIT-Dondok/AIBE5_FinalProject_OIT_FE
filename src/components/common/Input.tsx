"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    errorMessage?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, errorMessage, className = "", type, required, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPasswordType = type === "password";

        // 비밀번호 타입일 경우, showPassword 상태에 따라 text로 변환하여 보여줌
        const inputType = isPasswordType ? (showPassword ? "text" : "password") : type;

        return (
            <div className="flex flex-col gap-1.5 w-full text-left">
                {/* 1. 라벨 영역 */}
                {label && (
                    <label className="text-[12px] font-bold text-text-secondary">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                {/* 2. 인풋 필드 영역 */}
                <div className="relative flex items-center w-full">
                    <input
                        ref={ref}
                        type={inputType}
                        required={required}
                        className={`
                            w-full p-3.5 text-sm bg-background text-text-primary
                            border rounded-xl outline-none transition-colors
                            placeholder:text-text-secondary/50
                            ${errorMessage
                            ? "border-red-500 focus:border-red-600"
                            : "border-text-secondary/20 focus:border-primary-green"
                        }
                            ${isPasswordType ? "pr-10" : ""} // 눈 아이콘이 들어갈 우측 여백 확보
                            ${className}
                        `}
                        {...props}
                    />

                    {/* 3. 비밀번호 숨김/표시 토글 버튼 (type="password"일 때만 렌더링) */}
                    {isPasswordType && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 text-text-secondary/60 hover:text-text-primary transition-colors focus:outline-none"
                            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    )}
                </div>

                {/* 4. 에러 메시지 영역 */}
                {errorMessage && (
                    <span className="text-[11px] text-red-500 pl-1">
                        {errorMessage}
                    </span>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";