"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Megaphone,
  MoreHorizontal,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/common/Button";
import { Chip } from "@/components/common/Chip";
import { EmptyState } from "@/components/common/EmptyState";
import { Header } from "@/components/common/Header";
import { Modal } from "@/components/common/Modal";
import {
  deleteHostNotice,
  getCrewApplications,
  getHostCertifications,
  getHostCrewDetail,
  getHostNotices,
  type HostApplicationMock,
  type HostCertificationMock,
  type HostReviewBucket,
} from "@/mocks/data/host";
import type { ParticipantStatus } from "@/types/domain";

export type HostTab = "verification" | "applications" | "notices";
type ApplicationFilter = ParticipantStatus | "ALL";

const HOST_TABS: Array<{ value: HostTab; label: string; icon: typeof ClipboardCheck }> = [
  { value: "verification", label: "인증 검증", icon: ClipboardCheck },
  { value: "applications", label: "가입 신청", icon: Users },
  { value: "notices", label: "공지 관리", icon: Megaphone },
];

const REVIEW_FILTERS: Array<{ value: HostReviewBucket; label: string }> = [
  { value: "urgent", label: "긴급 검토" },
  { value: "warning", label: "주의 검토" },
  { value: "normal", label: "일반 검토" },
];

const REVIEW_FILTER_STYLES: Record<HostReviewBucket, { active: string; inactive: string }> = {
  urgent: {
    active: "bg-red-50 text-red-500 shadow-sm shadow-red-100/70",
    inactive: "text-red-500 hover:bg-red-50",
  },
  warning: {
    active: "bg-amber-50 text-[#D89B4D] shadow-sm shadow-amber-100/70",
    inactive: "text-[#D89B4D] hover:bg-amber-50",
  },
  normal: {
    active: "bg-slate-100 text-text-secondary shadow-sm shadow-slate-200/70",
    inactive: "text-text-secondary hover:bg-slate-100",
  },
};

const APPLICATION_FILTERS: Array<{ value: ApplicationFilter; label: string }> = [
  { value: "ALL", label: "전체" },
  { value: "PENDING", label: "대기" },
  { value: "LOCKED", label: "승인" },
  { value: "REJECTED", label: "거절" },
];

const applicationStatusLabel: Record<ParticipantStatus, string> = {
  PENDING: "대기",
  LOCKED: "승인",
  REJECTED: "거절",
  CANCELLED: "취소",
  EXPIRED: "만료",
};

const applicationStatusStyles: Record<ParticipantStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200/70",
  LOCKED: "bg-success-green/50 text-primary-green border-primary-green/20",
  REJECTED: "bg-red-50 text-red-500 border-red-100",
  CANCELLED: "bg-slate-100 text-slate-500 border-slate-200",
  EXPIRED: "bg-text-secondary/10 text-text-secondary border-text-secondary/10",
};

