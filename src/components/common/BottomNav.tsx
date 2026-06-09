"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, LayoutGrid, BarChart3, User, Camera, ChevronRight, X, type LucideIcon } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { MOCK_CREWS } from "@/mocks/data/crews";
import type { MockCrew } from "@/mocks/data/crews";

const CATEGORY_LABEL: Record<string, string> = {
    MORNING: "🌅 아침",
    READING: "📚 독서",
    EXERCISE: "🏋️ 운동",
    STUDY: "✏️ 학습",
    DIET: "🥗 식단",
    ETC: "📌 기타",
};

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
    const [isCrewModalOpen, setIsCrewModalOpen] = useState(false);

    const activeCrews = MOCK_CREWS.filter((c: MockCrew) => c.status === "ACTIVE");

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

    return (
        <>
            <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center bg-transparent pointer-events-none">
                <div className="w-full max-w-[430px] bg-card/90 backdrop-blur-md border-t border-text-secondary/10 px-6 pb-8 pt-3 flex justify-between items-center pointer-events-auto shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
                    {LEFT_NAV.map(renderNavButton)}

                    {/* 인증 버튼 — 강조 스타일 */}
                    <button
                        type="button"
                        onClick={() => setIsCrewModalOpen(true)}
                        aria-label="인증하기"
                        className="flex flex-col items-center gap-1 -mt-6 group"
                    >
                        <span className="w-14 h-14 rounded-full bg-primary-green flex items-center justify-center shadow-lg shadow-primary-green/35 group-active:scale-95 transition-transform">
                            <Camera size={26} strokeWidth={2} className="text-white" />
                        </span>
                        <span className="text-[10px] font-bold text-primary-green">인증</span>
                    </button>

                    {RIGHT_NAV.map(renderNavButton)}
                </div>
            </nav>

            {/* 크루 선택 모달 */}
            <Modal
                isOpen={isCrewModalOpen}
                onClose={() => setIsCrewModalOpen(false)}
                ariaLabel="인증할 크루 선택"
            >
                <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-base font-bold text-text-primary">인증할 크루 선택</h2>
                            <p className="text-xs text-text-secondary mt-0.5">진행 중인 크루를 선택해 주세요</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsCrewModalOpen(false)}
                            className="p-1 -mr-1 hover:opacity-70 transition-opacity"
                            aria-label="닫기"
                        >
                            <X size={20} className="text-text-secondary" />
                        </button>
                    </div>

                    <ul className="flex flex-col gap-2">
                        {activeCrews.map((crew: MockCrew) => {
                            const categoryStr = CATEGORY_LABEL[crew.category] ?? "📌 기타";
                            const [emoji, ...labelParts] = categoryStr.split(" ");
                            const categoryName = labelParts.join(" ");

                            return (
                                <li key={crew.crew_id}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsCrewModalOpen(false);
                                            alert("인증 페이지 준비 중입니다");
                                            // TODO: 인증 페이지 구현 후 라우팅 연결
                                        }}
                                        className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl bg-background/60 border border-text-secondary/10 hover:bg-success-green/30 hover:border-primary-green/20 active:scale-[0.98] transition-all text-left"
                                    >
                                        <span className="text-xl leading-none">{emoji}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-text-primary truncate">{crew.title}</p>
                                            <p className="text-xs text-text-secondary mt-0.5">{categoryName}</p>
                                        </div>
                                        <ChevronRight size={16} className="text-text-secondary/50 shrink-0" />
                                    </button>
                                </li>
                            );
                        })}
                        {activeCrews.length === 0 && (
                            <li className="py-8 text-center text-sm text-text-secondary">
                                진행 중인 크루가 없습니다
                            </li>
                        )}
                    </ul>
                </div>
            </Modal>
        </>
    );
};
