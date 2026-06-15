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
import { getCrew } from '@/services/crew';
import { getPresignedUrl, uploadToS3 } from '@/services/upload';
import { createMissionLog } from '@/services/mission';
import { SETTLEMENT_TYPE_LABEL } from '@/constants/crew';
import type {
  CrewDetail,
  MissionLogCreateResponse,
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
const HEIC_RE = /\.(heic|heif)$/i;
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'heic', 'heif'];

// ────────────────────────────────────────────────────────────
// 유틸
// ────────────────────────────────────────────────────────────
function isHeicFile(file: File): boolean {
  return (
    file.type.toLowerCase().includes('heic') ||
    file.type.toLowerCase().includes('heif') ||
    HEIC_RE.test(file.name)
  );
}

function getContentType(file: File): string | null {
  if (isHeicFile(file)) return 'image/jpeg';
  const t = file.type.toLowerCase();
  if (t === 'image/jpeg' || t === 'image/png') return t;
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  return null;
}

function isAllowedFile(file: File): boolean {
  if (isHeicFile(file)) return true;
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

// failure_reason → WARNED 타이틀
function warnedTitle(reason: MissionLogCreateResponse['failure_reason']): string {
  if (reason === 'EXIF_TIME_INVALID') return '촬영 시각이 맞지 않아요';
  if (reason === 'DUPLICATE_IMAGE_HASH') return '이미 사용된 이미지예요';
  return '검증 결과에 이상이 있어요';
}

// API 에러코드 → 표시 메시지
const ERROR_MESSAGES: Record<string, string> = {
  ALREADY_CERTIFIED_TODAY: '오늘 이미 인증했어요',
  CERTIFICATION_IN_REVIEW: '검토 중인 인증이 있어요',
  NOT_MISSION_DAY: '오늘은 미션 없는 날이에요',
  MISSION_NOT_STARTED: '아직 미션 시작 전이에요',
  MISSION_ENDED: '미션이 종료됐어요',
  INVALID_IMAGE_KEY: '이미지 업로드에 실패했어요. 다시 시도해주세요',
  PARTICIPANT_NOT_ELIGIBLE: '인증 권한이 없어요',
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
  const [crewLoading, setCrewLoading] = useState(true);
  const [crewError, setCrewError] = useState(false);

  const [step, setStep] = useState<CertifyStep>('UPLOAD');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');

  // VERIFYING 단계 애니메이션 (0~3)
  const [animStep, setAnimStep] = useState(0);

  const [certResult, setCertResult] = useState<MissionLogCreateResponse | null>(null);

  // 마감 시간 표시 tick
  const [, setTick] = useState(0);

  const [toast, setToast] = useState('');
  const [isToastOpen, setIsToastOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── 크루 정보 조회 ──────────────────────────────────────────
  useEffect(() => {
    if (!crewId) return;
    setCrewLoading(true);
    getCrew(crewId)
      .then(({ data }) => setCrew(data))
      .catch(() => setCrewError(true))
      .finally(() => setCrewLoading(false));
  }, [crewId]);

  // ── 마감 남은 시간 tick (1분마다 갱신) ───────────────────────
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  // ── VERIFYING 단계 애니메이션 ────────────────────────────────
  useEffect(() => {
    if (step !== 'VERIFYING') {
      setAnimStep(0);
      return;
    }
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
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // ── 파일 선택 핸들러 ──────────────────────────────────────────
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > MAX_SIZE) {
      setToast('10MB 이하 이미지를 선택해주세요');
      setIsToastOpen(true);
      return;
    }
    if (!isAllowedFile(selected)) {
      setToast('JPG, PNG, HEIC 파일만 업로드 가능해요');
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

    const contentType = getContentType(file);
    if (!contentType) {
      setToast('JPG, PNG, HEIC 파일만 업로드 가능해요');
      setIsToastOpen(true);
      return;
    }

    setStep('VERIFYING');

    try {
      // 1. Presigned URL 요청
      const { data: presigned } = await getPresignedUrl({
        purpose: 'MISSION_IMAGE',
        crew_id: crew.crew_id,
        crew_participant_id: my_participation.crew_participant_id,
        content_type: contentType,
        content_length: file.size,
      });

      // 2. S3 직접 업로드 (원본 그대로, EXIF 보존)
      await uploadToS3(presigned.upload_url, file, contentType);

      // 3. 미션 로그 생성
      const { data: log } = await createMissionLog({
        crew_id: crew.crew_id,
        image_s3_key: presigned.s3_key,
        caption,
      });

      setCertResult(log);

      // failure_reason 없으면 SUCCESS, 있으면 WARNED
      if (log.failure_reason === null) {
        setStep('SUCCESS');
      } else {
        setStep('WARNED');
      }
    } catch (err) {
      const code = isAxiosError<ErrorResponse>(err) ? err.response?.data?.code : undefined;
      const msg = (code && ERROR_MESSAGES[code]) ?? '업로드 중 오류가 발생했어요. 다시 시도해주세요';
      setToast(msg);
      setIsToastOpen(true);
      setStep('UPLOAD');
    }
  }, [file, crew, caption]);

  // ── 다시 업로드 ───────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setStep('UPLOAD');
    setFile(null);
    setCaption('');
    setCertResult(null);
  }, []);

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
  const isPastDeadline = deadline.getTime() <= Date.now();
  const timeLeft = formatTimeLeft(deadline);
  const typeLabel = SETTLEMENT_TYPE_LABEL[crew.daily_settlement_type];

  // ────────────────────────────────────────────────────────────
  // 렌더: 본문
  // ────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen flex flex-col items-center bg-transparent">
      <div className="w-full max-w-[430px] flex flex-col pb-10">
        <Header title="오늘의 인증" showBackButton />

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
                accept=".jpg,.jpeg,.png,.heic,.heif"
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
                  <img
                    src={preview}
                    alt="미리보기"
                    className="w-full h-full object-cover rounded-[calc(var(--radius-card)-2px)]"
                  />
                ) : (
                  <>
                    <ImagePlus size={36} className="text-text-secondary/50" />
                    <p className="text-sm font-medium text-text-secondary">사진을 선택해주세요</p>
                    <p className="text-xs text-text-secondary/60">JPG · PNG · HEIC · 최대 10MB</p>
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
                <label className="text-sm font-semibold text-text-primary">
                  한 줄 소감 <span className="text-red-500">*</span>
                </label>
                <textarea
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

              {/* 마감 안내 */}
              {isPastDeadline && (
                <p className="text-center text-sm text-red-500 font-medium">
                  오늘 인증 마감됐어요
                </p>
              )}

              <Button
                variant="primary-green"
                size="lg"
                fullWidth
                disabled={
                  !file ||
                  caption.length < CAPTION_MIN ||
                  caption.length > CAPTION_MAX ||
                  isPastDeadline
                }
                onClick={handleUpload}
              >
                {isPastDeadline ? '인증 마감됨' : '업로드하기'}
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
                  <span className="text-sm text-text-secondary">촬영 시각</span>
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

              <Button variant="primary-green" size="lg" fullWidth onClick={() => router.push('/feed')}>
                피드로 이동
              </Button>
            </div>
          )}

          {/* ════════════════════════════════════════
              WARNED 단계
              failure_reason 있음 → 방장이 최종 결정
          ════════════════════════════════════════ */}
          {step === 'WARNED' && certResult && (
            <div className="flex flex-col items-center gap-6 py-8">
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle size={44} className="text-amber-500" strokeWidth={2} />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-text-primary">
                  {warnedTitle(certResult.failure_reason)}
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  방장이 검토 후 최종 결정합니다
                </p>
              </div>

              <div className="w-full rounded-card bg-card border border-text-secondary/10 divide-y divide-text-secondary/10">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-text-secondary">촬영 시각</span>
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

              <div className="w-full flex flex-col gap-2">
                <Button variant="primary-green" size="lg" fullWidth onClick={() => router.push('/feed')}>
                  피드로 이동
                </Button>
                <Button variant="outline" size="lg" fullWidth onClick={handleReset}>
                  다시 업로드
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Toast message={toast} isOpen={isToastOpen} onClose={() => setIsToastOpen(false)} />
    </main>
  );
}
