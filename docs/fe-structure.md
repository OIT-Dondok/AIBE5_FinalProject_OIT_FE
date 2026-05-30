# Dondok FE 폴더 구조 설계 문서

> 작성자: D (김한비) | 버전: 0.2 | 날짜: 2026-05-26  
> 김세희/서일현/문창현/전성 팀원이 각자 도메인 작업 시 참고하는 기준 문서입니다.

---

## 설계 원칙

1. **레이어드 구조** — 역할별로 층을 나누고, 위 층은 아래 층을 쓸 수 있지만 아래 층은 위 층을 쓰면 안 된다.
2. **모바일 퍼스트** — 모든 컴포넌트는 375px 기준으로 먼저 만든다.
3. **Server Component 우선** — 클라이언트 번들 크기 최소화. `'use client'`는 최소 범위로.
4. **도메인 독립성** — 각 팀원의 페이지/컴포넌트가 서로 import 충돌 없이 병렬 개발 가능하도록 설계한다.

---

## 레이어 구조 한눈에 보기

```
────────────────────────────────
  pages 층     (app/)               ← 페이지 조립. URL 담당. 제일 위
────────────────────────────────
  domain 층    (components/[domain]/) ← 도메인별 기능 컴포넌트
────────────────────────────────
  common 층    (components/common/)  ← 버튼, 인풋 등 공통 UI. 제일 아래
────────────────────────────────
```

**규칙:**
- `pages` → `[domain]`, `common` 사용 가능 ✅
- `[domain]` → `common` 사용 가능 ✅
- `common` → 다른 층 사용 금지 ❌
- `components/crew` → `components/feed` 같은 **다른 도메인 직접 import 금지** ❌

---

## 전체 구조

```
dondok-fe/
├── public/
│   ├── icons/                        # PWA 아이콘 (192x192, 512x512)
│   ├── manifest.json                 # PWA 매니페스트
│   └── firebase-messaging-sw.js      # FCM 서비스 워커
│
├── src/
│   │
│   ├── app/                          # ★ pages 층 — URL · 페이지 조립
│   │   ├── layout.tsx                # Root Layout (폰트, FCM 초기화)
│   │   ├── page.tsx                  # 루트 → /crews 리다이렉트
│   │   │
│   │   ├── (auth)/                   # 인증 레이아웃 그룹 [김세희 담당]
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   │
│   │   ├── (main)/                   # 메인 레이아웃 그룹 (하단 네비)
│   │   │   └── layout.tsx            # BottomNav 포함
│   │   │
│   │   ├── crews/
│   │   │   ├── page.tsx              # 크루 탐색/목록 [김세희 담당]
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # 크루 생성 5단계 [전성 담당]
│   │   │   └── [crewId]/
│   │   │       ├── layout.tsx        # 크루 상세 탭 레이아웃
│   │   │       ├── page.tsx          # → /feed 리다이렉트
│   │   │       ├── feed/page.tsx     # 인증 피드 탭 [서일현 담당]
│   │   │       ├── dashboard/page.tsx # 현황 탭 [김세희 담당]
│   │   │       ├── participants/page.tsx # 신청자 관리 [김한비 담당]
│   │   │       └── verification/page.tsx # 검증 내역 탭 [김한비 담당]
│   │   │
│   │   ├── my/
│   │   │   ├── page.tsx              # 프로필 [문창현 담당]
│   │   │   └── dodin/page.tsx        # 도딘 잔액/내역 [전성 담당]
│   │   │
│   │   └── notifications/page.tsx    # 알림 목록 [문창현 담당]
│   │
│   ├── components/              # UI 컴포넌트 격리 영역
│   │   ├── common/              # 전역 공통 UI — 비즈니스 로직 없음 [전원 추가 가능]
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Badge.tsx        # 인증 상태 뱃지 (검토중/성공/실패)
│   │   │   ├── Avatar.tsx
│   │   │   ├── BottomSheet.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── index.ts         # 재수출
│   │   │
│   │   └── [domain]/            # 도메인별 폴더 — 각자 작업 영역
│   │       ├── auth/            # [김세희 담당]
│   │       ├── crew/            # [김세희/전성 담당]
│   │       ├── mission/         # [전성 담당]
│   │       ├── feed/            # [서일현/김세희 담당]
│   │       ├── participants/    # [김한비 담당]
│   │       ├── verification/    # [김한비 담당]
│   │       ├── dashboard/       # [김세희 담당]
│   │       ├── profile/         # [문창현 담당]
│   │       ├── dodin/           # [서일현/전성 담당]
│   │       └── navigation/      # 하단 네비, 헤더 등 뼈대
│   │
│   ├── services/                     # API 호출 함수 (도메인별)
│   │   ├── auth.ts                   # 로그인, 회원가입, 토큰 갱신
│   │   ├── crew.ts                   # 크루 CRUD, 탐색
│   │   ├── participant.ts            # 입장 신청, 승인/거절 [김한비 담당]
│   │   ├── missionLog.ts             # 인증 피드, 업로드
│   │   ├── moderation.ts             # 방장 검증, 검증 내역 [김한비 담당]
│   │   ├── settlement.ts             # 정산, 도딘
│   │   ├── notification.ts           # 알림 목록
│   │   └── upload.ts                 # S3 Presigned URL 업로드
│   │
│   ├── lib/                          # 통신 및 라이브러리 설정
│   │   ├── axios.ts                  # Axios 인스턴스 + JWT 인터셉터 [문창현 담당 → 김한비 초안]
│   │   ├── fcm.ts                    # FCM 초기화 [문창현 담당]
│   │   └── utils.ts                  # cn(), formatDate() 등 공통 유틸
│   │
│   ├── store/                        # Zustand 전역 상태
│   │   ├── authStore.ts              # 로그인 유저 정보, 토큰
│   │   ├── crewStore.ts              # 현재 크루 컨텍스트
│   │   └── notificationStore.ts      # 알림 뱃지 수
│   │
│   ├── types/                        # TypeScript 타입 정의
│   │   ├── common.ts                 # CursorPageResponse<T>, ErrorResponse, ErrorCode
│   │   └── domain.ts                 # 전체 도메인 타입 (Enum + Request/Response)
│   │
│   ├── hooks/                        # 커스텀 훅
│   │   ├── useAuth.ts
│   │   ├── useCrewDetail.ts
│   │   └── useToast.ts
│   │
│   └── constants/                    # 상수
│       ├── routes.ts
│       ├── queryKeys.ts
│       └── errorMessages.ts
│
├── .env.example
├── .env.local                        # gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── README.md
└── CLAUDE.md
```

