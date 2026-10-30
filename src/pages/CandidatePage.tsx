import { Link } from 'react-router-dom'
import { PageHeading } from '../components/common/UI'

export default function CandidatePage() {
  return <>
    <PageHeading eyebrow="STEP 01 · CANDIDATE CONTEXT" title="Start with your story." description="The candidate intake screen will connect your resume with the role you’re working towards." />
    <div className="notice" role="note">Foundation placeholder · Upload, validation, and session creation are not implemented. Please do not enter personal information.</div>
    <div className="two-column">
      <section className="panel"><span className="section-index">01</span><h2>Your resume</h2><p className="muted">PDF and DOCX support will be implemented by Swapnil, with private storage from Santosh.</p><div className="upload-placeholder"><span aria-hidden="true">↥</span><strong>Resume upload coming next</strong><p>No file is uploaded or stored in this preview.</p><button className="button secondary" disabled>Upload not connected</button></div></section>
      <section className="panel"><span className="section-index">02</span><h2>The opportunity</h2><p className="muted">Job title, company, and a job description will feed the shared session contract.</p><label htmlFor="job-description">Job description</label><textarea id="job-description" disabled placeholder="Job description form coming next" rows={8} /><p className="text-small muted">Owner: Swapnil · API: InterviewService</p></section>
    </div>
    <div className="page-actions"><Link className="button secondary" to="/">Back to overview</Link><button className="button" disabled>Analyse match · backend required</button></div>
  </>
}
