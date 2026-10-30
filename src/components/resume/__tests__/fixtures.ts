import { vi } from 'vitest'
import type { InterviewService } from '../../../services/interview'
import type { InterviewSession, JobDescription, MatchAnalysis, Resume, SessionDetail } from '../../../types/interview'

/** Fictional test data only; never used by the application adapter. */
export const resume: Resume = { id: 'resume-test', user_id: 'user-test', file_path: 'private/fictional.pdf', file_name: 'fictional.pdf', extracted_text: null, created_at: '2026-01-01T00:00:00Z' }
export const job: JobDescription = { id: 'job-test', user_id: 'user-test', title: 'Frontend Developer', company: null, description: 'Build accessible React interfaces.', created_at: '2026-01-01T00:00:00Z' }
export const session: InterviewSession = { id: 'session-test', user_id: 'user-test', resume_id: resume.id, job_description_id: job.id, status: 'draft', match_analysis: null, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' }
export const analysis: MatchAnalysis = {
  overall_match_score: 68,
  matched_skills: [{ skill: 'React', evidence: 'Fictional candidate built a reusable component library.' }],
  missing_or_unproven_skills: [{ skill: 'Accessibility', reason: 'No supporting resume evidence found.' }],
  strengths: ['Component design'], improvement_suggestions: ['Describe a measurable project outcome.'],
}
export const detail: SessionDetail = { session, resume, job_description: job, questions: [], answers: [] }
export const resumeFile = (name = 'fictional.pdf', type = 'application/pdf') => new File(['fictional resume content'], name, { type })

export function services() {
  return {
    uploadResume: vi.fn<InterviewService['uploadResume']>().mockResolvedValue(resume),
    createJobDescription: vi.fn<InterviewService['createJobDescription']>().mockResolvedValue(job),
    createSession: vi.fn<InterviewService['createSession']>().mockResolvedValue(session),
    getSession: vi.fn<InterviewService['getSession']>().mockResolvedValue(detail),
    analyseSession: vi.fn<InterviewService['analyseSession']>().mockResolvedValue(analysis),
  }
}
