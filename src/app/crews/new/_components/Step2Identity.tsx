'use client';

import { useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Input } from '@/components/common/Input';
import { CATEGORY_LABEL, CATEGORY_EMOJI, CATEGORY_GRADIENT } from '@/constants/crew';

interface Step2IdentityProps {
  title: string;
  category: string;
  imagePreview: string | null;
  isUploadingImage: boolean;
  onTitleChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onImageFileSelected: (file: File) => void;
  errors: Partial<Record<'title' | 'category', string>>;
}

const CATEGORIES = Object.keys(CATEGORY_LABEL);

export default function Step2Identity({
  title,
  category,
  imagePreview,
  isUploadingImage,
  onTitleChange,
  onCategoryChange,
  onImageFileSelected,
  errors,
}: Step2IdentityProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onImageFileSelected(file);
    e.target.value = '';
  };

  const defaultGradient = category ? CATEGORY_GRADIENT[category] : 'from-gray-300 to-gray-200';
  const defaultEmoji = category ? CATEGORY_EMOJI[category] : '🏃';

  return (
    <div className="flex flex-col px-5 pt-4 pb-8 gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-text-primary">크루의 정체성을 정해주세요</h2>
        <p className="text-sm text-text-secondary">이름과 카테고리, 대표 이미지를 설정해요.</p>
      </div>

      {/* 대표 이미지 */}
      <div className="flex flex-col gap-2">
        <label className="text-[12px] font-bold text-text-secondary">대표 이미지</label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => !isUploadingImage && fileInputRef.current?.click()}
            disabled={isUploadingImage}
            className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-md disabled:cursor-wait"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="크루 이미지" className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${defaultGradient} flex items-center justify-center`}>
                <span className="text-3xl">{defaultEmoji}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
              {isUploadingImage ? (
                <Loader2 size={20} className="text-white animate-spin" />
              ) : (
                <Camera size={20} className="text-white" />
              )}
            </div>
          </button>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-text-primary">직접 업로드</p>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              카테고리 기본 이미지가 자동 적용돼요.
              <br />
              원하는 이미지로 변경도 가능해요.
            </p>
            <p className="text-[10px] text-text-secondary/70">JPG · PNG · WebP / 최대 5MB</p>
            <button
              type="button"
              onClick={() => !isUploadingImage && fileInputRef.current?.click()}
              disabled={isUploadingImage}
              className="mt-1 text-[11px] text-primary-green font-semibold hover:opacity-75 transition-opacity text-left disabled:opacity-40"
            >
              {isUploadingImage ? '업로드 중...' : '이미지 선택 →'}
            </button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
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