const formatDateTime = (value: string) => {
  const matched = value.match(/^\d{4}-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);

  if (!matched) return value;

  const [, month, day, hourText, minute] = matched;
  const hour = Number(hourText);
  const period = hour < 12 ? "오전" : "오후";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${month}. ${day}. ${period} ${String(displayHour).padStart(2, "0")}:${minute}`;
};

const formatTime = (value: string) => {
  const matched = value.match(/^\d{4}-\d{2}-\d{2}T(\d{2}):(\d{2})/);

  if (!matched) return value;

  const [, hour, minute] = matched;
  return `${hour}:${minute}`;
};

const formatDate = (value: string) => {
  const matched = value.match(/^(\d{4})-(\d{2})-(\d{2})T/);

  if (!matched) return value;

  const [, year, month, day] = matched;
  return `${year}-${month}-${day}`;
};

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`bg-card rounded-card shadow-card border border-text-secondary/10 overflow-hidden ${className}`}>
      {children}
    </section>
  );
}

function VerificationCard({ item, isExpanded, onToggle }: { item: HostCertificationMock; isExpanded: boolean; onToggle: () => void }) {
  return (
    <article className="overflow-hidden rounded-card border border-text-secondary/10 bg-card shadow-sm">
      <button type="button" onClick={onToggle} className="w-full px-4 py-3.5 text-left">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-blue/10 text-sm font-extrabold text-primary-blue">
              {item.nickname.slice(0, 1)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-extrabold text-text-primary">{item.nickname}</p>
                {item.first_failed && (
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-500">
                    1차 실패
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs font-medium text-text-secondary">
                {formatTime(item.submitted_at)} · Exif {item.exif_valid ? "✓ 정상" : "⚠ 확인"}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full bg-primary-blue/10 px-2.5 py-1 text-[11px] font-extrabold text-primary-blue">
              {item.certification_status === "SUCCESS" ? "성공" : "검토중"}
            </span>
            <span className="flex h-6 w-5 items-center justify-center text-[#aeaaa1]">
              {isExpanded ? <ChevronDown size={21} strokeWidth={2.4} /> : <ChevronRight size={21} strokeWidth={2.4} />}
            </span>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-text-secondary/10 bg-background/55 px-4 pb-4 pt-3">
          <div className="flex items-center gap-3">
            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl bg-success-green/70">
              {item.image_url ? (
                <img src={item.image_url} alt={`${item.nickname} 인증 사진`} className="h-full w-full object-cover" />
              ) : null}
              <span className="absolute right-2 top-2 rounded-md bg-text-primary/65 px-2 py-1 text-[10px] font-extrabold text-white">
                확대
              </span>
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="grid grid-cols-[64px_1fr] items-center gap-2">
                <p className="text-xs font-extrabold text-text-secondary">촬영 일자</p>
                <p className="text-xs font-extrabold text-text-primary">{formatDate(item.captured_at)}</p>
              </div>
              <div className="grid grid-cols-[64px_1fr] items-center gap-2">
                <p className="text-xs font-extrabold text-text-secondary">Exif 검증</p>
                <p className={`text-xs font-extrabold ${item.exif_valid ? "text-primary-green" : "text-[#D89B4D]"}`}>
                  {item.exif_valid ? "✓ 성공" : "⚠ 메타데이터 없음"}
                </p>
              </div>
              <div className="grid grid-cols-[64px_1fr] items-center gap-2">
                <p className="text-xs font-extrabold text-text-secondary">중복</p>
                <p className={`text-xs font-extrabold ${item.is_duplicate ? "text-red-500" : "text-primary-green"}`}>
                  {item.is_duplicate ? "있음" : "없음"}
                </p>
              </div>
            </div>
          </div>

          <p className="mt-3 rounded-xl bg-card px-3 py-3 text-xs leading-relaxed text-text-primary border border-text-secondary/10">
            "{item.comment}"
          </p>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-red-50 text-sm font-extrabold text-red-500 transition-colors hover:bg-red-100"
            >
              <X size={16} strokeWidth={2.8} />
              거절
            </button>
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-primary-green text-sm font-extrabold text-white shadow-sm shadow-primary-green/20 transition-colors hover:opacity-90"
            >
              <Check size={16} strokeWidth={2.8} />
              승인
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function VerificationTab() {
  const params = useParams<{ crewId: string }>();
  const crewId = Number(params.crewId);
  const [reviewFilter, setReviewFilter] = useState<HostReviewBucket>("urgent");
  const [expandedMissionLogId, setExpandedMissionLogId] = useState<number | null>(901);
  const certifications = getHostCertifications(crewId);

  const filteredItems = certifications.filter((item) => item.review_bucket === reviewFilter);
  const normalExifCount = certifications.filter((item) => item.exif_valid && !item.is_duplicate).length;
  const reviewCounts = REVIEW_FILTERS.reduce(
    (acc, filter) => ({
      ...acc,
      [filter.value]: certifications.filter((item) => item.review_bucket === filter.value).length,
    }),
    {} as Record<HostReviewBucket, number>,
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          {REVIEW_FILTERS.map((filter) => {
            const isActive = reviewFilter === filter.value;
            const styles = REVIEW_FILTER_STYLES[filter.value];

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => {
                  setReviewFilter(filter.value);
                  setExpandedMissionLogId(null);
                }}
                className={`rounded-[10px] px-3 py-1.5 text-[11px] font-extrabold transition-colors ${
                  isActive ? styles.active : styles.inactive
                }`}
              >
                {filter.label} {reviewCounts[filter.value]}
              </button>
            );
          })}
        </div>
        <Button variant="primary-blue" size="sm" disabled={normalExifCount === 0} className="shrink-0">
          일괄 승인
        </Button>
      </div>

      {filteredItems.length === 0 ? (
        <SectionCard>
          <EmptyState icon={<ShieldCheck size={44} className="text-primary-green" />} title="검토할 인증이 없어요" />
        </SectionCard>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredItems.map((item) => (
            <VerificationCard
              key={item.mission_log_id}
              item={item}
              isExpanded={expandedMissionLogId === item.mission_log_id}
              onToggle={() =>
                setExpandedMissionLogId((current) =>
                  current === item.mission_log_id ? null : item.mission_log_id,
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationCard({ item }: { item: HostApplicationMock }) {
  const canDecide = item.status === "PENDING";

  return (
    <article className="rounded-2xl border border-text-secondary/10 bg-card px-4 py-3.5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-green/10 text-sm font-bold text-primary-green">
          {item.nickname.slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-bold text-text-primary">{item.nickname}</p>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${applicationStatusStyles[item.status]}`}>
              {applicationStatusLabel[item.status]}
            </span>
          </div>
          <p className="mt-1 text-xs text-text-secondary">신청 {formatDateTime(item.applied_at)}</p>
        </div>
      </div>

      {canDecide && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm">
            거절
          </Button>
          <Button variant="primary-green" size="sm">
            승인
          </Button>
        </div>
      )}
    </article>
  );
}

