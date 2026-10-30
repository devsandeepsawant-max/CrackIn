import { Link, useParams } from 'react-router-dom'
import { EmptyState, PageHeading } from '../components/common/UI'

export type Stage = 'analysis' | 'practice' | 'feedback'
const stages = {
  analysis: { step: '02', title: 'Understand your match.', description: 'Resume evidence and role requirements, brought together.', empty: 'No analysis available yet', detail: 'Swapnil owns this screen. Rishikesh will provide validated match analysis through the shared service contract. No score has been generated.', contract: 'MatchAnalysis', next: '/preview/practice', action: 'Preview practice screen' },
  practice: { step: '03', title: 'Make your next answer stronger.', description: 'Personalised questions grounded in your resume and target role.', empty: 'No interview questions yet', detail: 'Ammar owns this screen. Rishikesh will generate 10 questions: 4 technical, 3 resume/project, 2 behavioural, and 1 situational.', contract: 'InterviewQuestion · SubmitAnswerInput', next: '/preview/feedback', action: 'Preview feedback screen' },
  feedback: { step: '04', title: 'See your next step clearly.', description: 'Specific feedback, a consistent rubric, and a useful way forward.', empty: 'No answer evaluation yet', detail: 'Ammar owns this screen. The AI adapter will return relevance, accuracy, clarity, examples, and completeness scores. No evaluation has been generated.', contract: 'AnswerEvaluation', next: '/history', action: 'View session history' },
} as const

export default function StagePage({ stage }: { stage: Stage }) {
  const content = stages[stage]
  const { sessionId } = useParams()
  return <>
    <PageHeading eyebrow={`STEP ${content.step} · ${stage.toUpperCase()}`} title={content.title} description={content.description} />
    <div className="notice" role="note">{sessionId ? 'Session route scaffold only. This ID has not been loaded or verified.' : 'Screen preview only. No real candidate session is active.'}</div>
    <EmptyState title={content.empty} description={content.detail}><Link className="button secondary" to="/start">Candidate intake</Link><Link className="text-link" to={content.next}>{content.action} →</Link></EmptyState>
    <div className="contract-note"><span>Shared contract</span><code>{content.contract}</code><span>src/types/interview.ts</span></div>
  </>
}
