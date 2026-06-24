import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function zIndexValue(source: string) {
  const match = source.match(/z-\[(\d+)\]/);

  assert.ok(match);
  return Number(match[1]);
}

describe("wallet UI polish source guards", () => {
  it("lets metric tooltips escape the wallet card clipping layer", () => {
    const walletSource = readFileSync("src/components/domain/point/WalletSummaryCard.tsx", "utf8");

    assert.equal(walletSource.includes("relative overflow-hidden rounded-[24px]"), false);
    assert.equal(walletSource.includes("pointer-events-none absolute inset-0 overflow-hidden rounded-[24px]"), true);
  });

  it("keeps bottom sheet backdrop above the sticky header", () => {
    const headerSource = readFileSync("src/components/common/Header.tsx", "utf8");
    const bottomSheetSource = readFileSync("src/components/common/BottomSheet.tsx", "utf8");

    assert.ok(zIndexValue(bottomSheetSource) > zIndexValue(headerSource));
  });
});
