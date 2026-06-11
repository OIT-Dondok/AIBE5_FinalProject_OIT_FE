import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CHARGE_AMOUNT_POLICY,
  beginChargeSubmitLaunch,
  buildPointChargePayload,
  buildTossPaymentRequest,
  buildWalletConfirmedUrl,
  buildTossRedirectUrl,
  classifyPendingOrder,
  createChargeOrderId,
  failChargeSubmitLaunch,
  getChargeAmountError,
  getTossClientConfigState,
  parseTossFailParams,
  parseTossSuccessParams,
  resolveChargeInitialAmount,
  shouldOpenChargeConfirmedToast,
  shouldConfirmOnRouteEnter,
} from "@/components/domain/point/pointChargeFlow";

describe("point charge flow helpers", () => {
  it("validates the documented charge amount policy", () => {
    assert.deepEqual(CHARGE_AMOUNT_POLICY.presets, [10000, 30000, 50000, 100000]);
    assert.equal(getChargeAmountError(null), "충전 금액을 입력해 주세요.");
    assert.equal(getChargeAmountError(999), "1,000원 이상부터 충전할 수 있어요.");
    assert.equal(getChargeAmountError(1500), "1,000원 단위로 입력해 주세요.");
    assert.equal(getChargeAmountError(1000001), "한 번에 1,000,000원까지 충전할 수 있어요.");
    assert.equal(getChargeAmountError(1000), "");
    assert.equal(getChargeAmountError(1000000), "");
  });

  it("normalizes shortage prefill amounts by min max and step", () => {
    assert.equal(resolveChargeInitialAmount(undefined), 10000);
    assert.equal(resolveChargeInitialAmount(500), 1000);
    assert.equal(resolveChargeInitialAmount(15500), 15000);
    assert.equal(resolveChargeInitialAmount(1000999), 1000000);
  });

  it("creates Toss-safe order IDs", () => {
    const orderId = createChargeOrderId({
      now: new Date("2026-06-10T05:00:00.000Z"),
      random: () => 0.123456789,
    });

    assert.match(orderId, /^dodin-[0-9A-Za-z_-]+-[0-9A-Za-z_-]+$/);
    assert.equal(orderId.length >= 6, true);
    assert.equal(orderId.length <= 64, true);
  });

  it("builds absolute redirect URLs from configured origins and local fallback only", () => {
    assert.equal(
      buildTossRedirectUrl({
        appOrigin: "https://app.dondok.kr/",
        fallbackOrigin: "https://evil.example",
        path: "/my/dodin/charge/success",
      }),
      "https://app.dondok.kr/my/dodin/charge/success",
    );

    assert.equal(
      buildTossRedirectUrl({
        fallbackOrigin: "http://localhost:3000",
        path: "/my/dodin/charge/fail",
      }),
      "http://localhost:3000/my/dodin/charge/fail",
    );

    assert.throws(
      () =>
        buildTossRedirectUrl({
          fallbackOrigin: "https://unconfigured.example",
          path: "/my/dodin/charge/success",
        }),
      /configured public app origin/,
    );
  });

  it("parses Toss success and fail params safely", () => {
    assert.deepEqual(
      parseTossSuccessParams(new URLSearchParams("paymentKey=pay_123&orderId=dodin-1&amount=30000")),
      { ok: true, paymentKey: "pay_123", orderId: "dodin-1", amount: 30000 },
    );
    assert.deepEqual(parseTossSuccessParams(new URLSearchParams("paymentKey=pay_123&amount=30000")), {
      ok: false,
      reason: "invalid_params",
    });
    assert.deepEqual(
      parseTossSuccessParams(new URLSearchParams("paymentKey=pay_123&orderId=dodin-1&amount=-100")),
      { ok: false, reason: "invalid_params" },
    );
    assert.deepEqual(
      parseTossSuccessParams(new URLSearchParams("paymentKey=pay_123&orderId=dodin-1&amount=100.5")),
      { ok: false, reason: "invalid_params" },
    );
    assert.deepEqual(
      parseTossSuccessParams(new URLSearchParams("paymentKey=pay_123&orderId=dodin-1&amount=abc")),
      { ok: false, reason: "invalid_params" },
    );
    assert.deepEqual(parseTossFailParams(new URLSearchParams("code=PAY_PROCESS_CANCELED&message=cancelled")), {
      code: "PAY_PROCESS_CANCELED",
      message: "cancelled",
      orderId: null,
      isCanceled: true,
    });
  });

  it("blocks hard pending-order mismatches before backend confirm", () => {
    const pending = {
      amount: 30000,
      createdAt: "2026-06-10T05:00:00.000Z",
      orderId: "dodin-1",
      schemaVersion: 1 as const,
    };

    assert.equal(
      classifyPendingOrder(pending, { amount: 30000, orderId: "dodin-1" }).status,
      "match",
    );
    assert.equal(
      classifyPendingOrder(pending, { amount: 50000, orderId: "dodin-1" }).status,
      "mismatch",
    );
    assert.equal(shouldConfirmOnRouteEnter("match"), true);
    assert.equal(shouldConfirmOnRouteEnter("mismatch"), false);
    assert.equal(shouldConfirmOnRouteEnter("missing"), false);
  });

  it("keeps the backend payload snake_case", () => {
    assert.deepEqual(
      buildPointChargePayload({ amount: 30000, orderId: "dodin-1", paymentKey: "pay_123" }),
      {
        amount: 30000,
        order_id: "dodin-1",
        payment_id: "pay_123",
      },
    );
  });

  it("disables payment start when Toss client key is missing", () => {
    assert.deepEqual(getTossClientConfigState("test_ck_123"), { enabled: true, clientKey: "test_ck_123" });
    assert.deepEqual(getTossClientConfigState(""), {
      enabled: false,
      errorMessage: "TossPayments client key가 설정되지 않았어요.",
    });
  });

  it("builds a mobile-safe Toss redirect payment request", () => {
    assert.deepEqual(
      buildTossPaymentRequest({
        amount: 30000,
        failUrl: "http://localhost:3000/my/dodin/charge/fail",
        orderId: "dodin-1",
        successUrl: "http://localhost:3000/my/dodin/charge/success",
      }),
      {
        method: "CARD",
        amount: { value: 30000, currency: "KRW" },
        orderId: "dodin-1",
        orderName: "도딘 30,000원 충전",
        successUrl: "http://localhost:3000/my/dodin/charge/success",
        failUrl: "http://localhost:3000/my/dodin/charge/fail",
      },
    );
  });

  it("builds the wallet return URL only after backend-confirmed charge", () => {
    assert.equal(
      buildWalletConfirmedUrl({ amount: 30000, pointHistoryId: 1001 }),
      "/my/dodin?charge=confirmed&amount=30000&point_history_id=1001",
    );
  });

  it("opens the wallet charge toast only for confirmed charge URLs with numeric confirmation data", () => {
    assert.equal(
      shouldOpenChargeConfirmedToast(new URLSearchParams("charge=confirmed&amount=30000&point_history_id=1001")),
      true,
    );
    assert.equal(shouldOpenChargeConfirmedToast(new URLSearchParams("charge=confirmed")), false);
    assert.equal(
      shouldOpenChargeConfirmedToast(new URLSearchParams("charge=confirmed&amount=abc&point_history_id=1001")),
      false,
    );
    assert.equal(
      shouldOpenChargeConfirmedToast(new URLSearchParams("charge=confirmed&amount=30000&point_history_id=abc")),
      false,
    );
    assert.equal(
      shouldOpenChargeConfirmedToast(new URLSearchParams("charge=pending&amount=30000&point_history_id=1001")),
      false,
    );
  });

  it("confirms only when the returned Toss order matches the pending local order", () => {
    assert.equal(shouldConfirmOnRouteEnter("match"), true);
    assert.equal(shouldConfirmOnRouteEnter("missing"), false);
    assert.equal(shouldConfirmOnRouteEnter("mismatch"), false);
  });

  it("uses a synchronous submit lock before launching Toss payment", () => {
    const lock = { current: false };
    const statuses: string[] = [];
    const errors: string[] = [];

    assert.equal(
      beginChargeSubmitLaunch(
        lock,
        (status) => statuses.push(status),
        (error) => errors.push(error),
      ),
      true,
    );
    assert.equal(lock.current, true);
    assert.deepEqual(statuses, ["launching"]);
    assert.deepEqual(errors, [""]);

    assert.equal(
      beginChargeSubmitLaunch(
        lock,
        (status) => statuses.push(status),
        (error) => errors.push(error),
      ),
      false,
    );
    assert.deepEqual(statuses, ["launching"]);

    failChargeSubmitLaunch(
      lock,
      (status) => statuses.push(status),
      (error) => errors.push(error),
      "failed",
    );
    assert.equal(lock.current, false);
    assert.deepEqual(statuses, ["launching", "idle"]);
    assert.deepEqual(errors, ["", "failed"]);
  });

});
