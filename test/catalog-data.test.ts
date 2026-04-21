import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { avatarCatalogSeed, rewardCatalogSeed } from "../prisma/catalog-data";

describe("catalog seed data", () => {
  it("keeps stable unique avatar ids", () => {
    const ids = avatarCatalogSeed.map((item) => item.id);

    assert.equal(new Set(ids).size, ids.length);
  });

  it("includes the expected default avatar items", () => {
    const defaults = avatarCatalogSeed
      .filter((item) => item.isDefault)
      .map((item) => item.id)
      .sort();

    assert.deepEqual(defaults, ["bg1", "hair1", "none", "pants1", "shirt1", "shoes1"]);
  });

  it("keeps stable unique reward ids", () => {
    const ids = rewardCatalogSeed.map((reward) => reward.id);

    assert.equal(new Set(ids).size, ids.length);
  });

  it("does not seed invalid stock counts", () => {
    for (const reward of rewardCatalogSeed) {
      if (reward.stockTotal === null || reward.stockRemaining === null) {
        continue;
      }

      assert.ok(reward.stockRemaining >= 0);
      assert.ok(reward.stockRemaining <= reward.stockTotal);
    }
  });
});
