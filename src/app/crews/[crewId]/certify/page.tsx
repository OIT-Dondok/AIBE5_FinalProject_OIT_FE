'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import {
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ImagePlus,
  Clock,
} from 'lucide-react';

import { Header } from '@/components/common/Header';
import { Button } from '@/components/common/Button';
import { Toast } from '@/components/common/Toast';
import { Modal } from '@/components/common/Modal';
import { getCrew } from '@/services/crew';
import { getPresignedUrl, uploadToS3 } from '@/services/upload';
import { createMissionLog } from '@/services/mission';
import { prepareImageForUpload, UnsupportedImageError } from '@/lib/prepareImageForUpload';
import { SETTLEMENT_TYPE_LABEL } from '@/constants/crew';
import type {
  CrewDetail,
  MissionLogCreateResponse,
  MissionLogExifRisk,
  CertifyStep,
  DailySettlementType,
} from '@/types/domain';
import type { ErrorResponse } from '@/types/common';

// ────────────────────────────────────────────────────────────
// 상수
// ────────────────────────────────────────────────────────────
const MAX_SIZE = 10 * 1024 * 1024;
const CAPTION_MIN = 5;
const CAPTION_MAX = 100;
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'heic', 'heif'];

// ────────────────────────────────────────────────────────────
// 유틸
// ────────────────────────────────────────────────────────────
function getContentType(file: File): string | null {
  const t = file.type.toLowerCase();
  if (t === 'image/jpeg' || t === 'image/png' || t === 'image/gif' || t === 'image/bmp' || t === 'image/webp') return t;
  if (t.includes('heic') || t.includes('heif')) return 'image/jpeg';
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'bmp') return 'image/bmp';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'heic' || ext === 'heif') return 'image/jpeg';
  return null;
}

function isAllowedFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return ALLOWED_EXTENSIONS.includes(ext) && getContentType(file) !== null;
}

// 마감 시각 계산 (KST 기준)
function getDeadline(type: DailySettlementType): Date {
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  const nowKst = new Date(Date.now() + kstOffsetMs);
  const y = nowKst.getUTCFullYear();
  const mo = nowKst.getUTCMonth();
  const d = nowKst.getUTCDate();
  const map: Record<DailySettlementType, [number, number, number]> = {
    A: [9, 0, 0],
    B: [21, 0, 0],
    C: [23, 59, 59],
  };
  const [h, m, s] = map[type];
  return new Date(Date.UTC(y, mo, d, h - 9, m, s));
}

function formatTimeLeft(deadline: Date): string {
  const ms = deadline.getTime() - Date.now();
  if (ms <= 0) return '마감됨';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const min = Math.floor((totalSec % 3600) / 60);
  if (h > 0) return `${h}시간 ${min}분 남음`;
  if (min > 0) return `${min}분 남음`;
  return '곧 마감';
}

function formatKstTime(isoStr: string): string {
  try {
    return new Date(isoStr).toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoStr;
  }
}

// exif_risk + duplicate → WARNED 타이틀 + 설명
interface WarnedInfo {
  title: string;
  description: string;
}

function getWarnedInfo(exifRisk: MissionLogExifRisk, duplicate: boolean): WarnedInfo {
  if (duplicate) {
    return {
      title: '이미 사용된 사진이에요',
      description: '동일한 사진이 이미 인증에 사용됐어요. 방장이 검토 후 최종 결정합니다.',
    };
  }
  if (exifRisk === 'TIME_INVALID') {
    return {
      title: '사진 촬영 시각이 오늘과 맞지 않아요',
      description:
        '사진 안에 기록된 촬영 시간이 오늘 날짜와 다릅니다. 방장이 검토 후 최종 결정합니다.',
    };
  }
  if (exifRisk === 'MISSING') {
    return {
      title: '사진 정보를 읽을 수 없어요',
      description: '촬영 시각 정보가 없는 사진이에요. 방장이 검토 후 최종 결정합니다.',
    };
  }
  return {
    title: '검증 결과에 이상이 있어요',
    description: '방장이 검토 후 최종 결정합니다.',
  };
}

