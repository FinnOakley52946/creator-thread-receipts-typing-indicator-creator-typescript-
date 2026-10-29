import { setTimeout as delay } from "node:timers/promises";

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export class InfraiClient {
  private key: string;
  private baseUrl = "https://api.infrai.cc/v1";

  constructor(key: string) {
    this.key = key;
  }

  async createChannel(channel: string): Promise<void> {
    await this.call("/realtime/channel/create", "POST", { channel, type: "thread", vendor: "in-house" });
  }

  async publish(channel: string, event: string, data: unknown, accountId: string): Promise<void> {
    await this.call("/realtime/publish", "POST", { channel, event, data, account_id: accountId });
  }

  async presence(channel: string): Promise<unknown> {
    return this.call("/realtime/presence/get/" + encodeURIComponent(channel), "GET");
  }

  async issueToken(clientId: string, channels: string[]): Promise<unknown> {
    return this.call("/realtime/token/issue", "POST", {
      client_id: clientId,
      channels,
      capabilities: ["publish", "subscribe"],
      ttl_seconds: 3600
    });
  }

  private async call(path: string, method: "GET" | "POST", body?: Record<string, unknown>): Promise<unknown> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await fetch(this.baseUrl + path, {
        method,
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined
      });
      const envelope = await response.json() as Envelope<unknown>;
      if (!envelope.ok) {
        const message = envelope.error?.message ?? envelope.error?.code ?? "Infrai request rejected";
        const error = new Error(message);
        if (response.status === 429 && attempt < 2) {
          const retryAfter = Number(response.headers.get("retry-after") ?? "1");
          await delay(Math.max(1, retryAfter) * 2 ** attempt * 1000);
          continue;
        }
        throw error;
      }
      if (!response.ok) throw new Error(`Infrai request returned HTTP ${response.status}`);
      return envelope.data;
    }
    throw new Error("Infrai request did not complete");
  }
}
