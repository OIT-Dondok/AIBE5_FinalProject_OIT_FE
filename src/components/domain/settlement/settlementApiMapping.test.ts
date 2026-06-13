import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createSettlementService } from "@/services/settlement";

describe("settlement API mapping", () => {
  it("calls the personal settlement endpoint without loading full items", async () => {
    const calls: string[] = [];
    const settlementService = createSettlementService({
      get: (url: string) => {
        calls.push(url);
        return Promise.resolve({ data: { settlement_id: 501, my_item: null } });
      },
    });

    const response = await settlementService.getSettlementMe(501);

    assert.equal(response.data.settlement_id, 501);
    assert.deepEqual(calls, ["/settlements/501/me"]);
  });
});
