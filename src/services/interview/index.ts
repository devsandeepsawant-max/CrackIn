import type {
  AnswerEvaluation, CreateSessionInput, InterviewAnswer, InterviewQuestion,
  InterviewSession, JobDescription, MatchAnalysis, Resume, SessionDetail,
  SubmitAnswerInput, UUID,
} from '../../types/interview'

/** Adapter boundary. Auth identity must come from the server session, not user input. */
export interface InterviewService {
  uploadResume(file: File, onProgress?: (percent: number) => void): Promise<Resume>
  createJobDescription(input: Pick<JobDescription, 'title' | 'company' | 'description'>): Promise<JobDescription>
  createSession(input: CreateSessionInput): Promise<InterviewSession>
  getSession(sessionId: UUID): Promise<SessionDetail>
  listSessions(): Promise<InterviewSession[]>
  analyseSession(sessionId: UUID): Promise<MatchAnalysis>
  generateQuestions(sessionId: UUID): Promise<InterviewQuestion[]>
  submitAnswer(input: SubmitAnswerInput): Promise<InterviewAnswer>
  evaluateAnswer(answerId: UUID): Promise<AnswerEvaluation>
}

export class ServiceNotConfiguredError extends Error {
  constructor() {
    super('Backend is not connected yet. This foundation preview does not upload, save, or generate AI results.')
    this.name = 'ServiceNotConfiguredError'
  }
}

const notConfigured = async (): Promise<never> => { throw new ServiceNotConfiguredError() }

/** Deliberately fails closed: no fake success, persistence, score, or personal data. */
export const interviewService: InterviewService = {
  uploadResume: notConfigured,
  createJobDescription: notConfigured,
  createSession: notConfigured,
  getSession: notConfigured,
  listSessions: notConfigured,
  analyseSession: notConfigured,
  generateQuestions: notConfigured,
  submitAnswer: notConfigured,
  evaluateAnswer: notConfigured,
}
