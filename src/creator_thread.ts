import { z } from "zod";
import { InfraiClient } from "./realtime_client.ts";

export const threadMessage = z.object({
  channel: z.string().min(1),
  creatorId: z.string().min(1),
  subscriberId: z.string().min(1),
  assetId: z.string().min(1),
  processing: z.boolean(),
  typing: z.boolean()
});

export type ThreadMessage = z.infer<typeof threadMessage>;

export async function deliverAsset(input: unknown, client: InfraiClient): Promise<{ state: string; assetId: string }> {
  const message = threadMessage.parse(input);
  if (message.typing) {
    await client.publish(message.channel, "typing.started", { subscriber_id: message.subscriberId }, message.creatorId);
  }
  await client.publish(message.channel, "asset.delivery", { asset_id: message.assetId, processing: message.processing }, message.creatorId);
  if (message.processing) return { state: "processing", assetId: message.assetId };
  await client.publish(message.channel, "receipt.read", { asset_id: message.assetId, subscriber_id: message.subscriberId }, message.creatorId);
  return { state: "delivered", assetId: message.assetId };
}

export async function prepareThread(input: unknown, client: InfraiClient): Promise<{ token: unknown; presence: unknown }> {
  const message = threadMessage.parse(input);
  await client.createChannel(message.channel);
  const token = await client.issueToken(message.subscriberId, [message.channel]);
  const presence = await client.presence(message.channel);
  return { token, presence };
}
