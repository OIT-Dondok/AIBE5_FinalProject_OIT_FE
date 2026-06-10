import type { PointChargeRequest } from "@/types/domain";

export const CHARGE_AMOUNT_POLICY = {
  min: 1000,
  max: 1000000,
  step: 1000,
  presets: [10000, 30000, 50000, 100000],
} as const;

export const DEFAULT_CHARGE_AMOUNT = CHARGE_AMOUNT_POLICY.presets[0];

export interface PendingChargeOrder {
  schemaVersion: 1;
  orderId: string;
  amount: number;
  createdAt: string;
}

export type PendingOrderStatus = "match" | "missing" | "mismatch";

export type TossSuccessParams =
  | {
      ok: true;
      paymentKey: string;
      orderId: string;
      amount: number;
    }
  | {
      ok: false;
      reason: "invalid_params";
    };

export interface TossFailParams {
  code: string;
  message: string;
  orderId: string | null;
  isCanceled: boolean;
}

export interface TossPaymentRequest {
  method: "CARD";
  amount: {
    value: number;
    currency: "KRW";
  };
  orderId: string;
  orderName: string;
  successUrl: string;
  failUrl: string;
}

const LOCAL_ORIGIN_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/;
const ORDER_ID_SAFE_PATTERN = /[^0-9A-Za-z_-]/g;

export function getChargeAmountError(amount: number | null) {
  if (amount == null) return "충전 금액을 입력해 주세요.";
  if (!Number.isInteger(amount)) return "1,000원 단위로 입력해 주세요.";
  if (amount < CHARGE_AMOUNT_POLICY.min) return "1,000원 이상부터 충전할 수 있어요.";
  if (amount > CHARGE_AMOUNT_POLICY.max) return "한 번에 1,000,000원까지 충전할 수 있어요.";
  if (amount % CHARGE_AMOUNT_POLICY.step !== 0) return "1,000원 단위로 입력해 주세요.";
  return "";
}

export function resolveChargeInitialAmount(rawAmount: number | undefined) {
  if (rawAmount == null || !Number.isFinite(rawAmount) || rawAmount <= 0) {
    return DEFAULT_CHARGE_AMOUNT;
  }

  const clamped = Math.min(rawAmount, CHARGE_AMOUNT_POLICY.max);
  const stepAligned = Math.floor(clamped / CHARGE_AMOUNT_POLICY.step) * CHARGE_AMOUNT_POLICY.step;

  return Math.max(CHARGE_AMOUNT_POLICY.min, Math.min(stepAligned, CHARGE_AMOUNT_POLICY.max));
}

export function parseChargeAmountInput(input: string) {
  const sanitized = input.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "").slice(0, 7);
  if (!sanitized) return { sanitized, amount: null };

  const amount = Number(sanitized);
  return { sanitized, amount: Number.isFinite(amount) ? amount : null };
}

export function formatChargeAmountInput(value: string) {
  if (!value) return "";
  return new Intl.NumberFormat("ko-KR").format(Number(value));
}

export function createChargeOrderId(options: { now?: Date; random?: () => number } = {}) {
  const now = options.now ?? new Date();
  const random = options.random ?? Math.random;
  const timestamp = now.toISOString().replace(ORDER_ID_SAFE_PATTERN, "");
  const randomPart = random().toString(36).slice(2, 12).replace(ORDER_ID_SAFE_PATTERN, "");
  const orderId = `dodin-${timestamp}-${randomPart}`;

  return orderId.slice(0, 64);
}

export function buildTossRedirectUrl({
  appOrigin,
  fallbackOrigin,
  path,
}: {
  appOrigin?: string;
  fallbackOrigin?: string;
  path: string;
}) {
  const normalizedAppOrigin = normalizeOrigin(appOrigin);
  const normalizedFallbackOrigin = normalizeOrigin(fallbackOrigin);
  const origin = normalizedAppOrigin ?? resolveLocalFallbackOrigin(normalizedFallbackOrigin);

  return new URL(path, origin).toString();
}

export function parseTossSuccessParams(params: URLSearchParams): TossSuccessParams {
  const paymentKey = params.get("paymentKey");
  const orderId = params.get("orderId");
  const amountParam = params.get("amount");
  const amount = amountParam == null ? NaN : Number(amountParam);

  if (!paymentKey || !orderId || !Number.isInteger(amount) || getChargeAmountError(amount)) {
    return { ok: false, reason: "invalid_params" };
  }

  return { ok: true, paymentKey, orderId, amount };
}