function ApplicationsTab() {
  const [applicationFilter, setApplicationFilter] = useState<ApplicationFilter>("PENDING");
  const params = useParams<{ crewId: string }>();
  const crewId = Number(params.crewId);
  const applications = getCrewApplications(crewId);

  const counts = useMemo(
    () =>
      applications.reduce(
        (acc, item) => {
          acc[item.status] += 1;
          return acc;
        },
        { PENDING: 0, LOCKED: 0, REJECTED: 0, CANCELLED: 0, EXPIRED: 0 } as Record<ParticipantStatus, number>,
      ),
    [applications],
  );

  const filteredItems = applications.filter((item) => {
    if (applicationFilter === "ALL") return true;
    return item.status === applicationFilter;
  });

  return (
    <div className="flex flex-col gap-3">
      <SectionCard className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-text-primary">가입 신청</h2>
            <p className="mt-1 text-xs text-text-secondary">LOCKED 상태는 화면에서 승인으로 표시합니다.</p>
          </div>
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-600">
            대기 {counts.PENDING}
          </span>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
          {APPLICATION_FILTERS.map((filter) => {
            const suffix = filter.value === "ALL" ? applications.length : counts[filter.value];
            return (
              <Chip
                key={filter.value}
                label={`${filter.label} ${filter.value === "ALL" ? applications.length : suffix}`}
                isActive={applicationFilter === filter.value}
                onClick={() => setApplicationFilter(filter.value)}
                className="whitespace-nowrap"
              />
            );
          })}
        </div>
      </SectionCard>

      {filteredItems.length === 0 ? (
        <SectionCard>
          <EmptyState icon={<UserCheck size={44} className="text-primary-green" />} title="신청 내역이 없어요" />
        </SectionCard>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredItems.map((item) => (
            <ApplicationCard key={item.crew_participant_id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function NoticesTab() {
  const params = useParams<{ crewId: string }>();
  const router = useRouter();
  const crewId = Number(params.crewId);
  const notices = getHostNotices(crewId);
  const [openMenuNoticeId, setOpenMenuNoticeId] = useState<number | null>(null);
  const [deleteTargetNoticeId, setDeleteTargetNoticeId] = useState<number | null>(null);

  const handleDeleteNotice = () => {
    if (deleteTargetNoticeId === null) return;
    deleteHostNotice(crewId, deleteTargetNoticeId);
    setDeleteTargetNoticeId(null);
    setOpenMenuNoticeId(null);
    router.push(`/crews/${crewId}/host-console`);
  };

  return (
    <div className="flex flex-col gap-3">
      <SectionCard className="px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-text-primary">공지 관리</h2>
            <p className="mt-1 text-xs text-text-secondary">공지 게시글과 댓글, 반응 현황을 관리합니다.</p>
          </div>
          <Button
            variant="primary-green"
            size="sm"
            onClick={() => router.push(`/crews/${crewId}/host-console/notices/new`)}
          >
            공지 작성
          </Button>
        </div>
      </SectionCard>

      {notices.length === 0 ? (
        <SectionCard>
          <EmptyState icon={<FileText size={44} className="text-primary-green" />} title="등록된 공지가 없어요" />
        </SectionCard>
      ) : (
        <div className="flex flex-col gap-3">
          {notices.map((notice) => (
            <article
              key={notice.notice_id}
              className="relative rounded-2xl border border-text-secondary/10 bg-card px-4 py-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => router.push(`/crews/${crewId}/host-console/notices/${notice.notice_id}`)}
                  className="min-w-0 flex-1 text-left"
                >
                  <h3 className="truncate text-sm font-bold text-text-primary">{notice.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-text-secondary">{notice.content}</p>
                </button>
                <button
                  type="button"
                  aria-label="공지 메뉴 열기"
                  onClick={() =>
                    setOpenMenuNoticeId((current) => (current === notice.notice_id ? null : notice.notice_id))
                  }
                  className="shrink-0 rounded-full p-1 text-text-secondary hover:bg-text-secondary/10"
                >
                  <MoreHorizontal size={18} />
                </button>
                {openMenuNoticeId === notice.notice_id && (
                  <div className="absolute right-4 top-12 z-20 w-28 overflow-hidden rounded-xl border border-text-secondary/10 bg-card shadow-card">
                    <button
                      type="button"
                      onClick={() => router.push(`/crews/${crewId}/host-console/notices/${notice.notice_id}/edit`)}
                      className="block w-full px-3 py-2.5 text-left text-xs font-bold text-text-primary hover:bg-text-secondary/5"
                    >
                      수정하기
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTargetNoticeId(notice.notice_id);
                        setOpenMenuNoticeId(null);
                      }}
                      className="block w-full px-3 py-2.5 text-left text-xs font-bold text-red-500 hover:bg-red-50"
                    >
                      삭제하기
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-text-secondary">
                <span>작성 {formatDateTime(notice.created_at)}</span>
                <span>댓글 {notice.comment_count} · 반응 {notice.reaction_count}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        isOpen={deleteTargetNoticeId !== null}
        onClose={() => setDeleteTargetNoticeId(null)}
        ariaLabel="공지 삭제 확인"
      >
        <div className="px-5 py-5">
          <h2 className="text-base font-extrabold text-text-primary">공지를 삭제할까요?</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            삭제한 공지는 목록에서 더 이상 사용할 수 없습니다. 실제 API 연결 전까지는 mock 처리됩니다.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" onClick={() => setDeleteTargetNoticeId(null)}>
              취소
            </Button>
            <Button type="button" variant="primary-green" onClick={handleDeleteNotice}>
              삭제하기
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function HostConsoleClient() {
  const params = useParams<{ crewId: string }>();
  const crewId = Number(params.crewId);
  const [activeTab, setActiveTab] = useState<HostTab>("verification");
  const crewDetail = getHostCrewDetail(crewId);
  const certifications = getHostCertifications(crewId);
  const applications = getCrewApplications(crewId);
  const notices = getHostNotices(crewId);

  const pendingReviewCount = certifications.filter(
    (item) => item.certification_status === "PENDING_REVIEW",
  ).length;
  const pendingApplicationCount = applications.filter((item) => item.status === "PENDING").length;

  if (!crewDetail.isHost) {
    return (
      <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
        <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-28">
          <Header showBackButton title="운영 콘솔" />
          <div className="px-5 pt-5">
            <SectionCard>
              <EmptyState
                icon={<ShieldCheck size={44} className="text-text-secondary" />}
                title="방장만 접근할 수 있어요"
                description="운영 콘솔은 크루 방장에게만 제공됩니다."
              />
            </SectionCard>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-28">
        <Header showBackButton title="운영 콘솔" rightElement={<Bell size={22} className="text-text-primary" />} />

        <div className="px-5 pt-5 flex flex-col gap-4">
          <section className="rounded-[20px] bg-[linear-gradient(135deg,#5d7fe3_0%,#6486ea_45%,#5f81e6_100%)] px-4 py-3.5 text-white shadow-card">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-6 shrink-0 items-center justify-center text-white">
                <ShieldCheck size={20} strokeWidth={2.4} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-extrabold leading-tight text-white">
                  방장 · {crewDetail.title}
                </p>
                <p className="mt-1 text-xs font-semibold leading-tight text-white/90">
                  다음 정산까지 <span className="font-extrabold text-white">3시간 14분</span>
                </p>
              </div>
            </div>
          </section>

          <SectionCard className="p-1.5">
            <div className="grid grid-cols-3 gap-2">
              {HOST_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setActiveTab(tab.value)}
                    className={`flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl px-2 py-3.5 text-xs font-bold transition-colors ${
                      isActive ? "bg-success-green/55 text-primary-green" : "text-text-secondary hover:bg-text-secondary/5"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <Icon size={15} />
                      <span className="truncate">{tab.label}</span>
                    </span>
                    <span className="text-sm font-extrabold leading-none">
                      {tab.value === "verification"
                        ? pendingReviewCount
                        : tab.value === "applications"
                          ? pendingApplicationCount
                          : notices.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          {activeTab === "verification" && <VerificationTab />}
          {activeTab === "applications" && <ApplicationsTab />}
          {activeTab === "notices" && <NoticesTab />}
        </div>
      </div>
    </main>
  );
}
