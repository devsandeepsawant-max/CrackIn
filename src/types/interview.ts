/** Shared contracts. Sandeep approves breaking changes; UUIDs and dates are strings. */
export type UUID = string
export type ISODateTime = string
export type SessionStatus = 'draft' | 'analysing' | 'ready' | 'in_progress' | 'completed' | 'failed'
export type QuestionCategory = 'technical' | 'resume_project' | 'behavioural' | 'situational'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Profile {
  id: UUID
  full_name: string
  created_at: ISODateTime
}

export interface Resume {
  id: UUID
  user_id: UUID
  file_path: string
  file_name: string
  extracted_text: string | null
  created_at: ISODateTime
}

export interface JobDescription {
  id: UUID
  user_id: UUID
  title: string
  company: string | null
  description: string
  created_at: ISODateTime
}

export interface MatchAnalysis {
  overall_match_score: number
  matched_skills: Array<{ skill: string; evidence: string }>
  missing_or_unproven_skills: Array<{ skill: string; reason: string }>
  strengths: string[]
  improvement_suggestions: string[]
}

export interface InterviewSession {
  id: UUID
  user_id: UUID
  resume_id: UUID
  job_description_id: UUID
  status: SessionStatus
  match_analysis: MatchAnalysis | null
  created_at: ISODateTime
  updated_at: ISODateTime
}

export interface GeneratedQuestion {
  category: QuestionCategory
  question: string
  difficulty: Difficulty
}

export interface QuestionGenerationResponse { questions: GeneratedQuestion[] }

export interface InterviewQuestion {
  id: UUID
  session_id: UUID
  category: QuestionCategory
  question_text: string
  difficulty: Difficulty
  sort_order: number
}

export const RUBRIC_MAXIMUMS = {
  relevance: 25, accuracy: 25, clarity: 20, examples: 20, completeness: 10,
} as const
export type EvaluationRubric = Record<keyof typeof RUBRIC_MAXIMUMS, number>

export interface AnswerEvaluation {
  overall_score: number
  rubric: EvaluationRubric
  strengths: string[]
  improvements: string[]
  missing_points: string[]
  improved_answer: string
  recommendation: string
}

export interface InterviewAnswer {
  id: UUID
  question_id: UUID
  answer_text: string
  evaluation: AnswerEvaluation | null
  created_at: ISODateTime
}

export interface SessionDetail {
  session: InterviewSession
  resume: Resume
  job_description: JobDescription
  questions: InterviewQuestion[]
  answers: InterviewAnswer[]
}

export interface CreateSessionInput {
  resume_id: UUID
  job_description_id: UUID
}

export interface SubmitAnswerInput {
  session_id: UUID
  question_id: UUID
  answer_text: string
}

export const QUESTION_DISTRIBUTION: Record<QuestionCategory, number> = {
  technical: 4, resume_project: 3, behavioural: 2, situational: 1,
}
