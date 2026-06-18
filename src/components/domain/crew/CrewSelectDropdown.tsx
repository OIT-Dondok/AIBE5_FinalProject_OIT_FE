'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import type { MyCrew } from '@/types/domain';

interface CrewSelectDropdownProps {
  value: number;
  options: MyCrew[];
  onChange: (v: number) => void;
}

export default function CrewSelectDropdown({ value, options, onChange }: CrewSelectDropdownProps) {
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
        const selectedIdx = options.findIndex((o) => o.crew_id === value);
        setFocusedIndex(selectedIdx >= 0 ? selectedIdx : 0);
      } else {
        setFocusedIndex(-1);
      }
      return next;
    });
  };

  const handleSelect = (val: number) => {
    onChange(val);
    closeDropdown();
    buttonRef.current?.focus();
  };

  // 트리거 버튼에서의 키보드 이벤트 핸들러
  const handleButtonKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setIsOpen(true);
      const selectedIdx = options.findIndex((o) => o.crew_id === value);
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
        setFocusedIndex((prev) => (prev + 1) % options.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + options.length) % options.length);
        break;
      case 'Tab':
        closeDropdown();
        break;
      default:
        break;
    }
  };

  const selectedCrew = options.find((o) => o.crew_id === value);
  const selectedLabel = selectedCrew ? selectedCrew.title : '선택된 크루 없음';

  return (
    <div ref={containerRef} className="relative w-full" onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        id="crew-select-dropdown-btn"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="crew-select-dropdown-list"
        onClick={handleToggle}
        onKeyDown={handleButtonKeyDown}
        className="w-full h-11 px-3.5 flex items-center justify-between text-sm font-semibold rounded-xl border border-text-secondary/20 bg-white shadow-sm transition-all duration-200 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#4C73D9] focus:ring-offset-1 text-text-primary text-left"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-text-secondary/60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          id="crew-select-dropdown-list"
          role="listbox"
          aria-labelledby="crew-select-dropdown-btn"
          tabIndex={-1}
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 bg-white border border-text-secondary/15 rounded-2xl shadow-xl py-1 overflow-hidden origin-top animate-dropdown-open focus:outline-none max-h-60 overflow-y-auto"
        >
          {options.map((opt, idx) => {
            const isSelected = opt.crew_id === value;
            const isFocused = idx === focusedIndex;

            return (
              <button
                key={opt.crew_id}
                ref={(el) => {
                  optionsRef.current[idx] = el;
                }}
                type="button"
                role="option"
                aria-selected={isSelected}
                tabIndex={isFocused ? 0 : -1}
                onClick={() => handleSelect(opt.crew_id)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    handleSelect(opt.crew_id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 text-sm font-semibold text-left transition-colors focus:outline-none ${
                  isFocused ? 'bg-text-secondary/5' : ''
                } ${isSelected ? 'text-[#4C73D9]' : 'text-text-primary'} hover:bg-text-secondary/5`}
              >
                <span className="truncate mr-2">{opt.title}</span>
                {isSelected && (
                  <Check size={14} strokeWidth={3} className="shrink-0 text-[#4C73D9]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
