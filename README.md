# 🤝 Dondok (돈독)

> **함께 채우는 성실함의 가치, 지분 기반 습관 형성 플랫폼**  
> "당신의 성실함을 지분으로 증명하세요."

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-4.x-brown)](https://zustand-demo.pmnd.rs/)

---

## 서비스 소개

Dondok은 크루원이 함께 보증금을 예치하고, 미션 인증 성실도에 따라 **실시간 지분율**이 변동하며 최종 환급금이 결정되는 습관 형성 플랫폼입니다.

단순 벌금제가 아닌 **참여도 = 수익률** 구조로, 함께 완주한 크루원 모두가 이익을 나눕니다.

### 핵심 플로우

```
크루 생성 (AI 도우미) → 보증금 예치 → 입장 신청/승인
→ 매일 미션 인증 (사진 업로드) → 방장 검증
→ 일일 정산 (지분율 실시간 갱신) → 미션 종료 → 최종 환급
```

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Zustand |
| HTTP | Axios + 인터셉터 (JWT 자동 갱신) |
| Chart | Recharts / Chart.js |
| Notification | FCM (Firebase Cloud Messaging) |
| PWA | next-pwa |

---

## 폴더 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── (auth)/             # 로그인 · 회원가입
│   ├── (main)/             # 메인 (크루 목록, 탐색)
│   ├── crews/              # 크루 도메인
│   │   ├── new/            # 크루 생성 (5단계 폼)
│   │   └── [crewId]/       # 크루 상세 (피드 · 현황 · 검증내역)
│   ├── my/                 # 마이페이지 · 도딘 잔액/내역
│   └── notifications/      # 알림 목록
├── components/
│   ├── ui/                 # 공통 UI (Button, Input, Modal …)
│   └── [domain]/           # 도메인별 컴포넌트
├── lib/
│   ├── axios.ts            # Axios 인스턴스 + JWT 인터셉터
│   └── fcm.ts              # FCM 초기화
├── store/                  # Zustand 스토어
│   ├── authStore.ts
│   ├── crewStore.ts
│   └── notificationStore.ts
├── types/                  # 공통 TypeScript 타입
│   ├── api.ts              # API 공통 응답 타입
│   ├── auth.ts
│   ├── crew.ts
│   ├── mission.ts
│   └── settlement.ts
├── hooks/                  # 커스텀 훅
└── constants/              # 상수 (API 엔드포인트, 에러코드 등)
```

---

## 배포

| 환경 | URL |
|------|-----|
| Production | https://dondok-fe.vercel.app |
| Preview | PR 생성 시 Vercel 봇이 자동 댓글로 URL 생성 |

- `main` 브랜치 머지 시 Vercel 자동 배포
- PR 생성 시 Preview URL 자동 생성 → E2E 테스트는 Preview URL로 진행
- 환경변수 추가 필요 시 전성에게 전달

---

## 로컬 개발 환경

### 요구사항
- Node.js 20+
- pnpm 9+

### 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 에 NEXT_PUBLIC_API_BASE_URL 등 입력

# 개발 서버 실행
pnpm dev
```

### 환경 변수

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_VAPID_KEY=...
```

---

## Git 전략

| 브랜치 | 용도 |
|--------|------|
| `main` | 프로덕션 배포 (머지 시 Vercel 자동 배포) |
| `feat/{이슈번호}-{기능명}` | 기능 개발 |
| `hotfix` | 긴급 버그 수정 |

**작업 플로우:**
1. GitHub Issue 생성
2. 브랜치 생성 (`feat/{이슈번호}-{기능명}`)
3. 작업 후 commit / push
4. PR 생성 → Vercel Preview URL 자동 생성
5. Preview URL 직접 테스트
6. 리뷰 완료 후 Squash Merge
7. main 자동 배포

- 커밋 컨벤션: `feat` / `fix` / `refactor` / `docs` / `test` / `chore`

---

## 팀원

| 이름 | 역할 |
|------|------|
| 김세희 (A) | 회원가입/로그인 UI · 크루 탐색 · 이모지 리액션 · 대시보드 |
| 서일현 (B) | 크루 상세 (탭) · 피드 탭 · 도딘 충전 · 미션 결과 카드 |
| 문창현 (C) | JWT axios 인터셉터 · 프로필 · 방장 검증 · FCM · html2canvas |
| **김한비 (D)** | **FE 공통 구조 셋업 · 문서 · 입장신청/신청자 관리 · 검증내역** |
| 전성 (E) | Next.js 초기화 · 크루 생성 5단계 · AI 도우미 · 인증 업로드 · 도딘 잔액/내역 |

---

## 관련 문서

- [API 명세서](#) _(작성 중)_
- [ERD](./docs/erd.md)
- [기술 스택 선택 배경](./docs/tech-stack.md)
- [Swagger UI](http://localhost:8080/swagger-ui.html)
