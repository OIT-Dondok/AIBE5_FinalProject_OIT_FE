'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/common/Button';
import { Toast } from '@/components/common/Toast';
import StepIndicator from './_components/StepIndicator';
import Step1AI from './_components/Step1AI';
import Step2Identity from './_components/Step2Identity';
import Step3Mission from './_components/Step3Mission';
import Step4Info from './_components/Step4Info';
import Step5Agreement from './_components/Step5Agreement';
import { createCrew } from '@/services/crew';
import { getPresignedUrl, uploadToS3 } from '@/services/upload';
import { calcDurationDays } from '@/utils/date';
import type {
  DailySettlementType,
  FrequencyType,
  CreateCrewRequest,
} from '@/types/domain';

// ─── 이미지 검증 ─────────────────────────────────────────────────────────────

const MAX_CREW_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_CREW_IMAGE_MIME_TYPES = new Set(['image/jpeg']);
const CREW_IMAGE_MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
};

function resolveCrewImageMimeType(file: File): string | null {
  if (file.type && ALLOWED_CREW_IMAGE_MIME_TYPES.has(file.type)) return file.type;
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext) return null;
  return CREW_IMAGE_MIME_BY_EXTENSION[ext] ?? null;
}

function validateCrewImage(file: File): string | null {
  if (!file.size) return '선택한 이미지 파일이 비어있습니다.';
  if (file.size > MAX_CREW_IMAGE_SIZE_BYTES)
    return `이미지는 최대 5MB까지 업로드할 수 있습니다. (현재 ${Math.ceil(file.size / 1024 / 1024)}MB)`;
  if (!resolveCrewImageMimeType(file)) return '크루 이미지는 JPG 형식만 지원됩니다.';
  return null;
}

// ─── 폼 타입 ────────────────────────────────────────────────────────────────

interface CrewFormData {
  title: string;
  category: string;
  imagePreview: string | null;
  image_s3_key: string | null;
  daily_settlement_type: DailySettlementType;
  frequency_type: FrequencyType;
  mission_schedule_days: string[];
  deposit_amount: number;
  start_date: string;
  end_date: string;
  min_participants: number;
  max_participants: number;
  description: string;
  agreements: {
    honest_verification: boolean;
    daily_review: boolean;
    policy_acknowledgment: boolean;
    no_personal_bias: boolean;
  };
}

const TOTAL_STEPS = 5;

const initialFormData: CrewFormData = {
  title: '',
  category: '',
  imagePreview: null,
  image_s3_key: null,
  daily_settlement_type: 'B',
  frequency_type: 'DAILY',
  mission_schedule_days: [],
  deposit_amount: 10000,
  start_date: '',
  end_date: '',
  min_participants: 2,
  max_participants: 10,
  description: '',
  agreements: {
    honest_verification: false,
    daily_review: false,
    policy_acknowledgment: false,
    no_personal_bias: false,
  },
};

// ─── 유효성 검사 ─────────────────────────────────────────────────────────────

const CREW_MIN_PARTICIPANTS = 2;
const CREW_MAX_PARTICIPANTS = 15;

type Step2Errors = Partial<Record<'title' | 'category', string>>;
type Step3Errors = Partial<Record<'dailySettlementType' | 'depositAmount' | 'missionScheduleDays', string>>;
type Step4Errors = Partial<Record<'startDate' | 'endDate' | 'duration' | 'participants' | 'description', string>>;

function validateStep2(form: CrewFormData): Step2Errors {
  const errors: Step2Errors = {};
  if (!form.title.trim()) errors.title = '크루 이름을 입력해주세요.';
  if (!form.category) errors.category = '카테고리를 선택해주세요.';
  return errors;
}

function validateStep3(form: CrewFormData): Step3Errors {
  const errors: Step3Errors = {};
  if (form.frequency_type === 'SPECIFIC_DAYS' && form.mission_schedule_days.length === 0) {
    errors.missionScheduleDays = '요일을 1개 이상 선택해주세요.';
  }
  if (form.deposit_amount < 1000 || form.deposit_amount > 100000 || form.deposit_amount % 1000 !== 0) {
    errors.depositAmount = '보증금은 1,000원 단위, 1,000~100,000원이어야 합니다.';
  }
  return errors;
}

