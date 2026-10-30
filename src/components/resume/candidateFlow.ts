import { ServiceNotConfiguredError, type InterviewService } from '../../services/interview'
import type { InterviewSession, JobDescription, Resume } from '../../types/interview'

/** Provisional client limits. Santosh must enforce and confirm them server-side. */
export const CANDIDATE_LIMITS = { fileBytes: 5 * 1024 * 1024, title: 120, company: 120, description: 20_000 } as const
export const RESUME_ACCEPT = '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
export interface CandidateInput { file: File | null; title: string; company: string; description: string }
export type CandidateErrors = Partial<Record<keyof CandidateInput, string>>
export type CandidateService = Pick<InterviewService, 'uploadResume' | 'createJobDescription' | 'createSession'>
export type CandidateStep = 'upload' | 'job' | 'session'

export function validateResume(file: Pick<File, 'name' | 'type' | 'size'> | null): string | undefined {
  if (!file) return 'Choose a PDF or DOCX resume.'
  if (file.size === 0) return 'This file is empty. Choose another resume.'
  if (file.size > CANDIDATE_LIMITS.fileBytes) return 'Your resume must be 5 MiB or smaller.'
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (extension !== 'pdf' && extension !== 'docx') return 'Only PDF and DOCX resumes are supported.'
  const expected = extension === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  if (file.type && file.type !== 'application/octet-stream' && file.type !== expected) {
    return 'The file type does not match its extension. Choose an original PDF or DOCX.'
  }
}

export function validateCandidate(input: CandidateInput): CandidateErrors {
  const errors: CandidateErrors = {}
  const fileError = validateResume(input.file)
  if (fileError) errors.file = fileError
  if (!input.title.trim()) errors.title = 'Enter the job title.'
  else if (input.title.trim().length > CANDIDATE_LIMITS.title) errors.title = 'Keep the job title to 120 characters.'
  if (input.company.trim().length > CANDIDATE_LIMITS.company) errors.company = 'Keep the company name to 120 characters.'
  if (!input.description.trim()) errors.description = 'Paste the job description.'
  else if (input.description.trim().length > CANDIDATE_LIMITS.description) errors.description = 'Keep the job description to 20,000 characters.'
  return errors
}

export interface CandidateDraft {
  input?: CandidateInput
  resume?: Resume
  job?: JobDescription
  session?: InterviewSession
}

export class CandidateValidationError extends Error {
  constructor(public readonly errors: CandidateErrors) { super('Check the candidate form.'); this.name = 'CandidateValidationError' }
}

export class CandidateFlowError extends Error {
  constructor(public readonly step: CandidateStep) {
    super({ upload: 'The resume upload could not be confirmed.', job: 'The job description could not be saved.', session: 'The interview session could not be created.' }[step])
    this.name = 'CandidateFlowError'
  }
}

/** Real service calls only. Keep confirmed steps in memory for a same-input retry. */
export async function createCandidateSession(
  service: CandidateService,
  input: CandidateInput,
  draft: CandidateDraft,
  callbacks: { onStep?: (step: CandidateStep) => void; onProgress?: (percent: number) => void } = {},
): Promise<InterviewSession> {
  const errors = validateCandidate(input)
  if (Object.keys(errors).length) throw new CandidateValidationError(errors)
  const normalized = { ...input, title: input.title.trim(), company: input.company.trim(), description: input.description.trim() }
  const previous = draft.input
  if (!previous || previous.file !== normalized.file || previous.title !== normalized.title ||
      previous.company !== normalized.company || previous.description !== normalized.description) {
    delete draft.resume; delete draft.job; delete draft.session
    draft.input = normalized
  }
  let step: CandidateStep = 'upload'
  try {
    if (!draft.resume) {
      callbacks.onStep?.(step)
      const resume = await service.uploadResume(normalized.file!, callbacks.onProgress)
      if (!resume?.id) throw new Error('Invalid resume response')
      draft.resume = resume
    }
    step = 'job'
    if (!draft.job) {
      callbacks.onStep?.(step)
      const job = await service.createJobDescription({
        title: normalized.title, company: normalized.company || null, description: normalized.description,
      })
      if (!job?.id) throw new Error('Invalid job response')
      draft.job = job
    }
    step = 'session'
    if (!draft.session) {
      callbacks.onStep?.(step)
      const session = await service.createSession({ resume_id: draft.resume.id, job_description_id: draft.job.id })
      if (!session?.id) throw new Error('Invalid session response')
      draft.session = session
    }
    return draft.session
  } catch (error) {
    if (error instanceof ServiceNotConfiguredError) throw error
    throw new CandidateFlowError(step)
  }
}
