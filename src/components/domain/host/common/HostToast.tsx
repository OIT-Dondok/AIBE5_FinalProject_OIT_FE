"use client";

type HostToastProps = {
  message: string;
};

export function HostToast({ message }: HostToastProps) {
  return (
    <div className="fixed inset-x-0 bottom-6 z-[90] flex justify-center px-5 pointer-events-none">
      <div
        className="flex w-fit items-center gap-2.5 rounded-2xl bg-[#28251F] px-4 py-3 text-white shadow-lg"
        role="status"
        aria-live="polite"
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D89B4C] text-xs font-extrabold text-white">
          !
        </span>
        <span className="text-[13px] font-extrabold">{message}</span>
      </div>
    </div>
  );
}
