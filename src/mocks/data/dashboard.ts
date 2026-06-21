// 대시보드 화면에서 FE 하드코딩으로 유지하는 값/타입.
// 집계·크루 상세 데이터는 API 연동(GET /api/dashboard, GET /api/crews/{crewId}/dashboard)으로 대체됨.

// 예상 정산 안내 툴팁 카피
export type ProjectionCopy = {
  eyebrow: string;
  description: string;
  footnote: string;
};

// 도넛/링 세그먼트 (SegmentRing·LegendRow 공용 primitive)
export type ShareSegment = {
  label: string;
  value: number;
  color: string;
  isMe?: boolean;
};

export type HostPrincipleItem = {
  title: string;
  description: string;
};

// 방장 운영 원칙 (모든 크루 공통 · BE 무관 FE 하드코딩)
export type HostPrinciplesMock = {
  title: string;
  principles: HostPrincipleItem[];
  reportNotice: string;
  reportActionLabel: string;
};

export type DashboardMock = {
  projectionCopy: ProjectionCopy;
  principles: HostPrinciplesMock;
};

export const mockDashboard: DashboardMock = {
  projectionCopy: {
    eyebrow: "현재까지의 예상 결과",
    description: "지금까지 확인된 인증 결과를 바탕으로 계산했어요.",
    footnote: "최종 정산 전까지 금액과 지분율은 달라질 수 있어요.",
  },
  principles: {
    title: "방장 운영 원칙",
    principles: [
      {
        title: "정직한 인증",
        description:
          "모든 인증 사진은 실제 미션을 수행한 결과여야 하며, 조작하거나 대리 제출하지 않겠습니다.",
      },
      {
        title: "성실한 검토",
        description:
          "크루원의 인증 사진을 매일 성실하게 검토하고 공정하게 판단하겠습니다.",
      },
      {
        title: "정책 준수",
        description:
          "돈독 서비스의 운영 정책과 크루 운영 규칙을 숙지하고 이를 준수하겠습니다.",
      },
      {
        title: "공정한 운영",
        description: "특정 크루원에 대한 개인적 편향 없이 동일한 기준으로 검증하겠습니다.",
      },
      {
        title: "크루 운영 한도",
        description: "방장은 최대 5개의 크루를 동시에 운영할 수 있습니다.",
      },
    ],
    reportNotice: "부정 검증이 의심되면 운영팀에 신고할 수 있어요.",
    reportActionLabel: "부정 의심 신고",
  },
};

// 직전 배치 대비 변동액 안내 툴팁 문구.
// 전체 대시보드 '오늘 변동'(CrewDonutSection)·크루 상세 메인 카드(DailyDashboardSection) 공용.
export const DELTA_TOOLTIP_TEXT =
  "직전 정산 배치와 비교한 예상 환급금 변동이에요. 첫 정산이라 비교 대상이 없으면 0원으로 표시돼요.";
