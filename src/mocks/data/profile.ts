export type CrewProfileStat = {
  label: string;
  value: string;
  caption: string;
  tone: "gold" | "green" | "blue" | "mint" | "neutral";
};

export type CrewProfileMock = {
  initials: string;
  avatarImageUrl: string | null;
  nickname: string;
  statusMessage: string | null;
  isHostEver: boolean;
  hostedCrewCount: number;
  stats: CrewProfileStat[];
};

export type CrewProfileFormState = {
  initials: string;
  avatarImageUrl: string | null;
  nickname: string;
  statusMessage: string;
};

export const mockCrewProfile: CrewProfileMock | null = {
  initials: "갓",
  avatarImageUrl: null,
  nickname: "갓생러",
  statusMessage:
    "오늘도 한 걸음씩, 어제보다 조금 더 나아지는 중입니다. 아침 운동, 독서, 물 마시기처럼 작아 보여도 꾸준함이 필요한 습관을 크루원들과 함께 기록하면서 끝까지 완주해보고 싶어요.",
  isHostEver: true,
  hostedCrewCount: 3,
  stats: [
    { label: "참여 크루 수", value: "17개", caption: "진행 3 · 종료 14", tone: "gold" },
    { label: "총 성공 횟수", value: "450회", caption: "인정된 인증 기준", tone: "green" },
    { label: "최고 지분율", value: "25.0%", caption: "아침 갓생 30일", tone: "blue" },
    { label: "평균 성공률", value: "92.4%", caption: "종료 크루 평균", tone: "mint" },
  ],
};
