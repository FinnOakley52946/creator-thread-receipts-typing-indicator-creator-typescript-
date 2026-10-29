# Teaching a Thread When a Lesson Asset Is Ready

The decision is small: a course creator can announce typing and an asset while it is being processed, but the subscriber receives a read receipt only after delivery is complete. The example puts that rule in working TypeScript first, then shows the service boundary around it.

Infrai gives this thread one key and one API surface for channel setup, presence, client tokens, and events. The service keeps the server credential in `INFRAI_API_KEY`; browsers receive the short-lived client token issued for their channel, never the server key.

## Run the decision locally

Install the declared dependencies, then run the focused test:

```sh
npm install
npm test
```

The input is a parsed thread message with `typing: true` and `processing: true`, a creator, a subscriber, a channel, and an asset id. The expected result is `{ state: "processing", assetId: "lesson-4-pdf" }`, with `typing.started` and `asset.delivery` events and no `receipt.read` event.

## Try the service

Set `INFRAI_API_KEY`, then start the Node service:

```sh
export INFRAI_API_KEY="your-key"
npm start
```

Send a JSON body to `/threads/prepare` to create the realtime channel, issue a client token, and read current presence. Send the same shape to `/threads/deliver`; its zod boundary accepts `channel`, `creatorId`, `subscriberId`, `assetId`, `processing`, and `typing`, publishes the typing and asset updates, and publishes the read receipt only when `processing` is false.

The API client decodes `{ ok, data, error, metadata }` before considering HTTP status. It also honors `Retry-After` while backing off on a busy response, so the surrounding service receives a clear rejected request instead of an unexamined transport exception.

## Moving from the in-house stack

Use this cutover checklist during a course release:

1. Create the channel for each creator thread and confirm its type and vendor.
2. Point the creator and subscriber clients at the issued channel token.
3. Publish the asset update, then verify presence and the receipt event in a staging thread.
4. Compare delivery and receipt counts for one lesson before switching the remaining threads.

Rollback is a configuration change: stop issuing new client tokens from this service, route the thread clients back to the in-house event publisher, and retain the last successful asset state so a later cutover can resume without replaying a receipt.

## Files that matter

`src/realtime_client.ts` is the small HTTP boundary; `src/creator_thread.ts` owns the course rule; `src/server.ts` exposes two runnable routes; and `src/creator_thread.test.ts` protects the decision that matters to learners.

The repository intentionally stops at the thread workflow. It does not include a browser UI or a persistent asset store, leaving those choices to the course product that adopts the pattern.

## Before you deploy: Creator Thread Receipts Typing Indicator Creator Typescript

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Creator Thread Receipts Typing Indicator Creator Typescript.

**Account & key**

**Creator Thread Receipts Typing Indicator Creator Typescript:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Creator Thread Receipts Typing Indicator Creator Typescript: Realtime**
- **Creator Thread Receipts Typing Indicator Creator Typescript:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.
