"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Modal } from "@/components/common/Modal";

interface NotificationSettings {
  emojiReaction: boolean;
  hostVerification: boolean;
  dailyResult: boolean;
  finalSettlement: boolean;
  crewDissolved: boolean;
  dndEnabled: boolean;
  dndStart: string;
  dndEnd: string;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  emojiReaction: true,
  hostVerification: true,
  dailyResult: true,
  finalSettlement: true,
  crewDissolved: true,
  dndEnabled: false,
  dndStart: "22:00",
  dndEnd: "08:00",
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
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

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationSettingsModal({ isOpen, onClose }: NotificationSettingsModalProps) {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);

  const set = <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    // TODO: API 연결
    onClose();
  };

  const TOGGLE_ROWS: Array<{ key: keyof NotificationSettings; label: string; desc: string }> = [
    { key: "emojiReaction", label: "이모지 리액션", desc: "피드 인증에 리액션이 달렸을 때" },
    { key: "hostVerification", label: "방장 검증 대기", desc: "인증이 방장 검토 대기 중일 때" },
    { key: "dailyResult", label: "일일 결과", desc: "오늘의 미션 인증 결과를 받을 때" },
    { key: "finalSettlement", label: "최종 정산", desc: "크루 종료 후 정산이 완료됐을 때" },
    { key: "crewDissolved", label: "크루 해체", desc: "참여 중인 크루가 취소될 때" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="알림 설정">
      <div className="px-5 pt-5 pb-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-extrabold text-text-primary">알림 설정</h2>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="p-1 -mr-1 text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 알림 항목 토글 */}
        <div className="flex flex-col divide-y divide-text-secondary/10">
          {TOGGLE_ROWS.map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-3 py-3.5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary">{label}</p>
                <p className="mt-0.5 text-[11px] font-medium text-text-secondary">{desc}</p>
              </div>
              <Toggle
                checked={settings[key] as boolean}
                onChange={(v) => set(key, v)}
              />
            </div>
          ))}
        </div>

        {/* 방해금지 시간 */}
        <div className="mt-4 rounded-xl bg-background px-4 py-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-primary">방해금지 시간</p>
              <p className="mt-0.5 text-[11px] font-medium text-text-secondary">설정한 시간엔 알림을 받지 않아요</p>
            </div>
            <Toggle
              checked={settings.dndEnabled}
              onChange={(v) => set("dndEnabled", v)}
            />
          </div>
          {settings.dndEnabled && (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="time"
                value={settings.dndStart}
                onChange={(e) => set("dndStart", e.target.value)}
                className="flex-1 rounded-lg border border-text-secondary/20 bg-card px-3 py-2 text-sm font-medium text-text-primary focus:border-primary-green focus:outline-none"
              />
              <span className="text-xs font-medium text-text-secondary">~</span>
              <input
                type="time"
                value={settings.dndEnd}
                onChange={(e) => set("dndEnd", e.target.value)}
                className="flex-1 rounded-lg border border-text-secondary/20 bg-card px-3 py-2 text-sm font-medium text-text-primary focus:border-primary-green focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* 취소/저장 버튼 */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-xl border-2 border-text-secondary/20 bg-card text-sm font-extrabold text-text-primary transition-colors hover:bg-text-secondary/5"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-12 rounded-xl bg-primary-green text-sm font-extrabold text-white transition-colors hover:bg-[#3F7A55]"
          >
            저장
          </button>
        </div>
      </div>
    </Modal>
  );
}
