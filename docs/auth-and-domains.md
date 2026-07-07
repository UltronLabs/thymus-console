# Auth & domains: capsule (marketing) + console (app)

How the three surfaces fit together, and the exact config to make login on
**getthymus.com** land a user in the **console.getthymus.com** dashboard.

## Topology

```
getthymus.com            capsule   — marketing / landing (this is a separate repo)
console.getthymus.com    console   — the app (this repo; owns Clerk + all auth)
(SDK → console API)       thymus   — the Python SDK; talks to console over x-api-key
```

## The one rule: auth lives only in the console

Capsule has **no Clerk sign-in form and no session logic of its own**. Its CTAs
are plain links into the console's Clerk pages:

```html
<a href="https://console.getthymus.com/sign-in">Login</a>
<a href="https://console.getthymus.com/sign-up">Get started</a>
```

The console already owns the Clerk instance, the Organizations, the
`sign-in`/`sign-up` routes and the dashboard. Duplicating any of that into
capsule means two integrations to keep in sync and cross-domain session bugs.
Keep capsule a dumb, fast marketing site; the console is the only surface that
authenticates.

After sign-in, Clerk sends the user to the dashboard via the fallback-redirect
env var below — there is no custom redirect code to write.

## Clerk setup (production instance)

Custom domains + apex-cookie session sharing are **production-instance** features
(the dev instance is locked to `*.accounts.dev`). This is the same production-
Clerk step already on the deploy checklist — the marketing plan and the deploy
are one milestone, not two.

In the Clerk dashboard, on the **production** instance:

1. Set the application (home) domain to **`getthymus.com`**.
2. Add the Clerk **Frontend API / Account portal** on a subdomain, e.g.
   `clerk.getthymus.com` (Clerk gives you the CNAME records to add).
3. Because the instance is rooted at `getthymus.com`, Clerk sets its session
   cookie on **`.getthymus.com`** (the apex) — so the session is visible to both
   `getthymus.com` and `console.getthymus.com` automatically.
4. Point `afterSignIn` / `afterSignUp` at the console dashboard (see env below).

## Console env (this repo)

Names already used in `.env` — set the **production** values on Railway:

```bash
# Production Clerk keys (from the prod instance, NOT the dev pk_test_/sk_test_)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Auth routes live on the console; absolute URLs so a bounce from anywhere
# (including capsule) lands on the right page, not a dev URL.
NEXT_PUBLIC_CLERK_SIGN_IN_URL=https://console.getthymus.com/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=https://console.getthymus.com/sign-up

# Where Clerk drops the user after auth → the dashboard.
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=https://console.getthymus.com/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=https://console.getthymus.com/

# Webhook signing secret (set once the public URL exists; see clerk-webhooks).
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...
```

## Two versions — start Simple

| Version | Capsule has Clerk? | You get | When |
|---|---|---|---|
| **Simple** | No | Capsule links to console auth. Zero shared-session config. | Ship first. |
| **Polished** | Yes (read-only) | Marketing navbar swaps **Login ↔ Go to dashboard** based on the `.getthymus.com` session. Uses Clerk **satellite domains**. | Add later, only if the "already-logged-in" navbar matters. |

For **Polished**, add capsule as a Clerk **satellite domain** in the dashboard,
install `@clerk/nextjs` there too, and set on capsule:

```bash
NEXT_PUBLIC_CLERK_IS_SATELLITE=true
NEXT_PUBLIC_CLERK_DOMAIN=getthymus.com
NEXT_PUBLIC_CLERK_SIGN_IN_URL=https://console.getthymus.com/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=https://console.getthymus.com/sign-up
```

Capsule then only *reads* the session (to render the navbar); it never creates
one — sign-in still happens on the console.

## Flow

```
getthymus.com (capsule)              console.getthymus.com (console)
   Login / Get started  ───────────▶  Clerk sign-in/up  ──▶  dashboard
        ▲                                                        │
        └──────────── logout returns to marketing ◀─────────────┘
```

## Gotchas

- **Production instance required** for custom domains + apex cookie. Dev keys
  won't share a session across subdomains.
- **Absolute redirect URLs.** Relative `afterSignIn` URLs can resolve to the
  wrong host in a multi-domain setup — use the full `https://console...` form.
- **One Clerk instance, two domains.** Do not stand up a second Clerk app for
  capsule; add capsule as a satellite of the same instance if you go Polished.
- **Webhook still points at the console** (`console.getthymus.com/api/webhooks`),
  not capsule — it syncs users/orgs into the console DB.

## Checklist

- [ ] Create Clerk production instance; home domain `getthymus.com`.
- [ ] Add CNAMEs for `clerk.getthymus.com` (Frontend API).
- [ ] Deploy console to `console.getthymus.com` with the prod env above.
- [ ] Register the Clerk webhook → `console.getthymus.com/api/webhooks`.
- [ ] Build capsule at `getthymus.com`; CTAs link to the console sign-in/up.
- [ ] (Optional, later) add capsule as a satellite domain for the smart navbar.
```
