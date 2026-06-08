'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Check, X } from 'lucide-react';
import type { AxiosError } from 'axios';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { signup } from '@/services/auth';

type TermsModalKey = 'terms' | 'privacy';

const TERMS_CONTENT: Record<TermsModalKey, { title: string; content: string }> = {
  terms: {
    title: '이용약관',
    content: `제1조 (목적)
이 약관은 돈독(이하 "회사")이 제공하는 돈독 서비스(이하 "서비스")의 이용 조건 및 절차, 회사와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (정의)
"이용자"란 이 약관에 동의하고 회사가 제공하는 서비스를 이용하는 자를 말합니다.
"계정"이란 이용자가 서비스 이용을 위해 등록한 이메일 주소와 비밀번호의 조합을 말합니다.

제3조 (약관의 효력 및 변경)
① 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.
② 회사는 합리적인 사유가 발생할 경우 약관을 변경할 수 있으며, 변경 시 7일 이전에 공지합니다.

제4조 (서비스의 제공)
① 회사는 다음과 같은 서비스를 제공합니다.
  - 습관 형성 및 관리 서비스
  - 크루(그룹) 기반 습관 공유 서비스
  - 인증 및 피드 서비스
② 회사는 서비스의 내용을 변경할 경우 이용자에게 사전 공지합니다.

제5조 (이용자의 의무)
① 이용자는 다음 행위를 해서는 안 됩니다.
  - 타인의 정보 도용
  - 허위 정보 등록
  - 서비스 운영을 방해하는 행위
  - 기타 법령에 위반되는 행위

제6조 (면책 조항)
① 회사는 천재지변, 전쟁 등 불가항력적 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다.
② 이용자의 귀책사유로 발생한 서비스 이용 장애에 대해 회사는 책임을 지지 않습니다.

제7조 (분쟁 해결)
서비스 이용과 관련한 분쟁은 대한민국 법령에 따라 해결하며, 관할 법원은 회사의 본사 소재지를 관할하는 법원으로 합니다.

부칙
이 약관은 2024년 1월 1일부터 시행합니다.`,
  },
  privacy: {
    title: '개인정보처리방침',
    content: `돈독(이하 "회사")은 이용자의 개인정보를 중요하게 여기며, 「개인정보 보호법」에 따라 아래와 같이 개인정보처리방침을 수립합니다.

1. 수집하는 개인정보 항목
[필수]
  - 이메일 주소, 비밀번호, 닉네임

[선택]
  - 마케팅 수신 동의 여부

2. 개인정보의 수집 및 이용 목적
  - 회원 가입 및 본인 확인
  - 서비스 제공 및 이용 내역 관리
  - 고객 문의 응대
  - 마케팅 및 광고 활용 (동의한 이용자에 한함)

3. 개인정보 보유 및 이용 기간
  - 회원 탈퇴 시까지 보유 후 즉시 파기합니다.
  - 단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
    · 전자상거래 계약·청약 철회 기록: 5년
    · 소비자 불만·분쟁 처리 기록: 3년

4. 개인정보의 제3자 제공
  원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 단, 이용자가 동의한 경우 또는 법령에 의한 경우 예외적으로 제공합니다.

5. 개인정보 처리 위탁
  회사는 서비스 제공을 위해 최소한의 범위에서 개인정보 처리를 외부에 위탁할 수 있습니다.
  - 클라우드 서버 운영: AWS Korea

6. 이용자의 권리
  이용자는 언제든지 자신의 개인정보를 조회·수정·삭제하거나 처리 정지를 요구할 수 있습니다.

7. 개인정보 보호 책임자
  - 이메일: privacy@dondok.com

이 방침은 2024년 1월 1일부터 시행합니다.`,
  },
};

interface TermRowProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  onView?: () => void;
}

