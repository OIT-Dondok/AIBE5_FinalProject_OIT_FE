import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  buildRecentMonthOptions,
  createWalletViewModel,
  formatMonthLabel,
  getWalletHistoryTypeParam,
  POINT_HISTORY_FILTERS,
  toWalletHistoryViewItem,
  type PointHistoryFilter,
} from "@/components/domain/point/pointViewModel";
import { getFilteredHistory } from "@/components/domain/point/WalletHistorySection";
import { api } from "@/lib/axios";
import { getWalletHistory } from "@/services/point";
import type { PointAccountResponse, WalletHistoryItem } from "@/types/domain";

describe("point wallet API mapping", () => {
  it("maps wallet filter categories to wallet history API type params", () => {
    const cases: Array<[PointHistoryFilter, string | undefined]> = [
      ["ALL", undefined],
      ["charge", "charge"],
      ["refund", "refund"],
      ["deposit", "deposit"],
      ["settlement", "settlement"],
      ["withdrawal", "withdrawal"],
    ];

    for (const [filter, expected] of cases) {
      assert.equal(getWalletHistoryTypeParam(filter), expected);
    }
  });

  it("keeps wallet filter labels stable", () => {
    assert.deepEqual(
      POINT_HISTORY_FILTERS.map(({ value }) => value),
      ["ALL", "charge", "deposit", "refund", "settlement", "withdrawal"],
    );
  });

  it("builds recent month options from a fixed base month without timezone parsing", () => {
    assert.deepEqual(buildRecentMonthOptions(new Date(2026, 5, 15), 4), [
      { label: "전체 기간", value: undefined },
      { label: "2026년 6월", value: "2026-06" },
      { label: "2026년 5월", value: "2026-05" },
      { label: "2026년 4월", value: "2026-04" },
      { label: "2026년 3월", value: "2026-03" },
    ]);
  });

  it("builds recent month options by Asia/Seoul month near UTC boundaries", () => {
    assert.deepEqual(buildRecentMonthOptions(new Date("2026-05-31T15:30:00.000Z"), 1), [
      { label: "전체 기간", value: undefined },
      { label: "2026년 6월", value: "2026-06" },
    ]);
  });

  it("formats month labels and falls back safely for invalid values", () => {
    assert.equal(formatMonthLabel(undefined), "전체 기간");
    assert.equal(formatMonthLabel("2026-06"), "2026년 6월");
    assert.equal(formatMonthLabel("2026-13"), "2026-13");
    assert.equal(formatMonthLabel("invalid"), "invalid");
  });

  it("calls the wallet-history endpoint with documented params", async () => {
    const originalGet = api.get;
    const calls: Array<{ url: string; config: unknown }> = [];
    api.get = ((url: string, config?: unknown) => {
      calls.push({ url, config });
      return Promise.resolve({ data: { items: [], next_cursor: "next" } });
    }) as typeof api.get;

    try {
      const response = await getWalletHistory({
        cursor: "cursor-1",
        limit: 20,
        month: "2026-06",
        type: "deposit",
      });

      assert.equal(response.data.next_cursor, "next");
      assert.equal(calls.length, 1);
      assert.equal(calls[0].url, "/points/wallet-history");
      assert.deepEqual(calls[0].config, {
        params: {
          cursor: "cursor-1",
          limit: 20,
          month: "2026-06",
          type: "deposit",
        },
      });
    } finally {
      api.get = originalGet;
    }
  });

  it("omits month from wallet-history params for the all-period filter", async () => {
    const originalGet = api.get;
    const calls: Array<{ url: string; config: { params?: Record<string, unknown> } }> = [];
    api.get = ((url: string, config?: { params?: Record<string, unknown> }) => {
      calls.push({ url, config: config ?? {} });
      return Promise.resolve({ data: { items: [], next_cursor: null } });
    }) as typeof api.get;

    try {
      await getWalletHistory({ limit: 20, type: "deposit" });

      assert.equal(calls.length, 1);
      assert.equal(calls[0].url, "/points/wallet-history");
      assert.equal(Object.hasOwn(calls[0].config.params ?? {}, "month"), false);
    } finally {
      api.get = originalGet;
    }
  });

  it("maps documented wallet display types to wallet-native view items", () => {
    const cases: Array<[WalletHistoryItem["display_type"], "inflow" | "outflow", string]> = [
      ["DODIN_CHARGE", "inflow", "charge"],
      ["DODIN_DEPOSIT", "outflow", "deposit"],
      ["DODIN_DEPOSIT_REFUND", "inflow", "refund"],
      ["SETTLEMENT_REFUND", "inflow", "settlement"],
    ];

    for (const [displayType, direction, category] of cases) {
      const item = createHistoryItem({ display_type: displayType, amount: direction === "inflow" ? 1000 : -1000 });
      const viewItem = toWalletHistoryViewItem(item);

      assert.equal(typeof viewItem.id, "string");
      assert.equal(viewItem.id, item.wallet_event_id);
      assert.equal(viewItem.displayType, displayType);
      assert.equal(viewItem.category, category);
      assert.equal(viewItem.direction, direction);
      assert.equal(viewItem.label.length > 0, true);
      assert.equal("transactionType" in viewItem, false);
    }
  });

  it("uses crew reference metadata and formats wallet fields", () => {
    const item = createHistoryItem({
      wallet_event_id: "crew-deposit:42",
      amount: -30000,
      balance_after: 70000,
      display_type: "DODIN_DEPOSIT",
      reference_meta: {
        crew_id: 42,
        crew_title: "Crew One",
      },
      created_at: "2026-06-09T09:30:00+09:00",
    });

    const viewItem = toWalletHistoryViewItem(item);

    assert.equal(viewItem.id, "crew-deposit:42");
    assert.equal(viewItem.description, "Crew One");
    assert.equal(viewItem.displayAmount.startsWith("-"), true);
    assert.equal(viewItem.balanceAfter.replace(/\D/g, ""), "70000");
    assert.equal(viewItem.dateLabel.length > 0, true);
  });

  it("uses crew_id fallback when crew_title is missing", () => {
    const item = createHistoryItem({
      reference_meta: {
        crew_id: 77,
      },
    });

    assert.equal(toWalletHistoryViewItem(item).description.includes("#77"), true);
  });

  it("returns raw date label when wallet history date is invalid", () => {
    const item = createHistoryItem({ created_at: "invalid-date" });

    assert.equal(toWalletHistoryViewItem(item).dateLabel, "invalid-date");
  });

  it("renders unknown display types safely and keeps them visible under ALL", () => {
    const unknown = createHistoryItem({ display_type: "FUTURE_TYPE" });
    const known = createHistoryItem({ wallet_event_id: "crew-deposit:1", display_type: "DODIN_DEPOSIT" });

    const unknownView = toWalletHistoryViewItem(unknown);
    const knownView = toWalletHistoryViewItem(known);

    assert.equal(unknownView.displayType, "UNKNOWN");
    assert.equal(unknownView.category, "unknown");
    assert.equal(unknownView.direction, "inflow");
    assert.equal(unknownView.label.length > 0, true);
    assert.deepEqual(
      getFilteredHistory([unknownView, knownView], "ALL").map((item) => item.id),
      [unknown.wallet_event_id, known.wallet_event_id],
    );
    assert.deepEqual(
      getFilteredHistory([unknownView, knownView], "deposit").map((item) => item.id),
      [known.wallet_event_id],
    );
  });

  it("filters wallet history by wallet-native category", () => {
    const items = [
      toWalletHistoryViewItem(createHistoryItem({ wallet_event_id: "charge:1", display_type: "DODIN_CHARGE" })),
      toWalletHistoryViewItem(createHistoryItem({ wallet_event_id: "deposit:1", display_type: "DODIN_DEPOSIT" })),
      toWalletHistoryViewItem(createHistoryItem({ wallet_event_id: "refund:1", display_type: "DODIN_DEPOSIT_REFUND" })),
      toWalletHistoryViewItem(createHistoryItem({ wallet_event_id: "settlement:1", display_type: "SETTLEMENT_REFUND" })),
    ];

    assert.deepEqual(getFilteredHistory(items, "charge").map((item) => item.id), ["charge:1"]);
    assert.deepEqual(getFilteredHistory(items, "deposit").map((item) => item.id), ["deposit:1"]);
    assert.deepEqual(getFilteredHistory(items, "refund").map((item) => item.id), ["refund:1"]);
    assert.deepEqual(getFilteredHistory(items, "settlement").map((item) => item.id), ["settlement:1"]);
  });

  it("builds wallet view model with aggregated balances and mapped wallet history", () => {
    const account: PointAccountResponse = {
      available_balance: 12000,
      reserved_balance: 5000,
      active_locked_amount: 1000,
      settlement_pending_amount: 800,
      settlement_failed_amount: 700,
      locked_balance: 1800,
      total_balance: 18800,
      updated_at: "2026-06-09T10:00:00+09:00",
    };

    const historyItems: WalletHistoryItem[] = [
      createHistoryItem({ wallet_event_id: "charge:21", display_type: "DODIN_CHARGE" }),
      createHistoryItem({ wallet_event_id: "deposit:23", display_type: "DODIN_DEPOSIT" }),
      createHistoryItem({ wallet_event_id: "settlement:22", display_type: "SETTLEMENT_REFUND" }),
    ];

    const vm = createWalletViewModel(account, historyItems);

    assert.equal(vm.availableBalance.replace(/\D/g, ""), "12000");
    assert.equal(vm.totalBalance.replace(/\D/g, ""), "18800");
    assert.equal(vm.reservedBalance.replace(/\D/g, ""), "5000");
    assert.equal(vm.lockedBalance.replace(/\D/g, ""), "1800");
    assert.equal(vm.totalPendingReserveBalance.replace(/\D/g, ""), "6000");
    assert.equal(vm.metrics.length, 4);
    assert.equal(vm.metrics[1].value.replace(/\D/g, ""), "6000");
    assert.equal(vm.metrics[2].value.replace(/\D/g, ""), "800");
    assert.equal(vm.metrics[3].value.replace(/\D/g, ""), "700");
    assert.equal(vm.settlementFailedAmount.replace(/\D/g, ""), "700");
    assert.deepEqual(
      vm.historyItems.map((item) => item.id),
      ["charge:21", "deposit:23", "settlement:22"],
    );
  });

  it("clears the duplicate cursor guard when paginated history loading fails", () => {
    const source = readFileSync("src/app/my/dodin/history/page.tsx", "utf8");
    const catchBlock = source.match(/catch\s*\{([\s\S]*?)\}\s*finally/)?.[1];

    assert.ok(catchBlock);
    assert.match(catchBlock, /lastRequestedCursorRef\.current\s*=\s*null;/);
  });

  it("threads the selected month through initial fetch, retry, and pagination", () => {
    const source = readFileSync("src/app/my/dodin/history/page.tsx", "utf8");

    assert.match(source, /activeMonth/);
    assert.match(source, /month:\s*activeMonth/);
    assert.match(source, /fetchHistory\(\{\s*filter:\s*activeFilter,\s*month:\s*activeMonth,\s*reset:\s*true\s*\}\)/);
    assert.match(source, /fetchHistory\(\{\s*cursor:\s*nextCursor,\s*filter:\s*activeFilter,\s*month:\s*activeMonth,\s*reset:\s*false\s*\}\)/);
    assert.match(source, /\[activeFilter,\s*activeMonth,\s*fetchHistory,\s*resetHistoryQuery\]/);
  });

  it("keeps month query state robust across no-op changes and stale in-flight requests", () => {
    const source = readFileSync("src/app/my/dodin/history/page.tsx", "utf8");

    assert.match(source, /if\s*\(filter\s*===\s*activeFilter\)\s*return;/);
    assert.match(source, /if\s*\(month\s*===\s*activeMonth\)\s*return;/);
    assert.match(source, /requestIdRef\.current\s*\+=\s*1;/);
    assert.match(source, /\.\.\.\(month\s*\?\s*\{\s*month\s*\}\s*:\s*\{\s*\}\)/);
  });
});

function createHistoryItem(overrides: Partial<WalletHistoryItem> = {}): WalletHistoryItem {
  return {
    wallet_event_id: "wallet-event:1",
    amount: 1000,
    balance_after: 10000,
    display_type: "DODIN_CHARGE",
    status: "COMPLETED",
    reference_type: "POINT_CHARGE",
    reference_id: 1,
    reference_meta: null,
    created_at: "2026-06-09T09:30:00+09:00",
    ...overrides,
  };
}
