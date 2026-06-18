'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import type { CrewStatus } from '@/types/domain';

type StatusFilter = CrewStatus | 'ALL';

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: '전체', value: 'ALL' },
  { label: '모집중', value: 'RECRUITING' },
  { label: '진행중', value: 'ACTIVE' },
  { label: '종료됨', value: 'CLOSED' },
];

interface StatusDropdownProps {
  value: StatusFilter;
  onChange: (v: StatusFilter) => void;
}

export default function StatusDropdown({ value, onChange }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const closeDropdown = () => {
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  // 외부 클릭 시 닫힘 처리
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // focusedIndex가 변경될 때 해당 옵션 버튼에 포커스 제공
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && optionsRef.current[focusedIndex]) {
      optionsRef.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        const selectedIdx = STATUS_OPTIONS.findIndex((o) => o.value === value);
        setFocusedIndex(selectedIdx >= 0 ? selectedIdx : 0);
      } else {
        setFocusedIndex(-1);
      }
      return next;
    });
  };

  const handleSelect = (val: StatusFilter) => {
    onChange(val);
    closeDropdown();
    buttonRef.current?.focus();
  };

  // 트리거 버튼에서의 키보드 이벤트 핸들러
  const handleButtonKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setIsOpen(true);
      const selectedIdx = STATUS_OPTIONS.findIndex((o) => o.value === value);
      setFocusedIndex(selectedIdx >= 0 ? selectedIdx : 0);
    }
  };

  // 드롭다운 리스트 내에서의 키보드 이벤트 핸들러
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        closeDropdown();
        buttonRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % STATUS_OPTIONS.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + STATUS_OPTIONS.length) % STATUS_OPTIONS.length);
        break;
      case 'Tab':
        closeDropdown();
        break;
      default:
        break;
    }
  };

  const selectedLabel = STATUS_OPTIONS.find((o) => o.value === value)?.label ?? '전체';
  const isFiltered = value !== 'ALL';

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        id="status-dropdown-btn"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="status-dropdown-list"
        onClick={handleToggle}
        onKeyDown={handleButtonKeyDown}
        className={`h-9 px-4 flex items-center gap-1.5 text-xs font-bold rounded-full border shadow-sm transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-green focus:ring-offset-1 ${
          isFiltered
            ? 'bg-primary-green/10 border-primary-green/30 text-primary-green'
            : 'bg-card border-text-secondary/15 text-text-primary'
        }`}
      >
        <span>{selectedLabel}</span>
        <ChevronDown
          size={12}
          className={`shrink-0 text-text-secondary/60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          id="status-dropdown-list"
          role="listbox"
          aria-labelledby="status-dropdown-btn"
          tabIndex={-1}
          className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[100px] bg-card border border-text-secondary/10 rounded-2xl shadow-xl py-1 overflow-hidden origin-top-right animate-dropdown-open focus:outline-none"
        >
          {STATUS_OPTIONS.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isFocused = idx === focusedIndex;

            return (
              <button
                key={opt.value}
                ref={(el) => {
                  optionsRef.current[idx] = el;
                }}
                type="button"
                role="option"
                aria-selected={isSelected}
                tabIndex={isFocused ? 0 : -1}
                onClick={() => handleSelect(opt.value)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    handleSelect(opt.value);
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-left transition-colors focus:outline-none ${
                  isFocused ? 'bg-text-secondary/5' : ''
                } ${isSelected ? 'text-primary-green' : 'text-text-primary'} hover:bg-text-secondary/5`}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <Check size={12} strokeWidth={3} className="shrink-0 ml-2 text-primary-green" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