function TermRow({ checked, onChange, label, onView }: TermRowProps) {
  return (
    <div className="flex items-center gap-2 w-full px-4 py-3.5 bg-card">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="flex items-center gap-3 flex-1 text-left min-w-0"
      >
        <div
          className={`w-5 h-5 rounded-md flex items-center justify-center border-2 flex-shrink-0 transition-colors ${
            checked ? 'bg-primary-green border-primary-green' : 'border-text-secondary/30'
          }`}
        >
          {checked && <Check size={12} strokeWidth={3} className="text-white" />}
        </div>
        <span className="text-sm text-text-primary">{label}</span>
      </button>
      {onView && (
        <button
          type="button"
          onClick={onView}
          className="text-[11px] text-text-secondary underline underline-offset-2 flex-shrink-0 hover:text-text-primary transition-colors"
        >
          보기
        </button>
      )}
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();

  // 필드 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);

  // 에러 상태
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [termsError, setTermsError] = useState('');

  // 약관
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // 모달
  const [termsModal, setTermsModal] = useState<TermsModalKey | null>(null);

  const agreeAll = agreeTerms && agreePrivacy && agreeMarketing;

  const activeTerms = termsModal !== null ? TERMS_CONTENT[termsModal] : null;

  const handleAgreeAll = () => {
    const next = !agreeAll;
    setAgreeTerms(next);
    setAgreePrivacy(next);
    setAgreeMarketing(next);
    if (next) setTermsError('');
  };

  const handleNicknameCheck = () => {
    if (!nickname || nickname.length < 2) {
      setNicknameError('닉네임은 2자 이상이어야 합니다');
      return;
    }
    setNicknameError('');
    setIsNicknameChecked(true);
  };

  const handleSubmit = async () => {
    let valid = true;

    if (!email) {
      setEmailError('이메일을 입력해주세요');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('올바른 이메일 형식을 입력해주세요');
      valid = false;
    }

    if (!password) {
      setPasswordError('비밀번호를 입력해주세요');
      valid = false;
    } else if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(password)) {
      setPasswordError('영문+숫자 8자 이상으로 입력해주세요');
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('비밀번호 확인을 입력해주세요');
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('비밀번호가 일치하지 않습니다');
      valid = false;
    }

    if (!nickname) {
      setNicknameError('닉네임을 입력해주세요');
      valid = false;
    } else if (nickname.length < 2) {
      setNicknameError('닉네임은 2자 이상이어야 합니다');
      valid = false;
    } else if (!isNicknameChecked) {
      setNicknameError('닉네임 중복 확인을 해주세요');
      valid = false;
    }

    if (!agreeTerms || !agreePrivacy) {
      setTermsError('필수 약관에 동의해주세요');
      valid = false;
    }

    if (!valid) return;

    setIsLoading(true);
    try {
      await signup(email, password, nickname);
      router.push('/login');
    } catch (err) {
      const code = (err as AxiosError<{ code: string }>)?.response?.data?.code;
      if (code === 'EMAIL_ALREADY_EXISTS') {
        setEmailError('이미 사용 중인 이메일입니다');
      } else if (code === 'NICKNAME_ALREADY_EXISTS') {
        setNicknameError('이미 사용 중인 닉네임입니다');
        setIsNicknameChecked(false);
      } else if (code === 'VALIDATION_ERROR') {
        setEmailError('입력값을 확인해주세요');
      } else {
        alert('회원가입 중 오류가 발생했습니다');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[430px] mx-auto px-5 pb-12">
      {/* 헤더 */}
      <div className="flex items-center h-14">
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="w-10 h-10 -ml-2 flex items-center justify-center text-text-primary hover:opacity-70 transition-opacity"
          aria-label="뒤로가기"
        >
          <ChevronLeft size={24} strokeWidth={2} />
        </button>
      </div>


      {/* 계정 정보 */}
      <section className="mb-7">
        <p className="text-[12px] font-bold text-text-secondary tracking-wide mb-3">계정 정보</p>
        <div className="flex flex-col gap-4">
          <Input
            label="이메일"
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
            errorMessage={emailError}
            required
            autoComplete="email"
          />
          <Input
            label="비밀번호"
            type="password"
            placeholder="영문+숫자 8자 이상"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
            errorMessage={passwordError}
            required
            autoComplete="new-password"
          />
          <Input
            label="비밀번호 확인"
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setConfirmPasswordError(''); }}
            errorMessage={confirmPasswordError}
            required
            autoComplete="new-password"
          />
        </div>
      </section>

      {/* 프로필 */}
      <section className="mb-7">
        <p className="text-[12px] font-bold text-text-secondary tracking-wide mb-3">프로필</p>
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <Input
                label="닉네임"
                type="text"
                placeholder="2자 이상 입력하세요"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setNicknameError('');
                  setIsNicknameChecked(false);
                }}
                errorMessage={nicknameError}
                required
              />
            </div>
            <button
              type="button"
              onClick={handleNicknameCheck}
              className="mt-6 h-[50px] px-3.5 rounded-xl border border-primary-green text-primary-green text-sm font-semibold whitespace-nowrap flex-shrink-0 hover:bg-primary-green hover:text-white transition-colors"
            >
              중복 확인
            </button>
          </div>
          {isNicknameChecked && (
            <div className="flex items-center gap-1.5 text-primary-green text-[13px] font-medium pl-1">
              <Check size={14} strokeWidth={2.5} />
              사용 가능한 닉네임입니다
            </div>
          )}
        </div>
      </section>

      {/* 약관 동의 */}
      <section className="mb-8">
        <p className="text-[12px] font-bold text-text-secondary tracking-wide mb-3">약관 동의</p>
        <div className="flex flex-col gap-2.5">
          {/* 전체 동의 */}
          <button
            type="button"
            onClick={handleAgreeAll}
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl bg-card border border-text-secondary/20 text-left"
          >
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center border-2 flex-shrink-0 transition-colors ${
                agreeAll ? 'bg-primary-green border-primary-green' : 'border-text-secondary/30'
              }`}
            >
              {agreeAll && <Check size={12} strokeWidth={3} className="text-white" />}
            </div>
            <span className="text-sm font-semibold text-text-primary">전체 동의</span>
          </button>

          {/* 개별 약관 */}
          <div className="rounded-xl overflow-hidden border border-text-secondary/15 divide-y divide-text-secondary/10">
            <TermRow
              checked={agreeTerms}
              onChange={(v) => { setAgreeTerms(v); setTermsError(''); }}
              label="(필수) 이용약관 동의"
              onView={() => setTermsModal('terms')}
            />
            <TermRow
              checked={agreePrivacy}
              onChange={(v) => { setAgreePrivacy(v); setTermsError(''); }}
              label="(필수) 개인정보처리방침 동의"
              onView={() => setTermsModal('privacy')}
            />
            <TermRow
              checked={agreeMarketing}
              onChange={(v) => setAgreeMarketing(v)}
              label="(선택) 마케팅 수신 동의"
            />
          </div>

          {termsError && (
            <p className="text-[11px] text-red-500 pl-1">{termsError}</p>
          )}
        </div>
      </section>

      {/* 가입하기 버튼 */}
      <Button
        type="button"
        variant="primary-green"
        size="lg"
        fullWidth
        isLoading={isLoading}
        onClick={handleSubmit}
      >
        가입하기
      </Button>

      {/* 로그인 링크 */}
      <p className="text-center text-sm text-text-secondary mt-5">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-primary-green font-semibold underline underline-offset-2">
          로그인
        </Link>
      </p>

      {/* 약관 모달 */}
      <Modal
        isOpen={termsModal !== null}
        onClose={() => setTermsModal(null)}
        ariaLabel={activeTerms?.title ?? '약관'}
      >
        {activeTerms && (
          <div className="flex flex-col max-h-[70vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-text-secondary/10 flex-shrink-0">
              <h3 className="text-sm font-bold text-text-primary">{activeTerms.title}</h3>
              <button
                type="button"
                onClick={() => setTermsModal(null)}
                className="text-text-secondary hover:text-text-primary transition-colors"
                aria-label="닫기"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-5 py-4 overflow-y-auto text-[13px] text-text-secondary leading-relaxed whitespace-pre-wrap">
              {activeTerms.content}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
