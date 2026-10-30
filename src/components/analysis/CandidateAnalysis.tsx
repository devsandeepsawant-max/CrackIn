import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState, PageHeading } from '../common/UI'
import { interviewService, ServiceNotConfiguredError, type InterviewService } from '../../services/interview'
import type { MatchAnalysis, SessionDetail } from '../../types/interview'
import { isMatchAnalysis, MatchAnalysisView } from './MatchAnalysisView'
import '../resume/candidate.css'

type AnalysisService = Pick<InterviewService, 'getSession' | 'analyseSession'>
type Loaded = { kind: 'ready'; detail: SessionDetail; analysis: MatchAnalysis | null }
type State = { kind: 'loading' } | { kind: 'error'; message: string } | Loaded
const safeError = (error: unknown, fallback: string) => error instanceof ServiceNotConfiguredError ? error.message : fallback

export function CandidateAnalysis({ sessionId, service = interviewService }: { sessionId?: string; service?: AnalysisService }) {
  const [state, setState] = useState<State>({ kind: 'loading' })
  const [reload, setReload] = useState(0)
  const [analysing, setAnalysing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const version = useRef(0)
  const analysisLock = useRef(false)

  useEffect(() => {
    const request = ++version.current
    setState({ kind: 'loading' }); setAnalysing(false); setAnalysisError(null); analysisLock.current = false
    if (!sessionId) return
    void service.getSession(sessionId).then(detail => {
      if (!detail?.session || detail.session.id !== sessionId || !detail.resume || !detail.job_description) throw new Error('Invalid session')
      const analysis = detail.session.match_analysis
      if (analysis !== null && !isMatchAnalysis(analysis)) throw new Error('Invalid analysis')
      if (version.current === request) setState({ kind: 'ready', detail, analysis })
    }).catch(error => {
      if (version.current === request) setState({ kind: 'error', message: safeError(error, 'We could not load this session. It may be unavailable, or you may not have access. Retry or return to candidate intake.') })
    })
    return () => { version.current++ }
  }, [sessionId, service, reload])

  async function analyse() {
    if (!sessionId || state.kind !== 'ready' || analysisLock.current) return
    const request = version.current
    const loaded = state
    analysisLock.current = true; setAnalysing(true); setAnalysisError(null)
    try {
      const analysis = await service.analyseSession(sessionId)
      if (!isMatchAnalysis(analysis)) throw new Error('Invalid analysis')
      if (request === version.current) setState({ ...loaded, analysis })
    } catch (error) {
      if (request === version.current) setAnalysisError(safeError(error, 'Analysis could not be completed or its response was invalid. No score is shown. Retry analysis without uploading your resume again.'))
    } finally {
      if (request === version.current) { analysisLock.current = false; setAnalysing(false) }
    }
  }

  return <div className="candidate-analysis">
    <PageHeading eyebrow="STEP 02 · ROLE ANALYSIS" title="Understand your match." description="Resume evidence and role requirements, brought together." />
    {!sessionId ? <>
      <div className="notice" role="note">Screen preview only. No real candidate session is active.</div>
      <EmptyState title="No analysis available yet" description="Create an interview session to request real analysis. No sample score or fabricated resume evidence is displayed."><Link className="button secondary" to="/start">Candidate intake</Link></EmptyState>
    </> : state.kind === 'loading' ? <LoadingState label="Loading interview session…" /> : state.kind === 'error' ?
      <><ErrorState message={state.message} onRetry={() => setReload(value => value + 1)} /><Link className="button secondary" to="/start">Candidate intake</Link></> : <>
        <div className="analysis-context"><span>Role: <strong>{state.detail.job_description.title}</strong></span><span>Resume: {state.detail.resume.file_name}</span></div>
        {state.analysis ? <MatchAnalysisView analysis={state.analysis} /> : <>
          <div className="notice" role="note">No analysis has been generated for this session. Run analysis to request a service-backed result.</div>
          {analysisError && <div role="alert" className="analysis-error">{analysisError}</div>}
          <section className="panel" aria-busy={analysing}><h2>Ready to analyse your match</h2><p className="muted">Only your session’s supplied resume and job description should be used. The backend is responsible for authentication, validated AI output, and saving results.</p>
            <div className="page-actions"><button type="button" className="button" onClick={analyse} disabled={analysing}>{analysing ? 'Analysing match…' : analysisError ? 'Retry analysis' : 'Analyse match'}</button></div>
            {analysing && <p role="status" aria-live="polite">Analysing your resume and the role. No score is available yet.</p>}
          </section>
        </>}
        <div className="page-actions"><Link className="button secondary" to="/start">New candidate session</Link>
          {state.analysis && <Link className="button" to={`/sessions/${encodeURIComponent(sessionId)}/practice`}>View practice screen</Link>}</div>
      </>}
  </div>
}
