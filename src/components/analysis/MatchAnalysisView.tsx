import type { MatchAnalysis } from '../../types/interview'

const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every(item => typeof item === 'string' && item.trim().length > 0)
const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null
const entries = (value: unknown, field: 'evidence' | 'reason') => Array.isArray(value) &&
  value.every(item => record(item) && typeof item.skill === 'string' && item.skill.trim() &&
    typeof item[field] === 'string' && (item[field] as string).trim())

/** UI guard only; the server must validate model output before persistence. */
export function isMatchAnalysis(value: unknown): value is MatchAnalysis {
  return record(value) && typeof value.overall_match_score === 'number' &&
    Number.isFinite(value.overall_match_score) && value.overall_match_score >= 0 && value.overall_match_score <= 100 &&
    entries(value.matched_skills, 'evidence') && entries(value.missing_or_unproven_skills, 'reason') &&
    strings(value.strengths) && strings(value.improvement_suggestions)
}

export function MatchAnalysisView({ analysis }: { analysis: MatchAnalysis }) {
  return <div>
    <section className="panel match-score" aria-labelledby="match-heading">
      <span className="score-value">{analysis.overall_match_score}%</span>
      <div><h2 id="match-heading">Resume-to-role match</h2><p className="muted">Service-provided analysis, not a prediction of hiring success.</p>
        <meter min={0} max={100} value={analysis.overall_match_score} aria-label="Overall resume-to-role match" /></div>
    </section>
    <div className="result-grid">
      <section className="panel"><h2>Matched skills</h2><p className="muted">Evidence reported from the supplied resume.</p>
        {analysis.matched_skills.length ? <ul className="result-list">{analysis.matched_skills.map((item, index) =>
          <li key={index}><strong>{item.skill}</strong><p>{item.evidence}</p></li>)}</ul> : <p>No supported skill matches were returned.</p>}</section>
      <section className="panel"><h2>Missing or unproven evidence</h2><p className="muted">Missing resume evidence does not mean you lack the ability.</p>
        {analysis.missing_or_unproven_skills.length ? <ul className="result-list">{analysis.missing_or_unproven_skills.map((item, index) =>
          <li key={index}><strong>{item.skill}</strong><p>{item.reason}</p></li>)}</ul> : <p>No evidence gaps were returned.</p>}</section>
      <section className="panel"><h2>Your strengths</h2>
        {analysis.strengths.length ? <ul className="result-list">{analysis.strengths.map((text, index) => <li key={index}>{text}</li>)}</ul> : <p>No strengths were returned.</p>}</section>
      <section className="panel"><h2>Suggested improvements</h2>
        {analysis.improvement_suggestions.length ? <ul className="result-list">{analysis.improvement_suggestions.map((text, index) => <li key={index}>{text}</li>)}</ul> : <p>No improvement suggestions were returned.</p>}</section>
    </div>
  </div>
}
