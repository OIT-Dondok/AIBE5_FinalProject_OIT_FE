import type { TossPaymentRequest } from "@/components/domain/point/pointChargeFlow";

const TOSS_SDK_SCRIPT_ID = "tosspayments-sdk-v2";
const TOSS_SDK_SCRIPT_SRC = "https://js.tosspayments.com/v2/standard";

interface TossPaymentsFactory {
  (clientKey: string): {
    payment: (params: { customerKey: string }) => {
      requestPayment: (request: TossPaymentRequest) => Promise<void> | void;
    };
  };
}

declare global {
  interface Window {
    TossPayments?: TossPaymentsFactory;
  }
}

export async function requestTossPayment({
  clientKey,
  customerKey,
  request,
}: {
  clientKey: string;
  customerKey: string;
  request: TossPaymentRequest;
}) {
  await ensureTossSdkLoaded();

  if (!window.TossPayments) {
    throw new Error("TossPayments SDK를 불러오지 못했어요.");
  }

  const tossPayments = window.TossPayments(clientKey);
  const payment = tossPayments.payment({ customerKey });

  await payment.requestPayment(request);
}

function ensureTossSdkLoaded() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("TossPayments SDK는 브라우저에서만 사용할 수 있어요."));
  }

  if (window.TossPayments) return Promise.resolve();

  const existingScript = document.getElementById(TOSS_SDK_SCRIPT_ID) as HTMLScriptElement | null;
  if (existingScript) return waitForScript(existingScript);

  const script = document.createElement("script");
  script.id = TOSS_SDK_SCRIPT_ID;
  script.src = TOSS_SDK_SCRIPT_SRC;
  script.async = true;
  document.head.appendChild(script);

  return waitForScript(script);
}

function waitForScript(script: HTMLScriptElement) {
  return new Promise<void>((resolve, reject) => {
    if (window.TossPayments) {
      resolve();
      return;
    }

    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("TossPayments SDK 로드에 실패했어요.")), {
      once: true,
    });
  });
}
