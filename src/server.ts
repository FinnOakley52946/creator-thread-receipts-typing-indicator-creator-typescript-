import { createServer } from "node:http";
import { deliverAsset, prepareThread } from "./creator_thread.ts";
import { InfraiClient } from "./realtime_client.ts";

const key = process.env.INFRAI_API_KEY;
if (!key) throw new Error("Set INFRAI_API_KEY before starting the service");
const client = new InfraiClient(key);

const server = createServer(async (request, response) => {
  if (request.method !== "POST" || (request.url !== "/threads/prepare" && request.url !== "/threads/deliver")) {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Route not found" }));
    return;
  }
  let raw = "";
  for await (const chunk of request) raw += chunk;
  try {
    const input = JSON.parse(raw);
    const result = request.url === "/threads/prepare" ? await prepareThread(input, client) : await deliverAsset(input, client);
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(result));
  } catch (error) {
    response.writeHead(400, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: error instanceof Error ? error.message : "Invalid request" }));
  }
});

server.listen(Number(process.env.PORT ?? 3000), () => console.log("creator thread service listening"));