function validateStep4(form: CrewFormData): Step4Errors {
  const errors: Step4Errors = {};
  if (!form.start_date) errors.startDate = '시작일을 선택해주세요.';
  if (!form.end_date) errors.endDate = '종료일을 선택해주세요.';
  if (form.start_date && form.end_date) {
    const days = calcDurationDays(form.start_date, form.end_date);
    if (days === null || days < 7 || days > 90) errors.duration = '기간은 7~90일이어야 합니다.';
  }
  if (form.min_participants < CREW_MIN_PARTICIPANTS) {
    errors.participants = `최소 인원은 ${CREW_MIN_PARTICIPANTS}명 이상이어야 합니다.`;
  } else if (form.max_participants > CREW_MAX_PARTICIPANTS) {
    errors.participants = `최대 인원은 ${CREW_MAX_PARTICIPANTS}명 이하여야 합니다.`;
  } else if (form.min_participants > form.max_participants) {
    errors.participants = '최소 인원은 최대 인원보다 작아야 합니다.';
  }
  if (!form.description.trim()) errors.description = '크루 소개를 입력해주세요.';
  return errors;
}

// ─── 페이지 컴포넌트 ─────────────────────────────────────────────────────────

export default function CrewNewPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CrewFormData>(initialFormData);
  const [step2Errors, setStep2Errors] = useState<Step2Errors>({});
  const [step3Errors, setStep3Errors] = useState<Step3Errors>({});
  const [step4Errors, setStep4Errors] = useState<Step4Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastOpen, setIsToastOpen] = useState(false);

  const imageBlobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (imageBlobUrlRef.current) {
        URL.revokeObjectURL(imageBlobUrlRef.current);
      }
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setIsToastOpen(true);
  };

  const update = <K extends keyof CrewFormData>(key: K, value: CrewFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // ─── 이미지 업로드 핸들러 ───────────────────────────────────────────────────

  const handleCrewImageUpload = async (file: File) => {
    const errorMsg = validateCrewImage(file);
    if (errorMsg) {
      showToast(errorMsg);
      return;
    }

    const contentType = resolveCrewImageMimeType(file);
    if (!contentType) return;

    setIsUploadingImage(true);
    try {
      const presignRes = await getPresignedUrl({
        purpose: 'CREW_IMAGE',
        content_type: contentType as 'image/jpeg',
        content_length: file.size,
      });

      await uploadToS3(presignRes.data.upload_url, file, contentType);

      if (imageBlobUrlRef.current) {
        URL.revokeObjectURL(imageBlobUrlRef.current);
      }
      const previewUrl = URL.createObjectURL(file);
      imageBlobUrlRef.current = previewUrl;

      setFormData((prev) => ({
        ...prev,
        imagePreview: previewUrl,
        image_s3_key: presignRes.data.s3_key,
      }));
    } catch {
      showToast('프로필 이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // ─── AI 자동완성 ────────────────────────────────────────────────────────────

  const handleAIComplete = (draft: {
    title: string;
    description: string;
    frequency_type: FrequencyType;
    mission_schedule_days: string[];
    daily_settlement_type: DailySettlementType;
    deposit_amount: number;
    duration_days: number;
  } | null) => {
    if (draft) {
      const startDate = (() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
      })();
      const endDate = (() => {
        const d = new Date();
        d.setDate(d.getDate() + 1 + draft.duration_days);
        return d.toISOString().split('T')[0];
      })();

      setFormData((prev) => ({
        ...prev,
        title: draft.title || prev.title,
        description: draft.description || prev.description,
        frequency_type: draft.frequency_type,
        mission_schedule_days: draft.mission_schedule_days ?? [],
        daily_settlement_type: draft.daily_settlement_type,
        deposit_amount: draft.deposit_amount || prev.deposit_amount,
        start_date: startDate,
        end_date: endDate,
      }));
    }
    setCurrentStep(2);
  };

  // ─── 스텝 이동 ──────────────────────────────────────────────────────────────

  const handleNextFromStep2 = () => {
    const errors = validateStep2(formData);
    setStep2Errors(errors);
    if (Object.keys(errors).length === 0) setCurrentStep(3);
  };

  const handleNextFromStep3 = () => {
    const errors = validateStep3(formData);
    setStep3Errors(errors);
    if (Object.keys(errors).length === 0) setCurrentStep(4);
  };

  const handleNextFromStep4 = () => {
    const errors = validateStep4(formData);
    setStep4Errors(errors);
    if (Object.keys(errors).length === 0) setCurrentStep(5);
  };

  // ─── 크루 생성 제출 ─────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const recruitmentDeadline = (() => {
        const [y, m, d] = formData.start_date.split('-').map(Number);
        const prevDay = new Date(Date.UTC(y, m - 1, d - 1));
        prevDay.setUTCHours(23, 59, 59, 0);
        return prevDay.toISOString();
      })();

      const payload: CreateCrewRequest = {
        title: formData.title,
        description: formData.description,
        image_s3_key: formData.image_s3_key,
        category: formData.category,
        deposit_amount: formData.deposit_amount,
        min_participants: formData.min_participants,
        max_participants: formData.max_participants,
        frequency_type: formData.frequency_type,
        mission_schedule_days:
          formData.frequency_type === 'SPECIFIC_DAYS' ? formData.mission_schedule_days : undefined,
        daily_settlement_type: formData.daily_settlement_type,
        host_agreement: {
          version: 'v1',
          agreed_at: new Date().toISOString(),
          items: [
            { key: 'honest_verification', agreed: formData.agreements.honest_verification },
            { key: 'daily_review', agreed: formData.agreements.daily_review },
            { key: 'policy_acknowledgment', agreed: formData.agreements.policy_acknowledgment },
            { key: 'no_personal_bias', agreed: formData.agreements.no_personal_bias },
          ],
        },
        recruitment_deadline: recruitmentDeadline,
        start_date: formData.start_date,
        end_date: formData.end_date,
      };

      const res = await createCrew(payload);
      const data: unknown = res.data;
      if (
        !data ||
        typeof data !== 'object' ||
        !('crew_id' in data) ||
        typeof (data as Record<string, unknown>).crew_id !== 'number'
      ) {
        throw new Error('크루 생성 응답이 올바르지 않습니다.');
      }
      const crewId = (data as { crew_id: number }).crew_id;
      router.push(`/crews/${crewId}`);
    } catch (err) {
      const error = err as { response?: { data?: { error_code?: string } } };
      const code = error?.response?.data?.error_code;
      if (code === 'INSUFFICIENT_BALANCE') {
        showToast('포인트가 부족합니다. 충전 후 다시 시도해주세요.');
      } else if (code === 'INVALID_DEPOSIT_AMOUNT') {
        showToast('보증금은 1,000원 단위, 1,000~100,000원이어야 합니다.');
      } else {
        showToast('크루 생성에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── 렌더링 ─────────────────────────────────────────────────────────────────

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1AI onComplete={handleAIComplete} />;
      case 2:
        return (
          <Step2Identity
            title={formData.title}
            category={formData.category}
            imagePreview={formData.imagePreview}
            isUploadingImage={isUploadingImage}
            onTitleChange={(v) => update('title', v)}
            onCategoryChange={(v) => update('category', v)}
            onImageFileSelected={handleCrewImageUpload}
            errors={step2Errors}
          />
        );
      case 3:
        return (
          <Step3Mission
            dailySettlementType={formData.daily_settlement_type}
            frequencyType={formData.frequency_type}
            missionScheduleDays={formData.mission_schedule_days}
            depositAmount={formData.deposit_amount}
            onSettlementTypeChange={(v) => update('daily_settlement_type', v)}
            onFrequencyTypeChange={(v) => update('frequency_type', v)}
            onScheduleDaysChange={(v) => update('mission_schedule_days', v)}
            onDepositAmountChange={(v) => update('deposit_amount', v)}
            errors={step3Errors}
          />
        );
      case 4:
        return (
          <Step4Info
            startDate={formData.start_date}
            endDate={formData.end_date}
            minParticipants={formData.min_participants}
            maxParticipants={formData.max_participants}
            description={formData.description}
            onStartDateChange={(v) => update('start_date', v)}
            onEndDateChange={(v) => update('end_date', v)}
            onMinParticipantsChange={(v) => update('min_participants', v)}
            onMaxParticipantsChange={(v) => update('max_participants', v)}
            onDescriptionChange={(v) => update('description', v)}
            errors={step4Errors}
          />
        );
      case 5:
        return (
          <Step5Agreement
            agreements={formData.agreements}
            onAgreementChange={(key, value) =>
              setFormData((prev) => ({
                ...prev,
                agreements: { ...prev.agreements, [key]: value },
              }))
            }
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  const renderBottomNav = () => {
    if (currentStep === 1 || currentStep === 5) return null;

    const handleNext = () => {
      if (currentStep === 2) handleNextFromStep2();
      else if (currentStep === 3) handleNextFromStep3();
      else if (currentStep === 4) handleNextFromStep4();
    };

    return (
      <div className="sticky bottom-0 bg-background/90 backdrop-blur-md border-t border-text-secondary/8 px-5 py-4 flex gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setCurrentStep((s) => s - 1)}
          className="w-24"
        >
          이전
        </Button>
        <Button variant="primary-green" size="lg" fullWidth onClick={handleNext}>
          다음
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="w-full max-w-[430px] mx-auto flex flex-col min-h-screen">
        <Header
          title="크루 만들기"
          showBackButton={currentStep === 1}
          onBackClick={() => router.back()}
        />

        <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        <div className="flex-1 overflow-y-auto">
          {renderStep()}
        </div>

        {renderBottomNav()}
      </div>

      <Toast
        isOpen={isToastOpen}
        onClose={() => setIsToastOpen(false)}
        message={toastMessage}
      />
    </div>
  );
}
