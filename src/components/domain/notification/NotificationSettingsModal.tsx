"use client";

import { useState } from "react";
import { ChevronRight, Moon, X } from "lucide-react";
import { BottomSheet } from "@/components/common/BottomSheet";
import { Modal } from "@/components/common/Modal";

interface NotificationSettings {
  emojiReaction: boolean;
  hostVerification: boolean;
  missionDeadline: boolean;
  dailyResult: boolean;
  finalSettlement: boolean;
  crewDissolved: boolean;
  crewNews: boolean;
  dndEnabled: boolean;
  dndStart: string;
  dndEnd: string;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  emojiReaction: true,
  hostVerification: true,
  missionDeadline: true,
  dailyResult: true,
  finalSettlement: true,
  crewDissolved: true,
  crewNews: true,
  dndEnabled: false,
  dndStart: "22:00",
  dndEnd: "08:00",
};

const TOGGLE_ROWS: Array<{ key: keyof NotificationSettings; label: string; desc: string }> = [
  { key: "emojiReaction", label: "이모지 리액션", desc: "새 리액션 등록" },
  { key: "hostVerification", label: "방장 검증 대기", desc: "새 인증 업로드, 미검토 인증 존재" },
  { key: "missionDeadline", label: "인증 마감 임박", desc: "" },
  { key: "dailyResult", label: "일일 결과", desc: "인증 성공, 인증 실패, 예상 환급금 변동" },
  { key: "finalSettlement", label: "최종 정산", desc: "최종 정산 완료, 환급 완료" },
  { key: "crewDissolved", label: "크루 해체", desc: "" },
  { key: "crewNews", label: "크루 소식", desc: "크루 종료 예정, 새 공지 등록, 공지 댓글 등록" },
];

function Toggle({ checked, onChange, ariaLabel }: { checked: boolean; onChange: (v: boolean) => void; ariaLabel: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
        checked ? "bg-primary-green" : "bg-text-secondary/30"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

interface NotificationSettingsPanelProps {
  onCancel?: () => void;
  onSave?: () => void;
  showHeading?: boolean;
}

export function NotificationSettingsPanel({
  onCancel,
  onSave,
  showHeading = false,
}: NotificationSettingsPanelProps) {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isDndSheetOpen, setIsDndSheetOpen] = useState(false);

  const set = <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    // TODO: API 연결
    onSave?.();
  };

  return (
    <div className="px-5 pb-8 pt-4">
      {showHeading && (
        <div className="mb-5">
          <h2 className="text-base font-extrabold text-text-primary">알림 설정</h2>
          <p className="mt-1 text-xs font-medium text-text-secondary">
            받고 싶은 알림과 방해금지 시간을 관리해요.
          </p>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl bg-card shadow-card">
        <div className="flex flex-col divide-y divide-text-secondary/10">
          {TOGGLE_ROWS.map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-3 px-4 py-3.5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary">{label}</p>
                {desc && <p className="mt-0.5 text-[11px] font-medium text-text-secondary">{desc}</p>}
              </div>
              <Toggle checked={settings[key] as boolean} onChange={(v) => set(key, v)} ariaLabel={label} />
            </div>
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={() => setIsDndSheetOpen(true)}
        className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-card px-4 py-4 text-left shadow-card transition-[background-color,transform] duration-150 ease-out hover:bg-white active:scale-[0.985] active:bg-[#F7F7F3]"
        aria-label="방해금지 시간 설정"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF5EE] text-primary-green">
          <Moon size={18} strokeWidth={2.2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-text-primary">방해금지 시간</span>
          <span className="mt-0.5 block text-xs font-semibold text-text-secondary">
            {settings.dndStart} - {settings.dndEnd}
          </span>
        </span>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
            settings.dndEnabled
              ? "bg-[#E8F2EB] text-primary-green"
              : "bg-text-secondary/10 text-text-secondary"
          }`}
        >
          {settings.dndEnabled ? "활성" : "꺼짐"}
        </span>
        <ChevronRight size={18} className="shrink-0 text-text-secondary/70" />
      </button>

      <BottomSheet
        isOpen={isDndSheetOpen}
        onClose={() => setIsDndSheetOpen(false)}
        title="방해금지 시간"
        subtitle="설정한 시간에는 알림을 받지 않아요."
        ariaLabel="방해금지 시간 설정"
      >
        <div className="px-5 pb-6 pt-2">
          <div className="rounded-2xl bg-background/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-text-primary">방해금지 활성화</p>
                <p className="mt-0.5 text-[11px] font-medium text-text-secondary">
                  {settings.dndStart} - {settings.dndEnd}
                </p>
              </div>
              <Toggle checked={settings.dndEnabled} onChange={(v) => set("dndEnabled", v)} ariaLabel="방해금지 활성화" />
            </div>

            <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-end gap-2">
              <label className="min-w-0">
                <span className="mb-1.5 block text-[11px] font-bold text-text-secondary">시작</span>
                <input
                  type="time"
                  value={settings.dndStart}
                  onChange={(e) => set("dndStart", e.target.value)}
                  aria-label="방해금지 시작 시간"
                  className="h-12 w-full min-w-0 rounded-xl border border-text-secondary/15 bg-card px-3 text-center text-sm font-extrabold text-text-primary shadow-sm focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/15 disabled:opacity-50"
                  disabled={!settings.dndEnabled}
                />
              </label>
              <span className="pb-3.5 text-sm font-bold text-text-secondary/70">~</span>
              <label className="min-w-0">
                <span className="mb-1.5 block text-[11px] font-bold text-text-secondary">종료</span>
                <input
                  type="time"
                  value={settings.dndEnd}
                  onChange={(e) => set("dndEnd", e.target.value)}
                  aria-label="방해금지 종료 시간"
                  className="h-12 w-full min-w-0 rounded-xl border border-text-secondary/15 bg-card px-3 text-center text-sm font-extrabold text-text-primary shadow-sm focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/15 disabled:opacity-50"
                  disabled={!settings.dndEnabled}
                />
              </label>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsDndSheetOpen(false)}
            className="mt-4 h-12 w-full rounded-xl bg-primary-green text-sm font-extrabold text-white transition-colors hover:bg-[#3F7A55]"
          >
            적용
          </button>
        </div>
      </BottomSheet>

      <div className={`mt-5 grid gap-3 ${onCancel ? "grid-cols-2" : "grid-cols-1"}`}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="h-12 rounded-xl border-2 border-text-secondary/20 bg-card text-sm font-extrabold text-text-primary transition-colors hover:bg-text-secondary/5"
          >
            취소
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          className="h-12 rounded-xl bg-primary-green text-sm font-extrabold text-white transition-colors hover:bg-[#3F7A55]"
        >
          저장
        </button>
      </div>
    </div>
  );
}

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationSettingsModal({ isOpen, onClose }: NotificationSettingsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="알림 설정">
      <div className="pt-5">
        <div className="mb-1 flex items-center justify-between px-5">
          <h2 className="text-base font-extrabold text-text-primary">알림 설정</h2>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="-mr-1 p-1 text-text-secondary transition-colors hover:text-text-primary"
          >
            <X size={20} />
          </button>
        </div>
        <NotificationSettingsPanel onCancel={onClose} onSave={onClose} />
      </div>
    </Modal>
  );
}
