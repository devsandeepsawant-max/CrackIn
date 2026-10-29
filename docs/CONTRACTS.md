# Shared contracts — v0.1

Source of truth: `src/types/interview.ts`. Service boundary:
`src/services/interview/index.ts`. Sandeep approves contract changes.

- IDs: UUID strings supplied by backend. Dates: ISO-8601 UTC strings.
- Runtime validation is required at the backend/AI boundary; TypeScript alone
  does not validate remote JSON. Rishikesh owns AI response validation.
- `Resume`, `JobDescription`, `InterviewSession`, `InterviewQuestion`, and
  `InterviewAnswer` represent persisted entities, not generated previews.
- Entity table mapping: profiles, resumes, job_descriptions, interview_sessions,
  interview_questions, interview_answers.
- `file_path` is a private storage path, never a permanently public resume URL.
  `file_name` is display metadata. `extracted_text` may be null before extraction.
- Ownership derives from authenticated server identity. Never trust a browser
  user_id as an authorization decision. RLS and private storage remain mandatory.
- Match analysis fields follow the pack's snake_case JSON contract. Missing
  evidence does not prove missing ability. Scores range from 0 to 100.
- Generation returns `{ questions: [{ category, question, difficulty }] }`.
  Categories: technical (4), resume_project (3), behavioural (2), situational (1).
  Santosh/Rishikesh map generated `question` to persisted `question_text`,
  allocate IDs, session_id, and sort_order. UI uses `InterviewQuestion`.
- Evaluation rubric maxima: relevance 25, accuracy 25, clarity 20, examples 20,
  completeness 10. Each score is within its maximum; overall_score is their sum.
- `SubmitAnswerInput` includes session_id and question_id. Backend must verify
  they are related and belong to the authenticated user.
- Suggested state progression: draft → analysing → ready → in_progress →
  completed; processing failures → failed. Backend owns allowed transitions.
- Service methods reject with an Error on failure. The current adapter always
  throws `ServiceNotConfiguredError`; it must not simulate success.
- Upload size limits, auth provider, retry/idempotency behavior, polling,
  pagination, and final endpoint paths are backend decisions still to agree.
  Do not implement competing contracts in separate screens.

## Service ownership

| Method | Owner | Return |
| --- | --- | --- |
| uploadResume | Santosh + Rishikesh extraction | Resume |
| createJobDescription | Santosh | JobDescription |
| createSession | Santosh | InterviewSession |
| getSession | Santosh | SessionDetail |
| listSessions | Santosh | InterviewSession[] |
| analyseSession | Rishikesh + Santosh persistence | MatchAnalysis |
| generateQuestions | Rishikesh + Santosh persistence | InterviewQuestion[] |
| submitAnswer | Santosh | InterviewAnswer |
| evaluateAnswer | Rishikesh + Santosh persistence | AnswerEvaluation |

No HTTP endpoint URLs are invented here. Implement the agreed adapter once
backend endpoints exist; views should not call AI providers directly.
