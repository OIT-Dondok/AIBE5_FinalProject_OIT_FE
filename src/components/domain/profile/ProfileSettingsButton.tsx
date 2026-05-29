import { Settings } from "lucide-react";

export function ProfileSettingsButton() {
  return (
    <button
      type="button"
      aria-label="프로필 설정"
      className="p-1 -mr-1 rounded-full text-text-secondary hover:text-text-primary active:scale-95 transition-all"
    >
      <Settings size={22} />
    </button>
  );
}
