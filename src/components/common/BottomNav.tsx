"use client";

import { useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, LayoutGrid, BarChart3, User, Camera, type LucideIcon } from "lucide-react";
import { CertifyCrewSelectModal } from "@/components/domain/crew/CertifyCrewSelectModal";
import { Toast } from "@/components/common/Toast";
import { getMyLockedCrews } from "@/services/crew";

interface NavItem {
    label: string;
    icon: LucideIcon;
    route: string;
}

const LEFT_NAV: NavItem[] = [
    { label: "홈",  icon: Home,       route: "/crews" },
    { label: "피드", icon: LayoutGrid, route: "/feed" },
];

const RIGHT_NAV: NavItem[] = [
    { label: "대시보드", icon: BarChart3, route: "/dashboard" },
    { label: "프로필",  icon: User,      route: "/profile" },
];

export const BottomNav = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState('');
    const [isToastOpen, setIsToastOpen] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    const isActive = (route: string) =>
        pathname === route || pathname.startsWith(route + "/");

    const renderNavButton = (item: NavItem) => {
        const active = isActive(item.route);
        return (
            <button
                key={item.label}
                type="button"
                onClick={() => router.push(item.route)}
                aria-label={item.label}
                className="flex flex-col items-center gap-1 group transition-all"
            >
                <item.icon
                    size={22}
                    strokeWidth={active ? 2.5 : 2}
                    className={active ? "text-primary-blue" : "text-text-secondary group-hover:text-text-primary"}
                />
                <span className={`text-[10px] font-bold ${active ? "text-primary-blue" : "text-text-secondary"}`}>
                    {item.label}
                </span>
            </button>
        );
    };

    const handleCameraClick = useCallback(async () => {
        if (isFetching) return;
        setIsFetching(true);
        try {
            const { data } = await getMyLockedCrews();
            const active = data.items.filter((c) => c.status === 'ACTIVE');
            if (active.length === 0) {
                setToast('진행 중인 크루가 없어요');
                setIsToastOpen(true);
            } else if (active.length === 1) {
                router.push(`/crews/${active[0].crew_id}/certify`);
            } else {
                setIsModalOpen(true);
            }
        } catch {
            setToast('크루 정보를 불러오지 못했어요');
            setIsToastOpen(true);
        } finally {
            setIsFetching(false);
        }
    }, [isFetching, router]);

    return (
        <>
            <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center bg-transparent pointer-events-none">
                <div className="w-full max-w-[430px] bg-card/90 backdrop-blur-md border-t border-text-secondary/10 px-6 pb-8 pt-3 flex justify-between items-center pointer-events-auto shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
                    {LEFT_NAV.map(renderNavButton)}

                    {/* 인증 버튼 — 강조 스타일 */}
                    <button
                        type="button"
                        onClick={handleCameraClick}
                        disabled={isFetching}
                        aria-label="인증하기"
                        className="flex flex-col items-center gap-1 -mt-6 group"
                    >
                        <span className="w-14 h-14 rounded-full bg-primary-green flex items-center justify-center shadow-lg shadow-primary-green/35 group-active:scale-95 transition-transform disabled:opacity-70">
                            <Camera size={26} strokeWidth={2} className="text-white" />
                        </span>
                        <span className="text-[10px] font-bold text-primary-green">인증</span>
                    </button>

                    {RIGHT_NAV.map(renderNavButton)}
                </div>
            </nav>

            <CertifyCrewSelectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <Toast
                message={toast}
                isOpen={isToastOpen}
                onClose={() => setIsToastOpen(false)}
            />
        </>
    );
};
