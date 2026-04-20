import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  AVATAR_ITEMS,
  REWARD_CATALOG,
  getAvatarItemDefinition,
  getRewardDefinition,
} from "@/lib/game-config";

describe("game config", () => {
  it("returns canonical avatar item definitions by id", () => {
    const item = getAvatarItemDefinition("shirt2");

    assert.ok(item);
    assert.equal(item?.name, "Pink Shirt");
    assert.equal(item?.cost, 30);
    assert.equal(item?.type, "shirt");
  });

  it("returns canonical reward definitions by id", () => {
    const reward = getRewardDefinition("roblox_400");

    assert.ok(reward);
    assert.equal(reward?.title, "400 Robux");
    assert.equal(reward?.cost, 700);
    assert.equal(reward?.type, "roblox_credits");
  });

  it("keeps zero-cost defaults available in the avatar catalog", () => {
    const defaults = AVATAR_ITEMS.filter((item) => item.cost === 0).map((item) => item.id);

    assert.deepEqual(defaults.sort(), ["bg1", "hair1", "pants1", "shirt1", "shoes1"]);
  });

  it("contains unique reward ids", () => {
    const ids = REWARD_CATALOG.map((reward) => reward.id);

    assert.equal(new Set(ids).size, ids.length);
  });
});
