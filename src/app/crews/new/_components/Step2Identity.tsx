'use client';

import { Input } from '@/components/common/Input';
import { CATEGORY_LABEL, CATEGORY_EMOJI, CATEGORY_GRADIENT } from '@/constants/crew';

// TODO: S3 CORS 설정 완료 후 이미지 업로드 기능 복구

interface Step2IdentityProps {
  title: string;
  category: string;
  onTitleChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  errors: Partial<Record<'title' | 'category', string>>;
}

const CATEGORIES = Object.keys(CATEGORY_LABEL);

export default function Step2Identity({
  title,
  category,
  onTitleChange,
  onCategoryChange,
  errors,
}: Step2IdentityProps) {
  const defaultImageGradient = category ? CATEGORY_GRADIENT[category] : 'from-gray-300 to-gray-200';
  const defaultEmoji = category ? CATEGORY_EMOJI[category] : '🏃';

  return (
    <div className="flex flex-col px-5 pt-4 pb-8 gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-text-primary">크루의 정체성을 정해주세요</h2>
        <p className="text-sm text-text-secondary">이름과 카테고리를 설정해요.</p>
      </div>

      {/* 카테고리 기본 이미지 미리보기 (업로드 비활성화 상태) */}
      <div className="flex items-center gap-4">
        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${defaultImageGradient} flex items-center justify-center shadow-md flex-shrink-0`}>
          <span className="text-3xl">{defaultEmoji}</span>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold text-text-primary">대표 이미지</p>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            카테고리 선택 시 기본 이미지가 적용돼요.
          </p>
        </div>
      </div>

      {/* 크루 이름 */}
      <Input
        label="크루 이름"
        required
        placeholder="예: 새벽 6시 기상 크루"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        errorMessage={errors.title}
        maxLength={30}
      />
      <div className="-mt-4 flex justify-end">
        <span className="text-[11px] text-text-secondary">{title.length} / 30</span>
      </div>

      {/* 카테고리 */}
      <div className="flex flex-col gap-3">
        <label className="text-[12px] font-bold text-text-secondary">
          카테고리 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onCategoryChange(key)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all ${
                category === key
                  ? 'border-primary-green bg-primary-green/8'
                  : 'border-transparent bg-card hover:border-text-secondary/20'
              }`}
            >
              <span className="text-xl">{CATEGORY_EMOJI[key]}</span>
              <span className={`text-[11px] font-semibold ${category === key ? 'text-primary-green' : 'text-text-secondary'}`}>
                {CATEGORY_LABEL[key].replace(/.*\s/, '')}
              </span>
            </button>
          ))}
        </div>
        {errors.category && (
          <span className="text-[11px] text-red-500 pl-1">{errors.category}</span>
        )}
      </div>
    </div>
  );
}
