"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, LayoutGrid, BarChart3, User, Menu, type LucideIcon } from "lucide-react";

interface NavItem {
    label: string;
    icon: LucideIcon;
    route: string | null;
}

const NAV_ITEMS: NavItem[] = [
    { label: "홈",      icon: Home,       route: "/crews" },
    { label: "피드",    icon: LayoutGrid, route: "/feed" },
    { label: "대시보드", icon: BarChart3,  route: "/dashboard" },
    { label: "프로필",  icon: User,       route: "/profile" },
    { label: "메뉴",    icon: Menu,       route: null },
];

export const BottomNav = () => {
    const pathname = usePathname();
    const router = useRouter();

    const handleNavClick = (item: NavItem) => {
        if (item.route === null) {
            alert("준비 중입니다");
            return;
        }
        router.push(item.route);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center bg-transparent pointer-events-none">
            <div className="w-full max-w-[430px] bg-card/90 backdrop-blur-md border-t border-text-secondary/10 px-6 pb-8 pt-3 flex justify-between items-center pointer-events-auto shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
                {NAV_ITEMS.map((item) => {
                    const isActive =
                        item.route !== null &&
                        (pathname === item.route || pathname.startsWith(item.route + "/"));

                    return (
                        <button
                            key={item.label}
                            type="button"
                            onClick={() => handleNavClick(item)}
                            aria-label={item.label}
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