// API 에러코드 → 표시 메시지
const ERROR_MESSAGES: Record<string, string> = {
  ALREADY_CERTIFIED_TODAY: '오늘 이미 인증했어요',
  CERTIFICATION_IN_REVIEW: '검토 중인 인증이 있어요',
  NOT_MISSION_DAY: '오늘은 미션 없는 날이에요',
  MISSION_NOT_STARTED: '아직 미션 시작 전이에요',
  MISSION_ENDED: '미션이 종료됐어요',
  INVALID_IMAGE_KEY: '이미지 업로드에 실패했어요. 다시 시도해주세요.',
  PARTICIPANT_NOT_ELIGIBLE: '인증 권한이 없어요',
  IMAGE_DIMENSIONS_TOO_LARGE: '이미지 해상도가 너무 커요. 다른 이미지를 선택해주세요.',
  IMAGE_DECODE_FAILED: '이미지를 읽을 수 없어요. 다른 이미지를 선택해주세요.',
  UNSUPPORTED_IMAGE_TYPE: '지원하지 않는 이미지 형식이에요.',
  IMAGE_TOO_LARGE: '10MB 이하 이미지를 선택해주세요.',
  EMPTY_IMAGE: '이미지 파일이 비어있어요. 다른 이미지를 선택해주세요.',
};

// ────────────────────────────────────────────────────────────
// VERIFYING 단계 표시 컴포넌트
// ────────────────────────────────────────────────────────────
type StepStatus = 'done' | 'loading' | 'waiting';

