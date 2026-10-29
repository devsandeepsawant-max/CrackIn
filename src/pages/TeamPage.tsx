import { workstreams } from '../config/workstreams'
import { PageHeading } from '../components/common/UI'

export default function TeamPage() {
  return <>
    <PageHeading eyebrow="ONE TEAM · ONE CONNECTED JOURNEY" title="A shared starting point." description="Clear boundaries so everyone can build in parallel without stepping on shared files." />
    <div className="notice" role="note">Static foundation handoff, not a live task tracker. Coordinate status updates with the workstream owner.</div>
    <div className="team-grid">{workstreams.map(item => <section className="panel team-card" key={item.owner}><div className="team-card-heading"><span className="avatar" aria-hidden="true">{item.owner.split(' ').map(s => s[0]).join('')}</span><div><h2>{item.owner}</h2><p className="muted text-small">{item.role}</p></div></div><p>{item.area}</p><span className="status-label">{item.status}</span><code className="branch-name">{item.branch}</code></section>)}</div>
    <section className="panel integration-panel"><h2>Integration agreement</h2><p>Branch from <code>develop</code>. Open a PR back into <code>develop</code>. Sandeep reviews routing, global styles, package configuration, and shared contract changes. Keep <code>main</code> for the stable release.</p><p className="muted">Vercel previews are deployment targets; Vercel’s “Development” environment is for local tooling. Configure develop and feature branches as Preview, with main as Production. See README and docs/DEPLOYMENT.md.</p></section>
  </>
}
