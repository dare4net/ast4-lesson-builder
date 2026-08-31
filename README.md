# After-school.tech lesson builder

Next.js app for authoring lessons and the student / tutor dashboards. Domain data (wallet, missions, pride, interactions) lives on the Express API in `afterschool-tech-backend`.

## Setup

Use **pnpm** only. Do not add an npm lockfile.

```bash
pnpm install
cp .env.example .env.local
```

Fill `JWT_SECRET` with the same value as the backend. Point `NEXT_PUBLIC_API_URL` at `http://localhost:5001/api` for local work.

In a second terminal, start the API (`afterschool-tech-backend`: copy `.env.example` → `.env`, then `npm install` and `npm run dev`).

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
pnpm typecheck
pnpm lint
pnpm test
```

Env is validated on boot (`lib/env.ts` via `instrumentation.ts`). Missing `JWT_SECRET` fails closed.

## Architecture

Do not invent a new order. Execute against:

| File | Role |
|------|------|
| [`../IMPLEMENTATION_ORDER.md`](../IMPLEMENTATION_ORDER.md) | Numbered A–G checklist (this repo + the backend) |
| [`platform_architecture_audit.md`](./platform_architecture_audit.md) | Why gamification used to fail (dual viewer, ephemeral state) |
| [`ui_ux_audit.md`](./ui_ux_audit.md) | Tokens, a11y, renderer polish |
| [`docs/adr/`](./docs/adr/) | Service boundary, lesson identity, server state |

Express owns domain data. This app owns session cookies, the viewer, and media upload routes. The frontend never opens Mongo for product traffic.

## Sounds

Drop MP3s in `/public/sounds` (`correct`, `incorrect`, `click`, `complete`, `levelUp`, `streak`). Missing files fall back to hosted / synthesized audio.