function VerifyStep({ label, status }: { label: string; status: StepStatus }) {
  return (
    <div className="flex items-center gap-3">
      {status === 'done' && <CheckCircle2 size={20} className="text-primary-green shrink-0" />}
      {status === 'loading' && (
        <Loader2 size={20} className="animate-spin text-primary-blue shrink-0" />
      )}
      {status === 'waiting' && (
        <span className="w-5 h-5 rounded-full border-2 border-text-secondary/30 shrink-0" />
      )}
      <span
        className={`text-sm ${status === 'done' ? 'text-text-primary font-medium' : 'text-text-secondary'}`}
      >
        {label}
      </span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 페이지
// ────────────────────────────────────────────────────────────
export default function CertifyPage() {
  const params = useParams();
  const router = useRouter();
  const crewId = Number(params.crewId);

  const [crew, setCrew] = useState<CrewDetail | null>(null);
  const [crewLoading, setCrewLoading] = useState(!!crewId && Number.isFinite(crewId));
  const [crewError, setCrewError] = useState(!crewId || !Number.isFinite(crewId));

  const [step, setStep] = useState<CertifyStep>('UPLOAD');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');

  // VERIFYING 단계 애니메이션 (0~3)
  const [animStep, setAnimStep] = useState(0);

  const [certResult, setCertResult] = useState<MissionLogCreateResponse | null>(null);

  const [isPastDeadline, setIsPastDeadline] = useState(false);
  const [, setTick] = useState(0);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [isToastOpen, setIsToastOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── VERIFYING 중 새로고침/탭 닫기 + 뒤로가기 차단 ──────────
  useEffect(() => {
    if (step !== 'VERIFYING') return;
    const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.history.pushState(null, '', window.location.href);
    const popStateHandler = () => {
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('beforeunload', beforeUnloadHandler);
    window.addEventListener('popstate', popStateHandler);
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
      window.removeEventListener('popstate', popStateHandler);
    };
  }, [step]);

  // ── SUCCESS/WARNED 후 뒤로가기 → 피드로 리다이렉트 ──────────
  useEffect(() => {
    if (step !== 'SUCCESS' && step !== 'WARNED') return;
    window.history.pushState(null, '', window.location.href);
    const handler = () => router.replace('/feed');
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [step, router]);

  // ── 크루 정보 조회 ──────────────────────────────────────────
  useEffect(() => {
    if (!crewId || !Number.isFinite(crewId)) return;
    getCrew(crewId)
      .then(({ data }) => {
        setCrew(data);
        setIsPastDeadline(getDeadline(data.daily_settlement_type).getTime() <= Date.now());
      })
      .catch(() => setCrewError(true))
      .finally(() => setCrewLoading(false));
  }, [crewId]);

  // ── 마감 남은 시간 (1분마다 갱신) ────────────────────────────
  useEffect(() => {
    if (!crew) return;
    const id = setInterval(() => {
      setIsPastDeadline(getDeadline(crew.daily_settlement_type).getTime() <= Date.now());
      setTick(t => t + 1);
    }, 60_000);
    return () => clearInterval(id);
  }, [crew]);

  // ── VERIFYING 단계 애니메이션 ────────────────────────────────
  useEffect(() => {
    if (step !== 'VERIFYING') return;
    const t1 = setTimeout(() => setAnimStep(1), 600);
    const t2 = setTimeout(() => setAnimStep(2), 1200);
    const t3 = setTimeout(() => setAnimStep(3), 1900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [step]);

  // ── 파일 미리보기 URL 관리 ────────────────────────────────────
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    void Promise.resolve().then(() => setPreview(url));
    return () => {
      URL.revokeObjectURL(url);
      setPreview(null);
    };
  }, [file]);

  // ── 파일 선택 핸들러 ──────────────────────────────────────────
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > MAX_SIZE) {
      setFile(null);
      setToast('10MB 이하 이미지를 선택해주세요');
      setIsToastOpen(true);
      return;
    }
    if (!isAllowedFile(selected)) {
      setFile(null);
      setToast('JPG, PNG, GIF, BMP, WEBP, HEIC 파일만 업로드 가능해요');
      setIsToastOpen(true);
      return;
    }
    setFile(selected);
    e.target.value = '';
  }, []);

  // ── 업로드 실행 ───────────────────────────────────────────────
  const handleUpload = useCallback(async () => {
    if (!file || !crew) return;
    const { my_participation } = crew;
    if (!my_participation || my_participation.status !== 'LOCKED') return;

    if (getDeadline(crew.daily_settlement_type).getTime() <= Date.now()) {
      setToast('인증 마감 시간이 지났어요');
      setIsToastOpen(true);
      return;
    }

    setAnimStep(0);
    setStep('VERIFYING');

    let phase: 'convert' | 'presign' | 's3' | 'log' = 'convert';
    try {
      // 1. HEIC→JPEG 변환(필요시), content type 결정
      const { file: uploadFile, contentType } = await prepareImageForUpload(file);

      // 2. Presigned URL 요청
      phase = 'presign';
      const { data: presigned } = await getPresignedUrl({
        purpose: 'MISSION_IMAGE',
        crew_id: crew.crew_id,
        crew_participant_id: my_participation.crew_participant_id,
        content_type: contentType,
        content_length: uploadFile.size,
      });

      // 3. S3 직접 업로드
      phase = 's3';
      await uploadToS3(presigned.upload_url, uploadFile, contentType);

      // 4. 미션 로그 생성
      phase = 'log';
      const { data: log } = await createMissionLog({
        crew_id: crew.crew_id,
        image_s3_key: presigned.s3_key,
        caption,
      });

      setCertResult(log);

      // exif_risk === NORMAL && duplicate === false → SUCCESS, 그 외 → WARNED
      if (log.exif_risk === 'NORMAL' && !log.duplicate) {
        setStep('SUCCESS');
      } else {
        setStep('WARNED');
      }
    } catch (err) {
      let msg: string;
      if (err instanceof UnsupportedImageError) {
        msg = 'JPG, PNG, GIF, BMP, WEBP, HEIC 파일만 업로드 가능해요';
      } else if (phase === 'convert') {
        msg = '이미지 변환에 실패했어요. 다른 이미지를 선택해주세요.';
      } else if (phase === 's3') {
        msg = '이미지 업로드에 실패했어요. 다시 시도해주세요.';
      } else if (isAxiosError<ErrorResponse>(err)) {
        if (!err.response) {
          msg = '네트워크 오류가 발생했어요. 다시 시도해주세요.';
        } else {
          const code = err.response.data?.code;
          msg = (code && ERROR_MESSAGES[code]) ?? '업로드 중 오류가 발생했어요. 다시 시도해주세요.';
        }
      } else {
        msg = '네트워크 오류가 발생했어요. 다시 시도해주세요.';
      }
      setToast(msg);
      setIsToastOpen(true);
      setStep('UPLOAD');
    }
  }, [file, crew, caption]);

  // ────────────────────────────────────────────────────────────
  // 렌더: 로딩 / 에러
  // ────────────────────────────────────────────────────────────
  if (crewLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center bg-transparent">
        <div className="w-full max-w-[430px] flex flex-col">
          <Header title="오늘의 인증" showBackButton />
          <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary-green" />
          </div>
        </div>
      </main>
    );
  }

  if (crewError || !crew) {
    return (
      <main className="min-h-screen flex flex-col items-center bg-transparent">
        <div className="w-full max-w-[430px] flex flex-col">
          <Header title="오늘의 인증" showBackButton />
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 px-6 text-center">
            <AlertTriangle size={40} className="text-amber-500" />
            <p className="text-base font-bold text-text-primary">크루 정보를 불러오지 못했어요</p>
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              돌아가기
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const participation = crew.my_participation;
  if (!participation || participation.status !== 'LOCKED') {
    return (
      <main className="min-h-screen flex flex-col items-center bg-transparent">
        <div className="w-full max-w-[430px] flex flex-col">
          <Header title="오늘의 인증" showBackButton />
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 px-6 text-center">
            <AlertTriangle size={40} className="text-amber-500" />
            <p className="text-base font-bold text-text-primary">인증 권한이 없어요</p>
            <p className="text-sm text-text-secondary">크루에 승인된 멤버만 인증할 수 있어요</p>
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              돌아가기
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const deadline = getDeadline(crew.daily_settlement_type);
  const timeLeft = formatTimeLeft(deadline);
  const typeLabel = SETTLEMENT_TYPE_LABEL[crew.daily_settlement_type];

  // ── 마감됨 전용 화면 (UPLOAD 단계에서만) ─────────────────────
  if (isPastDeadline && step === 'UPLOAD') {
    const deadlineTimeStr = deadline.toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      hour: '2-digit',
      minute: '2-digit',
    });
    return (
      <main className="min-h-screen flex flex-col items-center bg-transparent">
        <div className="w-full max-w-[430px] flex flex-col">
          <Header title="오늘의 인증" showBackButton />
          <div className="flex flex-col items-center justify-center py-20 gap-5 px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
              <Clock size={44} className="text-red-400" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary">오늘 인증이 마감됐어요</p>
              <p className="text-sm text-text-secondary mt-1">
                {typeLabel} · {deadlineTimeStr} 마감
              </p>
            </div>
            <Button variant="primary-green" size="lg" fullWidth onClick={() => router.replace('/feed')}>
              피드로 이동
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // ────────────────────────────────────────────────────────────
  // 렌더: 본문
  // ────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen flex flex-col items-center bg-transparent">
      <div className="w-full max-w-[430px] flex flex-col pb-10">
        <Header title="오늘의 인증" showBackButton={step !== 'VERIFYING'} />

        <div className="px-5 pt-4 flex flex-col gap-5">
          {/* ── 마감 시간 배지 ── */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-text-secondary/10">
            <Clock size={16} className={isPastDeadline ? 'text-red-500' : 'text-primary-green'} />
            <span className="text-xs text-text-secondary">{typeLabel} · 마감 </span>
            <span
              className={`text-xs font-bold ${isPastDeadline ? 'text-red-500' : 'text-primary-green'}`}
            >
              {timeLeft}
            </span>
          </div>

          {/* ════════════════════════════════════════
              UPLOAD 단계
          ════════════════════════════════════════ */}
          {step === 'UPLOAD' && (
            <div className="flex flex-col gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/bmp,image/webp,image/heic,image/heif"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* 이미지 선택 영역 */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[4/3] rounded-card border-2 border-dashed border-text-secondary/25 bg-background/60 flex flex-col items-center justify-center gap-2 hover:border-primary-green/50 hover:bg-success-green/10 transition-all active:scale-[0.99]"
              >
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element -- blob preview URL은 next/image 최적화 불필요
                  <img
                    src={preview}
                    alt="미리보기"
                    className="w-full h-full object-cover rounded-[calc(var(--radius-card)-2px)]"
                  />
                ) : (
                  <>
                    <ImagePlus size={36} className="text-text-secondary/50" />
                    <p className="text-sm font-medium text-text-secondary">사진을 선택해주세요</p>
                    <p className="text-xs text-text-secondary/60">JPG · PNG · GIF · BMP · WEBP · HEIC · 최대 10MB</p>
                  </>
                )}
              </button>

              {preview && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-primary-blue underline-offset-2 hover:underline self-center"
                >
                  사진 다시 선택
                </button>
              )}

              {/* 캡션 입력 */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="caption" className="text-sm font-semibold text-text-primary">
                  한 줄 소감 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value.slice(0, CAPTION_MAX))}
                  placeholder="오늘 미션을 어떻게 수행했는지 알려주세요 (5~100자)"
                  rows={3}
                  className="w-full resize-none rounded-button border border-text-secondary/20 bg-card px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary-green transition-colors"
                />
                <div className="flex justify-between">
                  {caption.length > 0 && caption.length < CAPTION_MIN && (
                    <span className="text-xs text-red-500">최소 5자 이상 입력해주세요</span>
                  )}
                  <span className="text-xs text-text-secondary/60 ml-auto">
                    {caption.length}/{CAPTION_MAX}
                  </span>
                </div>
              </div>

              {/* 업로드 가이드 */}
              <div className="rounded-card bg-success-green/20 px-4 py-3 flex flex-col gap-1.5">
                <p className="text-xs font-semibold text-primary-green">업로드 가이드</p>
                {[
                  '한 장의 사진만 업로드해요',
                  '한 줄 소감을 함께 적어주세요',
                  'Exif/OCR 자동 검증 후 방장이 확인해요',
                ].map((txt) => (
                  <p key={txt} className="text-xs text-text-secondary flex items-start gap-1.5">
                    <span className="shrink-0 mt-px">•</span>
                    {txt}
                  </p>
                ))}
              </div>

              <Button
                variant="primary-green"
                size="lg"
                fullWidth
                disabled={!file || caption.length < CAPTION_MIN || caption.length > CAPTION_MAX}
                onClick={() => setIsConfirmOpen(true)}
              >
                업로드하기
              </Button>
            </div>
          )}

          {/* ════════════════════════════════════════
              VERIFYING 단계
          ════════════════════════════════════════ */}
          {step === 'VERIFYING' && (
            <div className="flex flex-col items-center gap-8 py-10">
              <div className="w-20 h-20 rounded-full bg-primary-blue/10 flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-primary-blue" />
              </div>
              <div className="w-full flex flex-col gap-4 px-2">
                <VerifyStep label="파일 업로드" status={animStep >= 1 ? 'done' : 'loading'} />
                <VerifyStep
                  label="Exif 추출"
                  status={animStep >= 2 ? 'done' : animStep >= 1 ? 'loading' : 'waiting'}
                />
                <VerifyStep
                  label="시각 검증"
                  status={animStep >= 3 ? 'loading' : 'waiting'}
                />
                <VerifyStep label="중복 검사" status="waiting" />
              </div>
              <p className="text-xs text-text-secondary/70 text-center">잠시만 기다려주세요</p>
            </div>
          )}

          {/* ════════════════════════════════════════
              SUCCESS 단계
          ════════════════════════════════════════ */}
          {step === 'SUCCESS' && certResult && (
            <div className="flex flex-col items-center gap-6 py-8">
              <div className="w-20 h-20 rounded-full bg-success-green flex items-center justify-center">
                <CheckCircle2 size={44} className="text-primary-green" strokeWidth={2} />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-text-primary">촬영 시각이 확인됐어요</p>
                <p className="text-sm text-text-secondary mt-1">
                  방장 최종 검증 후 인증이 확정됩니다
                </p>
              </div>

              <div className="w-full rounded-card bg-card border border-text-secondary/10 divide-y divide-text-secondary/10">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-text-secondary">업로드 시각</span>
                  <span className="text-sm font-medium text-text-primary">
                    {formatKstTime(certResult.server_time)}
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-text-secondary">Exif 상태</span>
                  <span className="text-sm font-medium text-primary-green">정상</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-text-secondary">인증 상태</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-blue/10 text-primary-blue">
                    검토중
                  </span>
                </div>
              </div>

              <Button variant="primary-green" size="lg" fullWidth onClick={() => router.replace('/feed')}>
                피드로 이동
              </Button>
            </div>
          )}

          {/* ════════════════════════════════════════
              WARNED 단계
              exif_risk/duplicate 이상 → 방장이 최종 결정
          ════════════════════════════════════════ */}
          {step === 'WARNED' && certResult && (
            <div className="flex flex-col items-center gap-6 py-8">
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle size={44} className="text-amber-500" strokeWidth={2} />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-text-primary">
                  {getWarnedInfo(certResult.exif_risk, certResult.duplicate).title}
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  {getWarnedInfo(certResult.exif_risk, certResult.duplicate).description}
                </p>
              </div>

              <div className="w-full rounded-card bg-card border border-text-secondary/10 divide-y divide-text-secondary/10">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-text-secondary">업로드 시각</span>
                  <span className="text-sm font-medium text-text-primary">
                    {formatKstTime(certResult.server_time)}
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-text-secondary">인증 상태</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-600">
                    검토중
                  </span>
                </div>
              </div>

              <Button variant="primary-green" size="lg" fullWidth onClick={() => router.replace('/feed')}>
                피드로 이동
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 업로드 확인 모달 */}
      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} ariaLabel="인증 제출 확인">
        <div className="p-5 flex flex-col gap-4">
          <p className="text-base font-bold text-text-primary text-center">인증 제출 확인</p>
          <p className="text-sm text-text-secondary text-center leading-relaxed">
            인증 사진은 제출 후 수정 또는 삭제가 불가능해요.
            <br />제출하시겠어요?
          </p>
          <div className="flex gap-3">
            <Button variant="outline" size="lg" fullWidth onClick={() => setIsConfirmOpen(false)}>
              취소
            </Button>
            <Button
              variant="primary-green"
              size="lg"
              fullWidth
              onClick={() => { setIsConfirmOpen(false); handleUpload(); }}
            >
              확인
            </Button>
          </div>
        </div>
      </Modal>

      <Toast message={toast} isOpen={isToastOpen} onClose={() => setIsToastOpen(false)} />
    </main>
  );
}
