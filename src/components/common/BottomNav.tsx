"use client"; // 상태 감지를 위해 클라이언트 컴포넌트로 선언

import { Home, LayoutGrid, BarChart3, User, Menu } from "lucide-react";

export const BottomNav = () => {
    // 현재는 기능 구현 전이므로 '홈'이 선택된 상태로 가정한 예시
    const activeMenu = "홈";

    const navItems = [
        { label: "홈", icon: Home },
        { label: "피드", icon: LayoutGrid },
        { label: "대시보드", icon: BarChart3 },
        { label: "프로필", icon: User },
        { label: "메뉴", icon: Menu },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center bg-transparent pointer-events-none">
            <div className="w-full max-w-[430px] bg-card/90 backdrop-blur-md border-t border-text-secondary/10 px-6 pb-8 pt-3 flex justify-between items-center pointer-events-auto shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
                {navItems.map((item) => {
                    const isActive = activeMenu === item.label;
                    return (
                        <button
                            key={item.label}
                            className="flex flex-col items-center gap-1 group transition-all"
                        >
                            <item.icon
                                size={22}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={isActive ? "text-primary-blue" : "text-text-secondary group-hover:text-text-primary"}
                            />
                            <span className={`text-[10px] font-bold ${isActive ? "text-primary-blue" : "text-text-secondary"}`}>
                {item.label}
              </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};