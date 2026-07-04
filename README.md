# thymus-console

The hosted control plane for [Thymus](https://github.com/UltronLabs/Thymus) — the trust & hygiene layer for AI agent memory.

The Thymus SDK screens every memory write (provenance + injection + rule detection → admit / tag / quarantine) and ships each decision here. The console is where a team **sees** those decisions, **reviews** quarantined poison, and **exports compliance evidence**.

## What it does

- **Dashboard** — memory writes screened, poisoning attempts blocked, tagged, admitted; decisions-over-time; live feed.
- **Quarantine review** — held poison with its taint flags + rule attribution, and Release / Mark-safe / Delete actions (feeds the SDK's trust ledger).
- **Audit log** — every admit/tag/quarantine decision.
- **Evidence** — one-click **OWASP ASI06 / EU AI Act Article 12** evidence pack; every claim traces to a decision record id.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Prisma 7 · Recharts. SQLite for local dev, Postgres in prod (swap `DATABASE_URL` — same schema).

## Run locally

```bash
npm install
npx prisma migrate dev        # creates dev.db + generates the client
npm run dev                   # http://localhost:3000
# then click "Load demo data", or POST /api/seed
```

Set `THYMUS_API_KEY` in `.env` (defaults to `thymus-dev-key`) — the SDK sends it as `x-api-key` when ingesting.

## Ingest from the Thymus SDK

```python
from thymus import wrap
from thymus.adapters.mem0 import Mem0Adapter
from thymus.remote import HttpAuditSink

audit = HttpAuditSink("http://localhost:3000", api_key="thymus-dev-key")
safe = wrap(Mem0Adapter(mem0_client), audit=audit)
safe.add("...", user_id="u1", channel="user_chat", origin_trust_tier="untrusted")
# quarantined poison + every decision now appears in the console
```

## API

| route | purpose |
|---|---|
| `POST /api/decisions` | ingest decision records (SDK) — `x-api-key` required |
| `GET /api/decisions` | list recent decisions |
| `GET /api/export` | ASI06 / Article-12 evidence pack (HTML; `?format=json`) |
| `POST /api/seed` | load demo data |

## Deploy (Railway)

Provision a Postgres plugin, set `DATABASE_URL` + `THYMUS_API_KEY`, run `prisma migrate deploy` on release. Nixpacks auto-detects Next.js.

> Private by design — this is the paid control plane. Open-core: the SDK, benchmark, and rule library are open in `UltronLabs/Thymus`; this console is not.
