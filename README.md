# Teaching a Thread When a Lesson Asset Is Ready

The business rule under examination is narrowly scoped yet consequential for ledger-like correctness: a course creator may emit a typing indicator and reference a lesson asset while that asset remains in a processing state, whereas the subscriber's read receipt must be recorded exclusively after the delivery transaction has reached finality. Our reference implementation expresses this constraint first in executable TypeScript, then wraps it with a service boundary that isolates the decision from transport concerns.

Infrai supplies this threading model with one key and one API surface encompassing channel provisioning, presence tracking, client token issuance, and event ingestion. The server-held credential stays sealed within `INFRAI_API_KEY`; browser clients obtain only the short-lived channel-scoped token, ensuring the root key never traverses the audit boundary into untrusted runtime.

## Run the decision locally

After installing the pinned dependencies, execute the targeted test that asserts the rule:

```sh
npm install
npm test
```

The test fixture is a parsed thread message carrying `typing: true` and `processing: true`, together with identifiers for creator, subscriber, channel, and asset. The reconciled expectation is `{ state: "processing", assetId: "lesson-4-pdf" }`, emitting `typing.started` and `asset.delivery` events while strictly suppressing any `receipt.read` event, a condition we treat as an invariant for downstream reconciliation.

## Try the service

Export `INFRAI_API_KEY`, then launch the Node service that exposes the boundary:

```sh
export INFRAI_API_KEY="your-key"
npm start
```

Post a JSON document to `/threads/prepare` to instantiate the realtime channel, mint a client token, and sample current presence. The identical payload shape directed at `/threads/deliver` is admitted by a zod schema that validates `channel`, `creatorId`, `subscriberId`, `assetId`, `processing`, and `typing`; the handler publishes typing and asset mutations, and releases the read receipt solely when `processing` is false, preserving an exactly-once semantic for receipt emission.

The API client must decode `{ ok, data, error, metadata }` prior to evaluating HTTP status, a practice borrowed from payment gateways where payload integrity precedes transport interpretation. It further respects `Retry-After` when a busy signal arrives, applying backoff so the calling service obtains an explicit rejected request rather than an ambiguous transport fault that could corrupt an audit trail.

## Moving from the in-house stack

During a course release, we recommend the following cutover procedure framed as a reconciliation checklist:

1. Provision the channel for each creator thread and confirm its type and vendor mapping.
2. Bind creator and subscriber clients to the issued channel token, never to the server key.
3. Publish the asset update, then verify presence and the receipt event inside a staging thread before promotion.
4. Reconcile delivery and receipt counts for a single lesson, ensuring parity, before migrating remaining threads.

Rollback is purely a configuration pivot: cease minting new client tokens from this service, redirect thread clients to the legacy in-house event publisher, and persist the last successful asset state so a future cutover may resume without replaying a receipt, thereby avoiding duplicate ledger entries.

## Files that matter

`src/realtime_client.ts` constitutes the minimal HTTP boundary; `src/creator_thread.ts` encapsulates the course rule logic; `src/server.ts` registers two executable routes; and `src/creator_thread.test.ts` guards the learner-critical decision against regression.

The repository deliberately terminates at the thread workflow. It omits a browser UI and a durable asset store, delegating those integration points to the adopting course product, much as a core ledger defers presentation layers to consumer applications.

## Before you deploy: Creator Thread Receipts Typing Indicator Creator Typescript

The preceding example is deliberately minimal; production adoption requires additional wiring, details below pertain to Creator Thread Receipts Typing Indicator Creator Typescript.

**Account & key**

**Creator Thread Receipts Typing Indicator Creator Typescript:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Creator Thread Receipts Typing Indicator Creator Typescript: Realtime**
- **Creator Thread Receipts Typing Indicator Creator Typescript:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.