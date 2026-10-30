# Candidate flow — frontend integration

Owner: Swapnil. Branch: `feature/swapnil-candidate-flow`. PR target: `develop`.

## Implemented

- `/start`: PDF/DOCX file selection and drag/drop, removal, job title, optional
  company, and job-description input. Accessible field errors and error summary.
- Client metadata checks: supported extension, compatible MIME when available,
  non-empty file, and **5 MiB** limit. Title/company maximum 120 characters;
  description maximum 20,000. These are provisional client limits, not server
  security guarantees. Empty and octet-stream MIME values are allowed because
  some browsers do not identify Office files. Santosh must validate file contents,
  MIME, size, and authorization on the server before accepting/storing a file.
- Real service sequence: `uploadResume` → `createJobDescription` → `createSession`
  → navigate to `/sessions/:sessionId/analysis`. No IDs or results are invented.
- Upload progress comes only from the upload adapter. Without progress events,
  the progress bar is indeterminate. Duplicate submissions are locked.
- Confirmed steps are reused for a retry with unchanged inputs, in memory only.
  Input changes invalidate that cache. A failed request can have succeeded
  remotely; server-side idempotency remains necessary to prevent duplicates.
- Session analysis loads through `getSession`. Existing analysis is displayed;
  otherwise the user explicitly requests `analyseSession`. A failed analysis can
  be retried without re-uploading. Refresh reloads persisted service data.
- The analysis view shows score, matched skills and resume evidence, unproven
  evidence, strengths, and suggestions. Invalid/incomplete responses show errors,
  not made-up results. Missing evidence is not labelled as missing ability.
- Preview analysis remains a no-data screen with no network request.

## Important: backend is NOT implemented by this change

The shared `interviewService` still deliberately throws
`ServiceNotConfiguredError`. The form is interactive, but a real session cannot
be saved until Santosh implements the existing adapter and private storage/auth.
No sample analysis is used in application code; fixtures are test-only.

Rishikesh must return validated, evidence-grounded `MatchAnalysis` and persist
it through Santosh's APIs. The frontend guard is not an AI validation service.
No PDF/DOCX text extraction, OCR, authentication, AI generation, or database
migrations are included. Do not enter real candidate data in this preview.

Inputs and the selected file are held only in component memory, not in
localStorage/sessionStorage. Reloading before a confirmed save loses those inputs.
Unmounting ignores late UI updates, but does not cancel server requests:
the existing service interface has no cancellation/idempotency contract.

## Shared-file coordination

- `StagePage.tsx` delegates **only the analysis stage** to the candidate-owned
  analysis component; practice/feedback scaffolds and all route paths are unchanged.
- No global styles, shared types, service interfaces, or adapter implementations
  were changed. Candidate styling is scoped in `components/resume/candidate.css`.
- Package/lockfile additions are development-only testing libraries.

## Verification

Run `npm ci`, `npm run typecheck`, `npm test`, and `npm run build`.
Candidate DOM tests use jsdom + Testing Library with explicitly injected fictional
service fixtures. They cover field/file errors, progress, duplicate submissions,
safe adapter failure, session navigation, loaded analysis, invalid AI responses,
retries, and stale session responses. These are not live backend or AI tests.

Manual preview checks:
1. At `/start`, submit an empty form; check focus moves to the error summary.
2. Select invalid, oversized, empty, PDF and DOCX files; remove/reselect a file.
3. Enter fictional job data and continue: the unconfigured adapter should show
   an honest failure and retain inputs, never a success or fabricated score.
4. Open `/preview/analysis`: no score or sample evidence should appear.
5. Review both screens at mobile width and navigate using the keyboard.

When the backend adapter is ready, repeat with a private test account and
fictional resume; verify authenticated persistence, refresh, analysis retry,
cross-user denial, and real upload progress before marking the full flow done.
