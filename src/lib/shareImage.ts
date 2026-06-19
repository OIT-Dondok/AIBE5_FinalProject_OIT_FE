import { toPng } from 'html-to-image';

// navigator.canShare는 일부 타입 정의에 없어 보강
type ShareCapableNavigator = Navigator & {
  canShare?: (data?: ShareData) => boolean;
};

// DOM 노드를 2배 해상도 PNG Blob으로 캡처
export async function captureNodeToPngBlob(node: HTMLElement): Promise<Blob> {
  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    cacheBust: true,
    // 둥근 모서리 바깥은 투명 유지 (카드 본체는 자체 배경을 가짐)
  });
  const response = await fetch(dataUrl);
  return response.blob();
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // 브라우저가 다운로드를 비동기로 처리하므로, 한 틱 뒤에 해제해 간헐적 실패 방지
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export type ShareResult = 'shared' | 'downloaded' | 'cancelled';

// Web Share API(파일 첨부)로 공유, 미지원 환경은 다운로드로 폴백
export async function sharePngFile(
  blob: Blob,
  fileName: string,
  shareData?: Pick<ShareData, 'title' | 'text'>,
): Promise<ShareResult> {
  const file = new File([blob], fileName, { type: 'image/png' });
  const nav = navigator as ShareCapableNavigator;

  if (nav.canShare?.({ files: [file] }) && typeof nav.share === 'function') {
    try {
      await nav.share({ ...shareData, files: [file] });
      return 'shared';
    } catch (error) {
      // 사용자가 공유 시트를 닫은 경우(AbortError)는 폴백하지 않음
      if (error instanceof Error && error.name === 'AbortError') return 'cancelled';
      // 그 외 실패는 다운로드로 폴백
    }
  }

  downloadBlob(blob, fileName);
  return 'downloaded';
}