---

## 페이지 ↔ 담당자 매핑

| 경로 | 페이지 | 담당 |
|------|--------|-----|
| `/login`, `/signup` | 인증 | 문창현 |
| `/crews` | 크루 탐색/목록 | 전성 |
| `/crews/new` | 크루 생성 (5단계 + AI 도우미) | 전성 |
| `/crews/[id]/feed` | 인증 피드 | 김세희 |
| `/crews/[id]/dashboard` | 현황 (지분율 차트) | 김세희 |
| `/crews/[id]/participants` | 신청자 관리 (방장) | 전성 |
| `/crews/[id]/verification` | 검증 내역 탭 | 김한비 |
| `/my` | 프로필 조회/수정 | 문창현 |
| `/my/dodin` | 도딘 잔액/내역 | 서일현 |
| `/notifications` | 알림 목록 + FCM 웹 푸시 UI | 김한비 |

---

## common 층 추가 기준

`components/common/`에 추가할 수 있는 컴포넌트:

- **2개 이상의 도메인**에서 재사용되는 컴포넌트
- 비즈니스 로직 없이 **순수 UI**만 담당
- props로 완전히 제어 가능 (controlled component)

도메인 전용 컴포넌트는 `components/features/{도메인}/` 하위에 둔다.

---

## 상태 관리 전략 요약

```
서버 상태 (API 데이터)   → Server Component fetch / 추후 React Query
클라이언트 전역 상태     → Zustand (authStore, crewStore, notificationStore)
컴포넌트 로컬 상태       → useState / useReducer
폼 상태                 → useState (단순) / react-hook-form (복잡한 5단계 폼)
```

---

## 환경별 API Base URL

| 환경 | URL |
|------|-----|
| 로컬 | `http://localhost:8080` |
| 스테이징 | _(추후 입력)_ |
| 프로덕션 | _(추후 입력)_ |

`NEXT_PUBLIC_API_BASE_URL` 환경 변수로 주입.
