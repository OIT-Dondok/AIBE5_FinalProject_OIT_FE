export type DashboardSectionId =
  | "daily"
  | "principles"
  | "donuts"
  | "shareChanges";

export type DashboardSectionMeta = {
  id: DashboardSectionId;
  label: string;
  shortLabel: string;
  description: string;
};

export type ProjectionCopy = {
  eyebrow: string;
  description: string;
  footnote: string;
};

export type ShareSegment = {
  label: string;
  value: number;
  color: string;
  isMe?: boolean;
};

export type DashboardMetric = {
  label: string;
  value: string;
  detail: string;
  trend: "up" | "down" | "flat";
};

export type NextSettlementMock = {
  label: string;
  timeLabel: string;
  progressPercent: number;
};

export type DailyDashboardMock = {
  crewName: string;
  dayLabel: string;
  myShareLabel: string;
  mySharePercent: string;
  shareSegments: ShareSegment[];
  metrics: DashboardMetric[];
  nextSettlement: NextSettlementMock;
};

export type HostPrincipleItem = {
  title: string;
  description: string;
};

export type HostPrinciplesMock = {
  title: string;
  principles: HostPrincipleItem[];
  reportNotice: string;
  reportActionLabel: string;
};

export type CrewDonutRow = {
  category: "기상" | "운동" | "독서" | "식단";
  title: string;
  percent: number;
  amount: string;
  delta: string;
  trend: "up" | "down";
  color: string;
  tone: string;
};

export type CrewDonutMock = {
  dateLabel: string;
  participantLabel: string;
  totalLabel: string;
  totalAmount: string;
  todayDelta: string;
  todayDeltaPercent: string;
  trendSummaryLabel: string;
  topMoverLabel: string;
  topMoverDelta: string;
  segments: ShareSegment[];
  crews: CrewDonutRow[];
};

export type ShareChangeState = {
  label: string;
  sharePercent: string;
  refundAmount: string;
  delta?: string;
  tone: "previous" | "current";
};

export type ShareChangeMock = {
  title: string;
  summary: string;
  before: ShareChangeState;
  after: ShareChangeState;
  formula: string;
};

export type DashboardMock = {
  sections: DashboardSectionMeta[];
  projectionCopy: ProjectionCopy;
  daily: DailyDashboardMock;
  principles: HostPrinciplesMock;
  crewDonuts: CrewDonutMock;
  shareChanges: ShareChangeMock;
};

export const dashboardSections: DashboardSectionMeta[] = [
  {
    id: "daily",
    label: "일일 대시보드",
    shortLabel: "일일",
    description: "오늘 기준 크루 수행 현황",
  },
  {
    id: "principles",
    label: "운영원칙",
    shortLabel: "원칙",
    description: "방장이 공개한 검증 약속",
  },
  {
    id: "donuts",
    label: "크루별 도넛",
    shortLabel: "도넛",
    description: "참여 중인 크루별 예상 흐름",
  },
  {
    id: "shareChanges",
    label: "지분율 변동",
    shortLabel: "변동",
    description: "현재 인증 결과 반영 전후 비교",
  },
];

export const mockDashboard: DashboardMock = {
  sections: dashboardSections,
  projectionCopy: {
    eyebrow: "현재까지의 예상 결과",
    description: "지금까지 확인된 인증 결과를 바탕으로 계산했어요.",
    footnote: "최종 정산 전까지 금액과 지분율은 달라질 수 있어요.",
  },
  daily: {
    crewName: "아침 갓생 30일",
    dayLabel: "day 14 / 30",
    myShareLabel: "나의 지분율",
    mySharePercent: "23.5%",
    shareSegments: [
      { label: "나", value: 23.5, color: "#5E9B73", isMe: true },
      { label: "B", value: 22.1, color: "#7AA8DB" },
      { label: "E", value: 18.1, color: "#A38DB9" },
      { label: "C", value: 19.8, color: "#E59A6F" },
      { label: "D", value: 16.5, color: "#B8AE99" },
    ],
    metrics: [
      {
        label: "예상 환급금",
        value: "22,400원",
        detail: "+1,200원",
        trend: "up",
      },
      {
        label: "현재 순위",
        value: "2위 / 5명",
        detail: "1단계 상승",
        trend: "up",
      },
    ],
    nextSettlement: {
      label: "다음 정산",
      timeLabel: "오전 12시 · 10시간 뒤",
      progressPercent: 60,
    },
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
  crewDonuts: {
    dateLabel: "26년 5월 21일",
    participantLabel: "참여 크루 4",
    totalLabel: "예상 합계",
    totalAmount: "57,260원",
    todayDelta: "+960원",
    todayDeltaPercent: "+1.7%",
    trendSummaryLabel: "상승 3 · 하락 1",
    topMoverLabel: "최대 변동 아침 6시 기상",
    topMoverDelta: "+1,200원",
    segments: [
      { label: "아침 6시 기상", value: 41, color: "#D9A93D" },
      { label: "홈트 30분", value: 25, color: "#7FB271" },
      { label: "독서 1챕터", value: 20, color: "#9F95D4" },
      { label: "식단 기록", value: 14, color: "#E59A6F" },
    ],
    crews: [
      {
        category: "기상",
        title: "아침 6시 기상",
        percent: 41,
        amount: "23,500원",
        delta: "+1,200",
        trend: "up",
        color: "#FFE9C7",
        tone: "#8A5E1E",
      },
      {
        category: "운동",
        title: "홈트 30분",
        percent: 25,
        amount: "14,160원",
        delta: "-840",
        trend: "down",
        color: "#E0EEDC",
        tone: "#2F5A2A",
      },
      {
        category: "독서",
        title: "독서 1챕터",
        percent: 20,
        amount: "11,200원",
        delta: "+200",
        trend: "up",
        color: "#E4E0F4",
        tone: "#3B3470",
      },
      {
        category: "식단",
        title: "식단 기록",
        percent: 14,
        amount: "8,400원",
        delta: "+400",
        trend: "up",
        color: "#FBE3D4",
        tone: "#7E3F1E",
      },
    ],
  },
  shareChanges: {
    title: "현재 인증 결과 반영",
    summary: "확인된 인증 상태가 예상 지분율에 반영되었어요.",
    before: {
      label: "이전 지분율",
      sharePercent: "20.0%",
      refundAmount: "20,000원",
      tone: "previous",
    },
    after: {
      label: "예상 지분율",
      sharePercent: "22.0%",
      refundAmount: "22,000원",
      delta: "+2,000",
      tone: "current",
    },
    formula: "지분율 = 나의 성공 ÷ 크루 전체 성공",
  },
};
