# CLAUDE.md — Dondok FE 코드 작성 가이드

> AI(Claude 등)가 이 레포에서 코드를 작성하거나 수정할 때 반드시 따라야 할 규칙 모음.  
> 사람이 읽어도 좋고, AI 컨텍스트로 넣어도 좋습니다.

---

## 프로젝트 한 줄 요약

Next.js 14 (App Router) + TypeScript + Tailwind CSS + Zustand로 구성된  
**모바일 퍼스트 습관 형성 플랫폼** 프론트엔드입니다.

---

## 핵심 규칙

### 1. 컴포넌트 작성

- **Server Component 우선**. 상태·이벤트 핸들러가 필요한 경우에만 `'use client'` 추가.
- 파일명은 `PascalCase` (컴포넌트), `camelCase` (훅·유틸·스토어).
- 컴포넌트 하나에 하나의 책임. 200줄 넘으면 분리를 검토할 것.
- props 타입은 반드시 인라인 타입 또는 별도 `interface`로 명시. `any` 금지.

```tsx
// ✅ Good
interface CrewCardProps {
  crewId: number;
  title: string;
  category: CrewCategory;
}
export default function CrewCard({ crewId, title, category }: CrewCardProps) { ... }

// ❌ Bad
export default function CrewCard(props: any) { ... }
```

### 2. API 호출

- **모든 API 호출은 `src/lib/axios.ts`의 인스턴스를 사용**한다. 직접 `fetch` 쓰지 말 것.
- API 함수는 `src/api/{도메인}.ts` 파일로 분리한다.
- 응답 타입은 `ApiResponse<T>` 제네릭으로 감싼다.

```ts
// src/api/crew.ts
import { api } from '@/lib/axios';
import type { ApiResponse, CrewDetail } from '@/types';

export const getCrewDetail = (crewId: number) =>
  api.get<ApiResponse<CrewDetail>>(`/crews/${crewId}`);
```

### 3. Zustand 스토어

- 스토어는 도메인 단위로 분리 (`authStore`, `crewStore`, `notificationStore`).
- **서버 상태 (API 응답 캐싱)는 스토어에 넣지 않는다.** 서버 상태는 React Server Component 또는 SWR/React Query로 처리.
- 스토어에 넣을 것: **UI 전역 상태** (로그인 유저 정보, 알림 뱃지 수, 모달 열림 여부 등).

```ts
// ✅ 스토어에 넣을 것
const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));

// ❌ 스토어에 넣지 말 것 (서버 상태)
const useCrewStore = create((set) => ({
  crewList: [],           // ← 이건 서버 상태, 스토어 X
  fetchCrewList: () => {} // ← API 호출도 스토어 X
}));
```

### 4. Tailwind CSS

- 모바일 퍼스트: 기본 클래스는 모바일 기준, `md:` `lg:` 순으로 확장.
- 색상·여백 등 디자인 토큰은 `tailwind.config.ts`의 `extend`에 정의해서 쓴다.
- 인라인 스타일 (`style={{...}}`) 금지. Tailwind 클래스로 해결할 것.
- 클래스가 너무 많아지면 `cn()` 유틸 (clsx + tailwind-merge) 사용.

```tsx
// ✅
<button className={cn('rounded-xl px-4 py-2 text-sm font-semibold', variant === 'primary' && 'bg-brand-500 text-white')}>

// ❌
<button style={{ borderRadius: 12, padding: '8px 16px' }}>
```

### 5. 타입

- `src/types/` 아래에 도메인별 타입 파일로 분리.
- 백엔드 API 응답 그대로 쓰지 말고, 필요하면 FE 전용 타입으로 변환해서 사용.
- `enum` 대신 `as const` + `type` 조합을 선호한다.

```ts
// ✅
export const CREW_STATUS = {
  RECRUITING: 'RECRUITING',
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED',
} as const;
export type CrewStatus = typeof CREW_STATUS[keyof typeof CREW_STATUS];

// ❌ (피하기)
enum CrewStatus { RECRUITING, ACTIVE, CLOSED }
```

### 6. 에러 처리

- API 에러는 axios 인터셉터에서 공통 처리 (401 → 토큰 갱신, 그 외 → toast).
- 컴포넌트 레벨의 에러는 `error.tsx` (App Router Error Boundary) 활용.
- `console.error` 남기지 말 것. 에러 로깅은 추후 Sentry 연동 예정.

### 7. 이미지 업로드 (S3 Presigned URL)

```
1. BE에 Presigned URL 요청 → S3 URL + key 수신
2. 해당 URL로 PUT 요청해 S3 직접 업로드
3. key 값을 BE에 전달해 mission_log 생성
```
서버를 거쳐 업로드하는 방식 쓰지 말 것.

---

## 디렉토리 네이밍 규칙

```
app/               kebab-case 폴더, page.tsx / layout.tsx / loading.tsx / error.tsx
components/        PascalCase 폴더 + 파일 (CrewCard.tsx)
hooks/             use 접두어 (useCrewDetail.ts)
lib/               camelCase (axios.ts, fcm.ts)
store/             camelCase + Store suffix (authStore.ts)
types/             camelCase (crew.ts, api.ts)
api/               camelCase (crew.ts, auth.ts)
constants/         UPPER_SNAKE_CASE 변수명 (API_ENDPOINTS.ts)
```

---

## 금지 패턴

| 패턴 | 이유 |
|------|------|
| `any` 타입 | 타입 안전성 포기 |
| `fetch()` 직접 사용 | 인터셉터 우회 |
| 서버 상태를 Zustand에 넣기 | 캐시 무효화 복잡도 증가 |
| `console.log` 커밋 | 노이즈 |
| 인라인 스타일 | Tailwind 일관성 파괴 |
| 상대 경로 `../../` 3단계 이상 | `@/` alias 사용 |

---

## 담당자 참고 (김한비)

FE 공통 구조 셋업 담당으로, 이 파일 내용이 곧 팀 FE 개발 표준입니다.  
김세희/서일현/문창현/전성 팀원이 각자 도메인 작업 시 이 가이드를 기준으로 합니다.

- **입장 신청 / 신청자 관리 UI**: `app/crews/[crewId]/participants/`
- **검증 내역 탭 UI**: `app/crews/[crewId]/verification/`
- 공통 컴포넌트 추가 시 `components/common/` 에 넣고 팀에 공유할 것.
