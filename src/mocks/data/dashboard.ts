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

export type GracePeriodItem = {
  title: string;
  description: string;
};

export type HostPrinciplesMock = {
  hostInitial: string;
  hostName: string;
  agreementLabel: string;
  title: string;
  principles: string[];
  reportNotice: string;
  reportActionLabel: string;
  graceTitle: string;
  graceDescription: string;
  graceItems: GracePeriodItem[];
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
    hostInitial: "모",
    hostName: "모닝맨",
    agreementLabel: "4가지 원칙 동의함",
    title: "이 크루의 방장 운영원칙",
    principles: [
      "정직한 인증 검증을 약속합니다",
      "일일 정산 전에 모든 인증을 검토합니다",
      "임시승인/기각 정책을 이해했습니다",
      "개인적 친분으로 판단하지 않습니다",
    ],
    reportNotice: "부정 검증이 의심되면 운영팀에 신고할 수 있어요.",
    reportActionLabel: "부정 의심 신고",
    graceTitle: "검증 유예 기간 안내",
    graceDescription:
      "방장이 일일 정산 전까지 인증을 검토하지 못하면, 정산 시각부터 72시간의 유예 기간이 적용돼요.",
    graceItems: [
      {
        title: "유예 중 임시 처리",
        description:
          "Exif 1차 검증 결과로 성공/실패를 임시 적용해 정산을 막지 않아요.",
      },
      {
        title: "긴급 검토 표시",
        description: "임시 처리된 인증은 운영 콘솔에서 긴급 검토로 표시돼요.",
      },
      {
        title: "기간 내 확정 필요",
        description:
          "유예 기간 안에 방장이 확정하지 않으면 임시 결과가 그대로 확정돼요.",
      },
    ],
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
