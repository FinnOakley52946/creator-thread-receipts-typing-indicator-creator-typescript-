import assert from "node:assert/strict";
import { deliverAsset } from "./creator_thread.ts";

const events: string[] = [];
const client = {
  publish: async (_channel: string, event: string) => { events.push(event); },
  createChannel: async () => undefined,
  issueToken: async () => "client-token",
  presence: async () => []
} as never;

const result = await deliverAsset({
  channel: "course:algebra",
  creatorId: "creator-7",
  subscriberId: "learner-3",
  assetId: "lesson-4-pdf",
  processing: true,
  typing: true
}, client);

assert.deepEqual(result, { state: "processing", assetId: "lesson-4-pdf" });
assert.deepEqual(events, ["typing.started", "asset.delivery"]);
console.log("typing is visible while processing, and processing assets do not emit a read receipt");
