'use client';

import { useEffect, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/common/Button';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { Toast } from '@/components/common/Toast';
import StepIndicator from './_components/StepIndicator';
import Step1AI from './_components/Step1AI';
import Step2Identity from './_components/Step2Identity';
import Step3Mission from './_components/Step3Mission';
import Step4Info from './_components/Step4Info';
import Step5Agreement from './_components/Step5Agreement';
import { DodinShortageModal } from '@/components/domain/point/DodinShortageModal';
import { useDodinShortage } from '@/components/domain/point/useDodinShortage';
import { createCrew } from '@/services/crew';
import { getPresignedUrl, uploadToS3 } from '@/services/upload';
import { prepareImageForUpload, UnsupportedImageError } from '@/lib/prepareImageForUpload';
import { calcDurationDays, snapToScheduledDay } from '@/utils/date';
import type {
  DailySettlementType,
  FrequencyType,
  CreateCrewRequest,
} from '@/types/domain';
import type { ErrorResponse } from '@/types/common';

// ─── 이미지 검증 ─────────────────────────────────────────────────────────────

// 명세에 크루 이미지 전용 한도는 없어, 문서화된 유일 이미지 한도(mission 10MB)에 맞춤.
const MAX_CREW_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

// 포맷 검증·변환은 prepareImageForUpload가 담당. 여기서는 크기만 검증한다.
function validateCrewImageSize(file: File): string | null {
  if (!file.size) return '선택한 이미지 파일이 비어있습니다.';
  if (file.size > MAX_CREW_IMAGE_SIZE_BYTES)
    return `이미지는 최대 10MB까지 업로드할 수 있습니다. (현재 ${Math.ceil(file.size / 1024 / 1024)}MB)`;
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
    crew_limit_acknowledgment: boolean;
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
    crew_limit_acknowledgment: false,
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
  const shortage = useDodinShortage();
  const [isCheckingDeposit, setIsCheckingDeposit] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CrewFormData>(initialFormData);
  const [step2Errors, setStep2Errors] = useState<Step2Errors>({});
  const [step3Errors, setStep3Errors] = useState<Step3Errors>({});
  const [step4Errors, setStep4Errors] = useState<Step4Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');
  const [isToastOpen, setIsToastOpen] = useState(false);
  // 5단계 크루 생성 확인 모달
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const imageBlobUrlRef = useRef<string | null>(null);
  // 비멱등 생성 API 중복 호출 방지용 재진입 가드.
  // isSubmitting state는 비동기 갱신이라 빠른 연속 클릭을 막지 못하므로 ref로 즉시 차단한다.
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (imageBlobUrlRef.current) {
        URL.revokeObjectURL(imageBlobUrlRef.current);
      }
    };
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setIsToastOpen(true);
  };

  const update = <K extends keyof CrewFormData>(key: K, value: CrewFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // ─── 미션 날짜 보정 (특정 요일 크루) ──────────────────────────────────────────
  // 특정 요일 인증이면 시작일은 이후 첫 인증 요일, 종료일은 이전 마지막 인증 요일로 스냅한다.
  // 매일(DAILY) 크루는 보정하지 않는다.

  const handleStartDateChange = (value: string) => {
    if (formData.frequency_type !== 'SPECIFIC_DAYS') {
      update('start_date', value);
      return;
    }
    const snapped = snapToScheduledDay(value, formData.mission_schedule_days, 'forward');
    update('start_date', snapped);
    if (snapped !== value) showToast('인증 요일에 맞춰 시작일을 조정했어요.', 'warning');
  };

  const handleEndDateChange = (value: string) => {
    if (formData.frequency_type !== 'SPECIFIC_DAYS') {
      update('end_date', value);
      return;
    }
    const snapped = snapToScheduledDay(value, formData.mission_schedule_days, 'backward');
    update('end_date', snapped);
    if (snapped !== value) showToast('인증 요일에 맞춰 종료일을 조정했어요.', 'warning');
  };

  // ─── 이미지 업로드 핸들러 ───────────────────────────────────────────────────

  const handleCrewImageUpload = async (file: File) => {
    const errorMsg = validateCrewImageSize(file);
    if (errorMsg) {
      showToast(errorMsg, 'error');
      return;
    }

    setIsUploadingImage(true);
    try {
      // 포맷 검증 + HEIC는 자동으로 JPEG 변환 (크루 이미지는 EXIF 불필요 → 경고 없이 변환)
      const prepared = await prepareImageForUpload(file);

      // HEIC→JPEG 변환 시 용량이 늘 수 있어, 변환 후 파일 기준으로도 크기를 재검증한다.
      const convertedSizeError = validateCrewImageSize(prepared.file);
      if (convertedSizeError) {
        showToast(convertedSizeError, 'error');
        return;
      }

      const presignRes = await getPresignedUrl({
        purpose: 'CREW_IMAGE',
        content_type: prepared.contentType,
        content_length: prepared.file.size,
      });

      await uploadToS3(presignRes.data.upload_url, prepared.file, prepared.contentType);

      if (imageBlobUrlRef.current) {
        URL.revokeObjectURL(imageBlobUrlRef.current);
      }
      const previewUrl = URL.createObjectURL(prepared.file);
      imageBlobUrlRef.current = previewUrl;

      setFormData((prev) => ({
        ...prev,
        imagePreview: previewUrl,
        image_s3_key: presignRes.data.s3_key,
      }));
    } catch (error) {
      showToast(
        error instanceof UnsupportedImageError ? error.message : '이미지 업로드에 실패했습니다.',
        'error',
      );
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
      const toLocalDateString = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };
      const startDate = (() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return toLocalDateString(d);
      })();
      const endDate = (() => {
        const d = new Date();
        d.setDate(d.getDate() + 1 + draft.duration_days);
        return toLocalDateString(d);
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

  const handleNextFromStep3 = async () => {
    if (isCheckingDeposit) return; // 잔액 확인 중 중복 클릭 가드
    const errors = validateStep3(formData);
    setStep3Errors(errors);
    if (Object.keys(errors).length !== 0) return;

    // 선택한 보증금만큼 도딘이 있는지 사전 확인 — 부족하면 모달을 띄우고 다음 단계로 넘어가지 않는다.
    // 같은 플로우 내 스텝 왕복 시 재조회를 피하도록 캐시 사용.
    setIsCheckingDeposit(true);
    let blocked: boolean;
    try {
      blocked = await shortage.openIfInsufficient(formData.deposit_amount, { useCache: true });
    } finally {
      setIsCheckingDeposit(false);
    }
    if (blocked) return;

    // 특정 요일이면 이미 입력/AI 프리필된 시작·종료일을 (변경됐을 수 있는) 요일 기준으로 재보정한다.
    // snap은 멱등이라 이미 인증 요일이면 그대로 유지된다.
    if (formData.frequency_type === 'SPECIFIC_DAYS') {
      setFormData((prev) => ({
        ...prev,
        start_date: snapToScheduledDay(prev.start_date, prev.mission_schedule_days, 'forward'),
        end_date: snapToScheduledDay(prev.end_date, prev.mission_schedule_days, 'backward'),
      }));
    }
    setCurrentStep(4);
  };

  const handleNextFromStep4 = () => {
    const errors = validateStep4(formData);
    setStep4Errors(errors);
    if (Object.keys(errors).length === 0) setCurrentStep(5);
  };

  // ─── 크루 생성 제출 ─────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    // 이미 제출 중이면 즉시 차단 (중복 createCrew 호출 방지)
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      const recruitmentDeadline = (() => {
        const [y, m, d] = formData.start_date.split('-').map(Number);
        const prevDay = new Date(y, m - 1, d - 1);
        prevDay.setHours(23, 59, 59, 0);
        const offset = -prevDay.getTimezoneOffset();
        const sign = offset >= 0 ? '+' : '-';
        const pad = (n: number) => String(Math.abs(n)).padStart(2, '0');
        const hours = Math.floor(Math.abs(offset) / 60);
        const minutes = Math.abs(offset) % 60;
        return `${prevDay.getFullYear()}-${pad(prevDay.getMonth() + 1)}-${pad(prevDay.getDate())}T23:59:59${sign}${pad(hours)}:${pad(minutes)}`;
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
            { key: 'crew_limit_acknowledgment', agreed: formData.agreements.crew_limit_acknowledgment },
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
      const code = isAxiosError<ErrorResponse>(err) ? err.response?.data?.code : undefined;
      if (code === 'INSUFFICIENT_BALANCE') {
        const opened = await shortage.openIfInsufficient(formData.deposit_amount);
        if (!opened) {
          showToast('크루 생성에 필요한 잔액이 부족합니다. 충전 후 다시 시도해주세요.', 'error');
        }
      } else if (code === 'INVALID_DEPOSIT_AMOUNT') {
        showToast('보증금은 1,000원 단위, 1,000~100,000원이어야 합니다.', 'error');
      } else if (code === 'HOST_CREW_LIMIT_EXCEEDED') {
        showToast('동시 운영 가능한 크루 개수(5개) 한도를 초과했습니다.', 'error');
      } else {
        showToast('크루 생성에 실패했습니다. 다시 시도해주세요.', 'error');
      }
    } finally {
      isSubmittingRef.current = false;
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
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
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
          />
        );
      default:
        return null;
    }
  };

  const renderBottomNav = () => {
    if (currentStep === 1) return null;

    const isLastStep = currentStep === 5;
    // 5단계 제출 가능 여부: 5개 운영원칙 전체 동의
    const allAgreed = Object.values(formData.agreements).every(Boolean);

    const handleNext = () => {
      if (currentStep === 2) handleNextFromStep2();
      else if (currentStep === 3) void handleNextFromStep3();
      else if (currentStep === 4) handleNextFromStep4();
    };

    return (
      <div className="sticky bottom-0 bg-background/90 backdrop-blur-md border-t border-text-secondary/8 px-5 pt-4 pb-8 flex gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setCurrentStep((s) => s - 1)}
          disabled={(isLastStep && isSubmitting) || isCheckingDeposit}
          className="w-24"
        >
          이전
        </Button>
        {isLastStep ? (
          <Button
            variant="primary-green"
            size="lg"
            fullWidth
            onClick={() => setIsConfirmOpen(true)}
            disabled={!allAgreed}
            isLoading={isSubmitting}
          >
            크루 생성하기
          </Button>
        ) : (
          <Button
            variant="primary-green"
            size="lg"
            fullWidth
            onClick={handleNext}
            isLoading={currentStep === 3 && isCheckingDeposit}
          >
            다음
          </Button>
        )}
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
        type={toastType}
      />

      <DodinShortageModal
        isOpen={shortage.isOpen}
        onClose={shortage.close}
        onCharge={shortage.goToCharge}
        requiredAmount={shortage.requiredAmount}
        currentBalance={shortage.currentBalance}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setIsConfirmOpen(false);
          void handleSubmit();
        }}
        title="크루 생성 전 확인해주세요"
        description={`크루 개설 후 수정이 불가능합니다.\n신중하게 만들어주세요.`}
        confirmText="생성하기"
        cancelText="다시 확인"
        confirmVariant="primary-green"
        isLoading={isSubmitting}
      />
    </div>
  );
}
