import assert from "node:assert/strict";
import { describe, it } from "node:test";
import ts from "typescript";

import {
  createWalletViewModel,
  formatMonthLabel,
  getCurrentSeoulMonth,
  getMonthStepperState,
  getWalletHistoryTypeParam,
  isAfterMonth,
  POINT_HISTORY_FILTERS,
  shiftMonth,
  toWalletHistoryViewItem,
  type PointHistoryFilter,
} from "@/components/domain/point/pointViewModel";
import { getFilteredHistory } from "@/components/domain/point/WalletHistorySection";
import { createPointService } from "@/services/point";
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

  it("calculates current Seoul month and month stepper transitions", () => {
    assert.equal(getCurrentSeoulMonth(new Date("2026-05-31T15:30:00.000Z")), "2026-06");
    assert.equal(shiftMonth("2026-01", -1), "2025-12");
    assert.equal(shiftMonth("2026-12", 1), "2027-01");
    assert.equal(shiftMonth("1000-01", -1), "0999-12");
    assert.equal(isAfterMonth("2026-07", "2026-06"), true);
    assert.equal(isAfterMonth("2026-05", "2026-06"), false);
  });

  it("builds month stepper state from current Seoul month boundaries", () => {
    assert.deepEqual(getMonthStepperState("2026-06", new Date("2026-05-31T15:30:00.000Z")), {
      canGoNext: false,
      currentMonth: "2026-06",
      label: "2026년 6월",
      nextMonth: "2026-07",
      previousMonth: "2026-05",
    });
    assert.deepEqual(getMonthStepperState("2026-05", new Date("2026-05-31T15:30:00.000Z")), {
      canGoNext: true,
      currentMonth: "2026-06",
      label: "2026년 5월",
      nextMonth: "2026-06",
      previousMonth: "2026-04",
    });
  });

  it("formats month labels and falls back safely for invalid values", () => {
    assert.equal(formatMonthLabel("2026-06"), "2026년 6월");
    assert.equal(formatMonthLabel("2026-13"), "2026-13");
    assert.equal(formatMonthLabel("invalid"), "invalid");
  });

  it("calls the wallet-history endpoint with documented params", async () => {
    const calls: Array<{ url: string; config: unknown }> = [];
    const pointService = createPointService({
      get: (url: string, config?: unknown) => {
        calls.push({ url, config });
        return Promise.resolve({ data: { items: [], next_cursor: "next" } });
      },
      post: () => Promise.reject(new Error("unused")),
    });

    const response = await pointService.getWalletHistory({
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
  });

  it("keeps the lower-level wallet-history service compatible when month is omitted", async () => {
    const calls: Array<{ url: string; config: { params?: Record<string, unknown> } }> = [];
    const pointService = createPointService({
      get: (url: string, config?: unknown) => {
        calls.push({ url, config: (config as { params?: Record<string, unknown> } | undefined) ?? {} });
        return Promise.resolve({ data: { items: [], next_cursor: null } });
      },
      post: () => Promise.reject(new Error("unused")),
    });

    await pointService.getWalletHistory({ limit: 20, type: "deposit" });

    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "/points/wallet-history");
    assert.equal(Object.hasOwn(calls[0].config.params ?? {}, "month"), false);
  });

  it("rejects invalid wallet-history month params before calling the API", async () => {
    const pointService = createPointService({
      get: () => Promise.resolve({ data: { items: [], next_cursor: null } }),
      post: () => Promise.reject(new Error("unused")),
    });

    assert.throws(
      () => pointService.getWalletHistory({ month: "2026-13" }),
      /wallet history month must be YYYY-MM/,
    );
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
    assert.equal(vm.metrics[3].label, "환급 실패 (확인 필요)");
    assert.equal(vm.metrics[3].tone, "red");
    assert.equal(vm.settlementFailedAmount.replace(/\D/g, ""), "700");
    assert.deepEqual(
      vm.historyItems.map((item) => item.id),
      ["charge:21", "deposit:23", "settlement:22"],
    );
  });

  it("hides settlement failure metric when there is no failed settlement amount", () => {
    const account: PointAccountResponse = {
      available_balance: 12000,
      reserved_balance: 5000,
      active_locked_amount: 1000,
      settlement_pending_amount: 800,
      settlement_failed_amount: 0,
      locked_balance: 1800,
      total_balance: 18100,
      updated_at: "2026-06-09T10:00:00+09:00",
    };

    const vm = createWalletViewModel(account, []);

    assert.equal(vm.metrics.length, 3);
    assert.equal(vm.metrics.some((metric) => metric.label === "환급 실패 (확인 필요)"), false);
  });

  it("clears the duplicate cursor guard when paginated history loading fails", () => {
    const sourceFile = readTsSourceFile("src/app/my/dodin/history/page.tsx");
    const catchClauses = findNodes(sourceFile, ts.isCatchClause);

    assert.equal(
      catchClauses.some((catchClause) =>
        nodeText(catchClause.block, sourceFile).includes("lastRequestedCursorRef.current = null"),
      ),
      true,
    );
  });

  it("threads the selected month through initial fetch, retry, and pagination", () => {
    const sourceFile = readTsSourceFile("src/app/my/dodin/history/page.tsx");
    const fetchHistoryCalls = findCallExpressions(sourceFile, "fetchHistory").map((call) =>
      nodeText(call, sourceFile),
    );

    assert.equal(
      fetchHistoryCalls.some((call) => hasObjectProperties(call, ["filter: activeFilter", "month: activeMonth", "reset: true"])),
      true,
    );
    assert.equal(
      fetchHistoryCalls.some((call) =>
        hasObjectProperties(call, ["cursor: nextCursor", "filter: activeFilter", "month: activeMonth", "reset: false"]),
      ),
      true,
    );
  });

  it("keeps month query state non-optional and robust across no-op changes", () => {
    const sourceFile = readTsSourceFile("src/app/my/dodin/history/page.tsx");
    const sourceText = sourceFile.getFullText();

    assert.equal(sourceText.includes("useState(() => getCurrentSeoulMonth())"), true);
    assert.equal(sourceText.includes("month: string"), true);
    assert.equal(sourceText.includes("if (filter === activeFilter) return;"), true);
    assert.equal(sourceText.includes("if (month === activeMonth) return;"), true);
    assert.equal(sourceText.includes("requestIdRef.current += 1;"), true);
    assert.equal(sourceText.includes("...(month ? { month } : {})"), false);
    assert.equal(sourceText.includes("month,"), true);
  });

  it("renders the history page month control as a stepper without all-period options", () => {
    const sourceFile = readTsSourceFile("src/components/domain/point/DodinHistoryList.tsx");
    const sourceText = sourceFile.getFullText();

    assert.equal(sourceText.includes("DodinHistoryMonthStepper"), true);
    assert.equal(sourceText.includes("disabled={!canGoNext}"), true);
    assert.equal(sourceText.includes("ALL_PERIOD"), false);
    assert.equal(sourceText.includes("monthOptions"), false);
  });
});

function readTsSourceFile(path: string) {
  const host = ts.sys;
  const source = host.readFile(path);
  assert.ok(source);
  return ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

function findNodes<T extends ts.Node>(root: ts.Node, predicate: (node: ts.Node) => node is T) {
  const matches: T[] = [];
  const visit = (node: ts.Node) => {
    if (predicate(node)) matches.push(node);
    ts.forEachChild(node, visit);
  };

  visit(root);
  return matches;
}

function findCallExpressions(sourceFile: ts.SourceFile, functionName: string) {
  return findNodes(
    sourceFile,
    (node): node is ts.CallExpression =>
      ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === functionName,
  );
}

function nodeText(node: ts.Node, sourceFile: ts.SourceFile) {
  return node.getText(sourceFile);
}

function hasObjectProperties(callText: string, expectedFragments: string[]) {
  return expectedFragments.every((fragment) => callText.includes(fragment));
}

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
