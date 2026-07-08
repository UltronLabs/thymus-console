# thymus-console

The hosted control plane for [Thymus](https://github.com/UltronLabs/Thymus) — the trust & hygiene layer for AI agent memory.

The Thymus SDK screens every memory write (provenance + injection + rule detection → admit / tag / quarantine) and ships each decision here. The console is where a team **sees** those decisions, **reviews** quarantined poison, and **exports compliance evidence**.

## What it does

- **Dashboard** — memory writes screened, poisoning attempts blocked, tagged, admitted; decisions-over-time; live feed.
- **Quarantine review** — held poison with its taint flags + rule attribution, and Release / Mark-safe / Delete actions (feeds the SDK's trust ledger).
- **Audit log** — every admit/tag/quarantine decision.
- **Evidence** — one-click **OWASP ASI06 / EU AI Act Article 12** evidence pack; every claim traces to a decision record id.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Prisma 7 · Recharts. Dual-provider DB: SQLite or Postgres locally, Postgres in prod — picked at runtime by `DATABASE_URL` (see `src/lib/prisma.ts`). Same schema either way; no migration files, tables are kept in sync with `prisma db push`.

## Run locally

```bash
npm install
npm run db:push               # syncs the schema to whatever DATABASE_URL points at
npm run dev                   # http://localhost:3000
# then click "Load demo data", or POST /api/seed
```

Set `THYMUS_API_KEY` in `.env` (defaults to `thymus-dev-key`) — the SDK sends it as `x-api-key` when ingesting.

### Local database options

`DATABASE_URL` in `.env` decides the provider — `postgres://...` → Postgres, anything else (e.g. `file:./dev.db`) → SQLite.

**Native Postgres (recommended — matches prod):**

```bash
brew install postgresql@14
brew services start postgresql@14
```

> If port `5432` is already taken by another local Postgres install, point this one at a different port (e.g. `5433`) by setting `port = 5433` in `postgresql.conf` (`/opt/homebrew/var/postgresql@14/postgresql.conf`) and restarting the service — then use that port everywhere below.

```bash
/opt/homebrew/opt/postgresql@14/bin/createdb -p 5433 -h localhost thymus_console
```

`.env`:
```
DATABASE_URL="postgresql://<your-mac-username>@localhost:5433/thymus_console"
```

Browse it with a free GUI — **[Beekeeper Studio](https://www.beekeeperstudio.io/)** (`brew install --cask beekeeper-studio`) or pgAdmin4. Connection details:

```
Host:     localhost
Port:     5433
Database: thymus_console
User:     <your-mac-username>
Password: (none — Homebrew's default local trust auth)
```

or as a single connection string: `postgresql://<your-mac-username>@localhost:5433/thymus_console`

**SQLite (quick start, no setup):**

```
DATABASE_URL="file:./dev.db"
```

No server to run; `npm run db:push` creates `dev.db` directly. Fine for a quick look, but diverges from prod (Postgres) — prefer native Postgres for anything beyond that.

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

Provision a Postgres service, point the console's `DATABASE_URL` at it (`${{Postgres.DATABASE_URL}}`), and set the Clerk production env vars (see `docs/auth-and-domains.md`). Nixpacks auto-detects Next.js; `npm start` syncs the schema (`prisma db push`) before serving, so no separate migration step is needed.

> Private by design — this is the paid control plane. Open-core: the SDK, benchmark, and rule library are open in `UltronLabs/Thymus`; this console is not.
