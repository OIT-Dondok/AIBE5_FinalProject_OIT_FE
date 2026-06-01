"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Bell,
  Check,
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
import {
  getCrewApplications,
  getHostCertifications,
  getHostCrewDetail,
  getHostNotices,
  type HostApplicationMock,
  type HostCertificationMock,
  type HostReviewBucket,
} from "@/mocks/data/host";
import type { CertificationStatus, ParticipantStatus } from "@/types/domain";

type HostTab = "verification" | "applications" | "notices";
type ApplicationFilter = ParticipantStatus | "ALL";

const HOST_TABS: Array<{ value: HostTab; label: string; icon: typeof ClipboardCheck }> = [
  { value: "verification", label: "인증검증", icon: ClipboardCheck },
  { value: "applications", label: "가입신청", icon: Users },
  { value: "notices", label: "공지관리", icon: Megaphone },
];

const REVIEW_FILTERS: Array<{ value: HostReviewBucket; label: string }> = [
  { value: "urgent", label: "긴급 검토" },
  { value: "warning", label: "주의 검토" },
  { value: "normal", label: "일반 검토" },
];

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

const certificationStatusLabel: Record<CertificationStatus, string> = {
  PENDING_REVIEW: "검토 대기",
  SUCCESS: "승인 완료",
  FAILED: "거절 완료",
};

const applicationStatusStyles: Record<ParticipantStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200/70",
  LOCKED: "bg-success-green/50 text-primary-green border-primary-green/20",
  REJECTED: "bg-red-50 text-red-500 border-red-100",
  CANCELLED: "bg-slate-100 text-slate-500 border-slate-200",
  EXPIRED: "bg-text-secondary/10 text-text-secondary border-text-secondary/10",
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`bg-card rounded-card shadow-card border border-text-secondary/10 overflow-hidden ${className}`}>
      {children}
    </section>
  );
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "green" | "blue" | "amber";
}) {
  const toneStyles = {
    green: "bg-success-green/45 text-primary-green",
    blue: "bg-primary-blue/10 text-primary-blue",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="flex-1 min-w-0 rounded-2xl bg-card border border-text-secondary/10 px-3 py-3 shadow-sm">
      <p className="text-[11px] font-semibold text-text-secondary truncate">{label}</p>
      <p className={`mt-2 w-fit min-w-8 rounded-full px-2 py-0.5 text-sm font-bold ${toneStyles[tone]}`}>
        {value}
      </p>
    </div>
  );
}

function VerificationCard({ item }: { item: HostCertificationMock }) {
  return (
    <article className="rounded-2xl border border-text-secondary/10 bg-background/45 px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-text-primary truncate">{item.nickname}</p>
            {item.first_failed && (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-500">
                1차 실패
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-text-secondary">제출 {formatDateTime(item.submitted_at)}</p>
        </div>
        <span className="shrink-0 rounded-full border border-primary-blue/15 bg-primary-blue/5 px-2.5 py-1 text-[11px] font-bold text-primary-blue">
          {certificationStatusLabel[item.certification_status]}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-card px-3 py-2 border border-text-secondary/10">
          <p className="text-[10px] font-semibold text-text-secondary">Exif</p>
          <p className={`mt-0.5 text-xs font-bold ${item.exif_valid ? "text-primary-green" : "text-red-500"}`}>
            {item.exif_valid ? "정상" : "확인 필요"}
          </p>
        </div>
        <div className="rounded-xl bg-card px-3 py-2 border border-text-secondary/10">
          <p className="text-[10px] font-semibold text-text-secondary">중복 여부</p>
          <p className={`mt-0.5 text-xs font-bold ${item.is_duplicate ? "text-amber-600" : "text-primary-green"}`}>
            {item.is_duplicate ? "의심" : "없음"}
          </p>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-text-secondary">{item.comment}</p>
      <div className="mt-3 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          <X size={14} />
          거절
        </Button>
        <Button variant="primary-green" size="sm" className="flex-1">
          <Check size={14} />
          승인
        </Button>
      </div>
    </article>
  );
}

function VerificationTab() {
  const params = useParams<{ crewId: string }>();
  const crewId = Number(params.crewId);
  const [reviewFilter, setReviewFilter] = useState<HostReviewBucket>("urgent");
  const certifications = getHostCertifications(crewId);

  const filteredItems = certifications.filter((item) => item.review_bucket === reviewFilter);
  const normalExifCount = certifications.filter((item) => item.exif_valid && !item.is_duplicate).length;

  return (
    <div className="flex flex-col gap-3">
      <SectionCard className="px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-text-primary">인증 검증</h2>
            <p className="mt-1 text-xs text-text-secondary">카드를 눌러 상세 검토로 확장할 영역입니다.</p>
          </div>
          <Button variant="primary-blue" size="sm" disabled={normalExifCount === 0}>
            일괄승인 {normalExifCount}
          </Button>
        </div>
        <div className="mt-4 flex rounded-2xl bg-text-secondary/8 p-1 gap-1">
          {REVIEW_FILTERS.map((filter) => (
            <Chip
              key={filter.value}
              label={filter.label}
              chipType="status"
              isActive={reviewFilter === filter.value}
              onClick={() => setReviewFilter(filter.value)}
              className="flex-1 justify-center text-[12px]"
            />
          ))}
        </div>
      </SectionCard>

      {filteredItems.length === 0 ? (
        <SectionCard>
          <EmptyState icon={<ShieldCheck size={44} className="text-primary-green" />} title="검토할 인증이 없어요" />
        </SectionCard>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredItems.map((item) => (
            <VerificationCard key={item.mission_log_id} item={item} />
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
              className="rounded-2xl border border-text-secondary/10 bg-card px-4 py-4 shadow-sm"
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
                  aria-label="공지 수정"
                  onClick={() => router.push(`/crews/${crewId}/host-console/notices/${notice.notice_id}/edit`)}
                  className="shrink-0 rounded-full p-1 text-text-secondary hover:bg-text-secondary/10"
                >
                  <MoreHorizontal size={18} />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-text-secondary">
                <span>작성 {formatDateTime(notice.created_at)}</span>
                <span>댓글 {notice.comment_count} · 반응 {notice.reaction_count}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HostConsolePage() {
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
          <section className="rounded-card bg-primary-green px-5 py-5 text-white shadow-card">
            <p className="text-xs font-semibold text-white/75">방장 운영 콘솔</p>
            <h1 className="mt-1 text-xl font-extrabold tracking-tight">{crewDetail.title}</h1>
            <p className="mt-2 text-xs leading-relaxed text-white/80">
              인증 검증, 가입 신청, 공지를 한 곳에서 확인합니다.
            </p>
          </section>

          <div className="grid grid-cols-3 gap-2.5">
            <SummaryTile label="검토 대기" value={pendingReviewCount} tone="green" />
            <SummaryTile label="가입 대기" value={pendingApplicationCount} tone="amber" />
            <SummaryTile label="공지" value={notices.length} tone="blue" />
          </div>

          <SectionCard className="p-1.5">
            <div className="grid grid-cols-3 gap-1">
              {HOST_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setActiveTab(tab.value)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-3 text-xs font-bold transition-colors ${
                      isActive ? "bg-success-green/55 text-primary-green" : "text-text-secondary hover:bg-text-secondary/5"
                    }`}
                  >
                    <Icon size={15} />
                    {tab.label}
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
