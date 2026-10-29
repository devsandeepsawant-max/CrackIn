# Ownership and handoff

| Owner | Branch | Files/workstream |
| --- | --- | --- |
| Sandeep | feature/sandeep-foundation-integration | App.tsx, layouts, styles.css, types, packages, integration |
| Swapnil | feature/swapnil-candidate-flow | CandidatePage, analysis UI, components/resume and analysis |
| Ammar | feature/ammar-practice-feedback | Practice/feedback/history, components/interview and feedback |
| Santosh | feature/santosh-supabase-backend | services/supabase, migrations, auth, storage, persistence |
| Rishikesh | feature/rishikesh-ai-engine | Supabase AI functions, prompts, runtime JSON validation |
| Nirmal Kumar | feature/nirmal-qa | Test cases, regression evidence, bug reports |
| Vikram | feature/vikram-vercel-deployment | Vercel project/Git wiring, previews, deployment docs |
| Shraddha | feature/shraddha-product-ux-docs | Acceptance criteria, UX/copy review, demo documentation |

Branch from develop only after the foundation is integrated. Owners should
coordinate shared StagePage wrapper changes rather than editing it concurrently.
No automatic assignments or task status synchronization are implemented.

## Foundation acceptance checks

- App starts and production build completes without environment variables.
- All documented routes display meaningful placeholders; unknown routes display 404.
- Deep-link refreshes work on the deployed preview.
- Header explicitly identifies a foundation preview.
- No fake upload, auth, analysis, evaluation, or persistence success.
- Shared contracts and adapter boundary are documented.
- Desktop/mobile navigation works; keyboard focus and skip link are present.
- No secrets, build output, node_modules, or real candidate information committed.

## Next integration order

Foundation → schema/auth/storage APIs → validated AI operations → candidate UI →
practice/feedback/history → end-to-end QA. Work may proceed in parallel against
the contracts. Do not mark a mocked/placeholder workflow as complete.
