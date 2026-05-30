"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { AlertTriangle, ExternalLink, Flag, Mail, MessageCircle, X } from "lucide-react";

const OPEN_CHAT_URL = "https://open.kakao.com/o/s5Pxfgxi";
const REPORT_EMAIL = "report@dondok.example";

export function ReportSuspicionCallout({
  notice,
  actionLabel,
}: {
  notice: string;
  actionLabel: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <aside className="rounded-2xl bg-[#FBF1E1] px-4 py-3 text-[#8A5E1E]">
        <p className="flex items-start gap-2 text-[11px] font-extrabold leading-relaxed">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          {notice}
        </p>
      </aside>

      <button
        type="button"
        className="inline-flex w-full select-none items-center justify-center rounded-button bg-[#F9D7CF] px-4 py-2.5 text-sm font-semibold text-red-600 shadow-none hover:bg-[#F4C4BA] focus:outline-none"
        onClick={() => setIsModalOpen(true)}
      >
        <span className="flex items-center justify-center gap-2">
          <Flag size={15} />
          {actionLabel}
        </span>
      </button>

      {isModalOpen && <ReportContactModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

function ReportContactModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/35 px-5 backdrop-blur-[2px]"
      role="presentation"
      onClick={onClose}
    >
      <section
        aria-label="부정 의심 신고 연락처"
        aria-modal="true"
        className="w-full max-w-[360px] rounded-[28px] bg-card px-5 py-5 shadow-[0_18px_48px_rgba(34,34,34,0.22)]"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-black tracking-[0.06em] text-red-500">
              REPORT
            </p>
            <h2 className="mt-1 text-lg font-black tracking-tight text-text-primary">
              부정 의심 신고
            </h2>
            <p className="mt-1 text-xs font-medium leading-relaxed text-text-secondary">
              운영팀에 의심 상황을 전달할 수 있어요.
            </p>
          </div>
          <button
            type="button"
            aria-label="신고 연락처 닫기"
            className="rounded-full p-2 text-text-secondary hover:bg-text-secondary/10 hover:text-text-primary"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <ContactRow
            icon={<Mail size={18} />}
            label="이메일"
            value={REPORT_EMAIL}
            href={`mailto:${REPORT_EMAIL}`}
          />
          <ContactRow
            icon={<MessageCircle size={18} />}
            label="오픈 채팅방"
            value={OPEN_CHAT_URL}
            href={OPEN_CHAT_URL}
          />
        </div>
      </section>
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="flex items-center gap-3 rounded-2xl bg-background px-4 py-3 text-left hover:bg-success-green/25"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-black text-text-secondary">
          {label}
        </span>
        <span className="mt-0.5 block truncate text-sm font-black text-text-primary">
          {value}
        </span>
      </span>
      <ExternalLink size={15} className="shrink-0 text-text-secondary" />
    </a>
  );
}
