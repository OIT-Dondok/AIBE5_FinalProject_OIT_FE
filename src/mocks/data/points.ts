import type { PointAccountResponse, WalletHistoryResponse } from "@/types/domain";

export const mockPointAccount: PointAccountResponse = {
  available_balance: 104400,
  reserved_balance: 15000,
  active_locked_amount: 45000,
  settlement_pending_amount: 15000,
  settlement_failed_amount: 0,
  locked_balance: 60000,
  total_balance: 179400,
  updated_at: "2026-06-04T14:16:00+09:00",
};

export const mockPointHistory: WalletHistoryResponse = {
  items: [
    {
      wallet_event_id: "charge:3017",
      amount: 30000,
      balance_after: 104400,
      display_type: "DODIN_CHARGE",
      status: "COMPLETED",
      reference_type: "POINT_CHARGE",
      reference_id: 3017,
      reference_meta: null,
      created_at: "2026-06-04T14:15:00+09:00",
    },
    {
      wallet_event_id: "crew-deposit:145",
      amount: -10000,
      balance_after: 74400,
      display_type: "DODIN_DEPOSIT",
      status: "PENDING",
      reference_type: "CREW_PARTICIPANT",
      reference_id: 145,
      reference_meta: {
        crew_id: 212,
        crew_title: "아침 루틴 리트릿",
        crew_participant_id: 145,
      },
      created_at: "2026-06-04T13:40:00+09:00",
    },
    {
      wallet_event_id: "crew-deposit-refund:116",
      amount: 8000,
      balance_after: 84400,
      display_type: "DODIN_DEPOSIT_REFUND",
      status: "RELEASED",
      reference_type: "CREW_PARTICIPANT",
      reference_id: 116,
      reference_meta: {
        crew_id: 198,
        crew_title: "주말 산책 크루",
        crew_participant_id: 116,
      },
      created_at: "2026-06-04T13:12:00+09:00",
    },
    {
      wallet_event_id: "settlement-refund:920",
      amount: 5000,
      balance_after: 77600,
      display_type: "SETTLEMENT_REFUND",
      status: "COMPLETED",
      reference_type: "SETTLEMENT_ITEM",
      reference_id: 920,
      reference_meta: {
        crew_id: 315,
        crew_title: "아침 인증 스터디",
        settlement_id: 920,
        settlement_item_id: 310,
      },
      created_at: "2026-06-04T12:30:00+09:00",
    },
  ],
  next_cursor: null,
};