export function parseTossFailParams(params: URLSearchParams): TossFailParams {
  const code = sanitizeDisplayText(params.get("code") || "PAYMENT_FAILED");
  const message = sanitizeDisplayText(params.get("message") || "결제를 완료하지 못했어요.");
  const orderId = params.get("orderId");

  return {
    code,
    message,
    orderId: orderId ? sanitizeDisplayText(orderId) : null,
    isCanceled: code === "PAY_PROCESS_CANCELED",
  };
}

export function classifyPendingOrder(
  pending: PendingChargeOrder | null,
  returned: { orderId: string; amount: number },
): { status: PendingOrderStatus; message?: string } {
  if (pending == null) return { status: "missing" };
  if (pending.orderId === returned.orderId && pending.amount === returned.amount) {
    return { status: "match" };
  }

  return {
    status: "mismatch",
    message: "결제 세션 정보가 일치하지 않아요. 다시 시도하거나 문의해주세요.",
  };
}

export function shouldConfirmOnRouteEnter(status: PendingOrderStatus) {
  return status !== "mismatch";
}

export function buildPointChargePayload({
  amount,
  orderId,
  paymentKey,
}: {
  amount: number;
  orderId: string;
  paymentKey: string;
}): PointChargeRequest {
  return {
    payment_id: paymentKey,
    order_id: orderId,
    amount,
  };
}

export function buildTossPaymentRequest({
  amount,
  failUrl,
  orderId,
  successUrl,
}: {
  amount: number;
  failUrl: string;
  orderId: string;
  successUrl: string;
}): TossPaymentRequest {
  return {
    method: "CARD",
    amount: {
      value: amount,
      currency: "KRW",
    },
    orderId,
    orderName: `도딘 ${new Intl.NumberFormat("ko-KR").format(amount)}원 충전`,
    successUrl,
    failUrl,
  };
}

export function buildWalletConfirmedUrl({
  amount,
  pointHistoryId,
}: {
  amount: number;
  pointHistoryId: number;
}) {
  const params = new URLSearchParams({
    charge: "confirmed",
    amount: String(amount),
    point_history_id: String(pointHistoryId),
  });

  return `/my/dodin?${params.toString()}`;
}

export function getTossClientConfigState(clientKey: string | undefined) {
  const trimmed = clientKey?.trim();
  if (!trimmed) {
    return {
      enabled: false as const,
      errorMessage: "TossPayments client key가 설정되지 않았어요.",
    };
  }

  return {
    enabled: true as const,
    clientKey: trimmed,
  };
}

export function createPendingChargeOrder(orderId: string, amount: number): PendingChargeOrder {
  return {
    schemaVersion: 1,
    orderId,
    amount,
    createdAt: new Date().toISOString(),
  };
}

export function readPendingChargeOrder(storage: Storage | undefined): PendingChargeOrder | null {
  if (!storage) return null;

  const raw = storage.getItem(PENDING_CHARGE_ORDER_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<PendingChargeOrder>;
    if (
      parsed.schemaVersion !== 1 ||
      typeof parsed.orderId !== "string" ||
      !Number.isInteger(parsed.amount) ||
      typeof parsed.createdAt !== "string"
    ) {
      return null;
    }
    return parsed as PendingChargeOrder;
  } catch {
    return null;
  }
}

export function writePendingChargeOrder(storage: Storage | undefined, order: PendingChargeOrder) {
  storage?.setItem(PENDING_CHARGE_ORDER_KEY, JSON.stringify(order));
}

export function clearPendingChargeOrder(storage: Storage | undefined) {
  storage?.removeItem(PENDING_CHARGE_ORDER_KEY);
}

export const PENDING_CHARGE_ORDER_KEY = "dondok:point-charge:pending-order:v1";

function normalizeOrigin(origin: string | undefined) {
  if (!origin?.trim()) return undefined;
  return new URL(origin).origin;
}

function resolveLocalFallbackOrigin(origin: string | undefined) {
  if (origin && LOCAL_ORIGIN_PATTERN.test(origin)) return origin;
  throw new Error("configured public app origin is required outside local sandbox");
}

function sanitizeDisplayText(value: string) {
  return value.replace(/[<>]/g, "").slice(0, 300);
}
