# Vercel team preview

## Scope

This skeleton is deployable without Supabase or AI configuration. It is not a
working interview product. No production deployment is required for team review.

Vercel **Preview** is the hosted environment for develop/feature branches.
Vercel **Development** is primarily configuration for local development tooling;
it is not the branch preview URL teammates open.

## Project setup — Vikram / Sandeep

1. Import `devsandeepsawant-max/CrackIn` into the intended Vercel account/team.
   Grant the Vercel GitHub App access to this repository if necessary.
2. Select Vite, repository root, Node 24 LTS (or supported Node >=22.12),
   install `npm ci`, build `npm run build`, output `dist`.
3. Keep production branch `main`. Enable previews for develop and feature branches.
   Avoid changing production domains or promoting a preview for this task.
4. Deploy `feature/sandeep-foundation-integration` as **Preview**, or trigger its
   preview through the Git integration. Review branch+commit in deployment details.
5. Share the actual READY deployment URL in the PR and team channel. If protection
   is enabled, grant teammate access using the Vercel team's access controls;
   do not disable protection globally merely to bypass an access error.

`vercel.json` supplies Vite build/output settings and SPA deep-link fallback.
It does not import the GitHub repository, create branches, or enforce access.

## Environment

No variables are needed for the skeleton. Later add VITE_SUPABASE_URL and
VITE_SUPABASE_ANON_KEY to the relevant Preview environment. Client-side Vite
values enter the browser bundle. Do not put server secrets here or in VITE_ names.
Keep OPENAI_API_KEY and SUPABASE_SERVICE_ROLE_KEY in Supabase Edge Function
secrets (or a deliberately server-only runtime). Never print their values.

## Preview verification

- Deployment reports READY, correct Git branch, and correct commit.
- Open `/`, `/start`, `/preview/analysis`, `/preview/practice`,
  `/preview/feedback`, `/history`, and `/team`.
- Open `/sessions/test-id/analysis` directly and refresh: scaffold, not a real session.
- Refresh each deep link and confirm scripts/styles load (SPA rewrite).
- Unknown paths display the not-found UI.
- Test keyboard navigation, mobile width, and teammate access.
- Confirm placeholder notice and no fake scores, auth, uploads, or persistence.

If build fails, read Vercel build logs, fix the feature branch, and verify the
new deployment. To roll back preview, redeploy a known-good commit to Preview;
do not promote it to Production as a workaround.

## Not yet verified

Creating these files is not proof of a Vercel deployment. Record the real preview
URL and verification evidence only after Vercel reports success and the deployed
pages pass the checks above.
