import { Link } from 'react-router-dom'
import { journey } from '../config/workstreams'
import { PageHeading } from '../components/common/UI'

export default function OverviewPage() {
  return <>
    <PageHeading eyebrow="YOUR NEXT CHAPTER STARTS HERE" title="Prepare with a little more confidence." description="Your experience. Your next role. One focused interview journey." />
    <section className="hero-card">
      <div className="hero-copy"><span className="pill">A MORE PERSONAL WAY TO PREPARE</span><h2>Turn your experience<br />into your best answer.</h2><p>Go from resume to role-specific practice, with clear feedback at every step.</p><Link to="/start" className="button light">Explore the candidate flow <span aria-hidden="true">↗</span></Link><span className="hero-footnote">Foundation only · no uploads or AI calls yet</span></div>
      <div className="hero-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="art-card"><span className="art-tag">YOUR NEXT OPPORTUNITY</span><span className="art-symbol">↗</span><span className="art-line" /><span className="art-line short" /><div className="art-check">✓ <span>One step closer.</span></div></div><span className="art-spark spark-one">✦</span><span className="art-spark spark-two">✧</span></div>
    </section>
    <div className="section-heading"><div><p className="eyebrow">FROM CONTEXT TO CONFIDENCE</p><h2>A clear path to a better interview</h2></div><span className="muted text-small">4 connected steps</span></div>
    <div className="journey-grid">{journey.map(step => <Link className="journey-card" to={step.to} key={step.number}><div className="journey-top"><span className="step-icon" aria-hidden="true">{step.icon}</span><span className="step-number">{step.number}</span></div><h3>{step.title}</h3><p>{step.description}</p><span className="card-link">{step.action}<span aria-hidden="true">→</span></span></Link>)}</div>
    <section className="foundation-note" aria-labelledby="foundation-title"><span className="note-symbol" aria-hidden="true">⌁</span><div><h2 id="foundation-title">The foundation is ready for the team.</h2><p>Routes, reusable UI, and shared contracts are in place. Backend, authentication, and AI integrations are not connected.</p></div><Link to="/team" className="text-link">View team handoff <span aria-hidden="true">→</span></Link></section>
  </>
}
