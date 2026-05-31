"use client";

import { useRouter } from "next/navigation";
import {
    ChevronRight,
    Users,
    BarChart3,
    ClipboardCheck,
    Wallet,
    Settings,
    Bell,
    BookOpen,
    type LucideIcon,
} from "lucide-react";

const MOCK_UNREAD_NOTIFICATIONS = 2;
const MOCK_PENDING_OPERATOR = 6;

interface MenuItemData {
    icon: LucideIcon;
    iconBg: string;
    iconColor: string;
    title: string;
    subtitle: string;
    badge?: number;
    onClick: () => void;
}

interface MenuSectionData {
    sectionTitle: string;
    items: MenuItemData[];
}

function NumberBadge({ count }: { count: number }) {
    return (
        <span className="min-w-[20px] h-5 px-1.5 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
            {count}
        </span>
    );
}

function MenuItem({ item }: { item: MenuItemData }) {
    const Icon = item.icon;
    return (
        <button
            type="button"
            onClick={item.onClick}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-text-secondary/5 active:bg-text-secondary/10 transition-colors"
        >
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
                <Icon size={20} className={item.iconColor} strokeWidth={2} />
            </span>
            <span className="flex-1 text-left">
                <span className="block text-sm font-semibold text-text-primary">{item.title}</span>
                <span className="block text-xs text-text-secondary mt-0.5">{item.subtitle}</span>
            </span>
            <span className="flex items-center gap-2 shrink-0">
                {item.badge !== undefined && <NumberBadge count={item.badge} />}
                <ChevronRight size={16} className="text-text-secondary/50" strokeWidth={2} />
            </span>
        </button>
    );
}

function MenuSection({ section }: { section: MenuSectionData }) {
    return (
        <div className="bg-card rounded-card shadow-card border border-text-secondary/10 overflow-hidden">
            <p className="px-4 pt-4 pb-2 text-xs font-bold text-text-secondary tracking-wide">
                {section.sectionTitle}
            </p>
            <div className="divide-y divide-text-secondary/[0.08]">
                {section.items.map((item) => (
                    <MenuItem key={item.title} item={item} />
                ))}
            </div>
        </div>
    );
}

export function ProfileMenuSections() {
    const router = useRouter();

    const sections: MenuSectionData[] = [
        {
            sectionTitle: "내 활동",
            items: [
                {
                    icon: Users,
                    iconBg: "bg-emerald-50",
                    iconColor: "text-primary-green",
                    title: "내 크루",
                    subtitle: "진행중 3 · 종료 12",
                    onClick: () => alert("준비 중"),
                },
                {
                    icon: BarChart3,
                    iconBg: "bg-blue-50",
                    iconColor: "text-primary-blue",
                    title: "대시보드",
                    subtitle: "순위 · 환급금",
                    onClick: () => router.push("/dashboard"),
                },
                {
                    icon: ClipboardCheck,
                    iconBg: "bg-violet-50",
                    iconColor: "text-violet-500",
                    title: "검증 내역",
                    subtitle: "전역 통합 조회 24건",
                    onClick: () => alert("준비 중"),
                },
                {
                    icon: Wallet,
                    iconBg: "bg-amber-50",
                    iconColor: "text-amber-500",
                    title: "도딘 지갑",
                    subtitle: "충전 · 출금 · 정산 내역",
                    onClick: () => router.push("/my/dodin"),
                },
                {
                    icon: Bell,
                    iconBg: "bg-rose-50",
                    iconColor: "text-rose-400",
                    title: "알림 내역",
                    subtitle: `미확인 ${MOCK_UNREAD_NOTIFICATIONS}건`,
                    badge: MOCK_UNREAD_NOTIFICATIONS,
                    onClick: () => router.push("/notifications"),
                },
                {
                    icon: BookOpen,
                    iconBg: "bg-sky-50",
                    iconColor: "text-sky-500",
                    title: "서비스 가이드",
                    subtitle: "돈독 사용법 한눈에 보기",
                    onClick: () => router.push("/guide"),
                },
            ],
        },
        {
            sectionTitle: "방장 영역",
            items: [
                {
                    icon: Settings,
                    iconBg: "bg-slate-100",
                    iconColor: "text-slate-500",
                    title: "운영 콘솔",
                    subtitle: "검증 · 공지 · 가입 관리",
                    badge: MOCK_PENDING_OPERATOR,
                    onClick: () => alert("준비 중"),
                },
            ],
        },
    ];

    return (
        <>
            {sections.map((section) => (
                <MenuSection key={section.sectionTitle} section={section} />
            ))}
        </>
    );
}
