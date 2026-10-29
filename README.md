# CrackIn

AI-powered interview preparation: resume → job match → questions → answers → feedback.

## Foundation status

This is Sandeep's **foundation preview**, not a working AI MVP. Routing, layout,
responsive shared UI, error/loading/empty states, TypeScript contracts, and adapter
boundaries are implemented. Uploads, authentication, AI calls, and persistence are
deliberately disabled. No fake AI scores or saved sessions are shown.

## Run locally

Use Node.js 22.12+ (Node 24 LTS recommended).

```sh
npm ci
npm run dev
```

No environment variables are required for the skeleton. Copy `.env.example` to
`.env.local` only when configuring Supabase. Never commit environment values.

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

Vite prints the local development/preview URL. The production output is `dist/`.

## Routes

| Route | Purpose | Owner |
| --- | --- | --- |
| `/` | Workspace overview and journey entry points | Sandeep |
| `/start` | Resume/JD intake scaffold | Swapnil |
| `/preview/analysis` | No-data analysis scaffold | Swapnil |
| `/preview/practice` | No-data practice scaffold | Ammar |
| `/preview/feedback` | No-data evaluation scaffold | Ammar |
| `/sessions/:sessionId/analysis` | Future real-session analysis | Swapnil |
| `/sessions/:sessionId/practice` | Future real-session questions | Ammar |
| `/sessions/:sessionId/feedback` | Future real-session evaluation | Ammar |
| `/history` | Session history scaffold | Ammar |
| `/team` | Static ownership/handoff reference | Sandeep |
| All other paths | Accessible not-found page | Sandeep |

Session routes currently do not fetch or verify IDs. Do not interpret them as an
existing or authenticated session. `vercel.json` enables deep-link refreshes.

## Structure and shared ownership

```text
src/
  components/common/        reusable UI, loading/errors, error boundary (Sandeep)
  components/resume/        candidate components (Swapnil)
  components/analysis/      analysis components (Swapnil)
  components/interview/     practice components (Ammar)
  components/feedback/      feedback components (Ammar)
  config/workstreams.ts    static ownership and journey map
  layouts/                 shared shell (Sandeep)
  pages/                   route entry points; see table
  hooks/                   shared hooks when needed
  services/interview/      typed adapter boundary
  services/supabase/       backend configuration and future data access (Santosh)
  types/interview.ts       shared contracts (Sandeep approval required)
  utils/                   shared utilities when needed
supabase/
  migrations/              schema/RLS (Santosh)
  functions/               server-side AI implementations (Rishikesh)
docs/
  CONTRACTS.md
  DEPLOYMENT.md
  TEAM.md
```

Empty ownership folders contain `.gitkeep`. Split `StagePage.tsx` into
owner-specific components before parallel feature work; coordinate its shared
route wrapper with Sandeep. Do not simultaneously edit shared styles, routing,
types, or package configuration.

## GitHub collaboration

Repository: https://github.com/devsandeepsawant-max/CrackIn

- `main`: stable release, only promoted after review and end-to-end QA.
- `develop`: shared integration branch.
- `feature/sandeep-foundation-integration`: foundation implementation.
- Each teammate creates their named branch from **develop after the foundation
  PR is merged**. Open PRs into develop; Sandeep reviews before merging.
- Do not force-push shared branches, commit secrets, or upload node_modules/dist.

GitHub web workflow: branch selector → create/select your feature branch from
develop → edit/upload owned files → Commit changes to that feature branch →
Pull requests → New pull request → base `develop` → request Sandeep review.
See `docs/TEAM.md` for branches. Branch protections and reviewer requirements
must be configured by a repository administrator; this skeleton does not enforce them.

## Deployment

See `docs/DEPLOYMENT.md`. Use **Vercel Preview** for develop and feature branches,
not Production. `vercel.json` does not create or link a Vercel project by itself.
The team must verify a READY preview URL before calling deployment complete.

## Security boundary

Only intentionally public Supabase client configuration may use `VITE_`.
Do not put OpenAI or Supabase service-role secrets in the frontend, committed
files, or chat. Keep them in Supabase Edge Function secrets/server-only settings.
The frontend skeleton does not implement authentication, RLS, or private storage.
