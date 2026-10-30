import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeading } from '../components/common/UI'
import { interviewService, ServiceNotConfiguredError } from '../services/interview'
import {
  CANDIDATE_LIMITS, RESUME_ACCEPT, createCandidateSession, validateCandidate, validateResume,
  type CandidateDraft, type CandidateErrors, type CandidateInput, type CandidateService, type CandidateStep,
} from '../components/resume/candidateFlow'
import '../components/resume/candidate.css'

const stepLabels: Record<CandidateStep, string> = { upload: 'Uploading resume', job: 'Saving job description', session: 'Creating interview session' }
const fieldIds = { file: 'resume-file', title: 'job-title', company: 'company', description: 'job-description' }

export default function CandidatePage({ service = interviewService }: { service?: CandidateService }) {
  const navigate = useNavigate()
  const [input, setInput] = useState<CandidateInput>({ file: null, title: '', company: '', description: '' })
  const [errors, setErrors] = useState<CandidateErrors>({})
  const [failure, setFailure] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [step, setStep] = useState<CandidateStep>('upload')
  const [progress, setProgress] = useState<number | undefined>()
  const draft = useRef<CandidateDraft>({})
  const submitting = useRef(false)
  const mounted = useRef(true)
  const fileControl = useRef<HTMLInputElement>(null)
  const errorSummary = useRef<HTMLDivElement>(null)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])

  function change<K extends keyof CandidateInput>(field: K, value: CandidateInput[K]) {
    setInput(previous => ({ ...previous, [field]: value }))
    setErrors(previous => ({ ...previous, [field]: undefined }))
    setFailure(null)
    draft.current = {}
  }
  function chooseFile(file: File | null) {
    const message = validateResume(file)
    change('file', message ? null : file)
    if (message) setErrors(previous => ({ ...previous, file: message }))
  }
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (submitting.current) return
    const validation = validateCandidate(input)
    setErrors(validation)
    if (Object.keys(validation).length) {
      setFailure(null)
      queueMicrotask(() => errorSummary.current?.focus())
      return
    }
    submitting.current = true
    setBusy(true); setFailure(null); setProgress(undefined)
    try {
      const session = await createCandidateSession(service, input, draft.current, {
        onStep: value => { if (mounted.current) setStep(value) },
        onProgress: value => {
          if (mounted.current && Number.isFinite(value)) setProgress(Math.min(100, Math.max(0, value)))
        },
      })
      if (mounted.current) navigate(`/sessions/${encodeURIComponent(session.id)}/analysis`)
    } catch (error) {
      if (mounted.current) {
        setFailure(error instanceof ServiceNotConfiguredError
          ? error.message
          : 'We could not finish creating your session. Your inputs are still here; retry to continue confirmed steps. Earlier steps may already have been saved.')
        queueMicrotask(() => errorSummary.current?.focus())
      }
    } finally {
      submitting.current = false
      if (mounted.current) setBusy(false)
    }
  }

  return <div className="candidate-flow">
    <PageHeading eyebrow="STEP 01 · CANDIDATE CONTEXT" title="Start with your story." description="Add your resume and target role to prepare a personalised interview session." />
    <div className="notice" role="note"><strong>Upload not connected · Backend integration pending.</strong> Selecting a file does not upload it. The current adapter cannot save sessions or generate analysis. Use fictional data only.</div>
    <form noValidate onSubmit={submit} aria-busy={busy}>
      {(Object.values(errors).some(Boolean) || failure) && <div className={failure ? 'submission-error' : 'validation-summary'} role="alert" tabIndex={-1} ref={errorSummary}>
        <h2>{failure ? 'Unable to continue' : 'Check your details'}</h2>
        {failure ? <p>{failure}</p> : <ul>{(Object.entries(errors) as [keyof CandidateInput, string][]).filter(([, message]) => message).map(([field, message]) =>
          <li key={field}><a href={`#${fieldIds[field]}`}>{message}</a></li>)}</ul>}
      </div>}
      <fieldset disabled={busy}>
        <legend className="sr-only">Resume and target job</legend>
        <div className="two-column">
          <section className="panel" aria-labelledby="resume-heading">
            <span className="section-index">01</span><h2 id="resume-heading">Your resume</h2>
            <p className="muted">Choose a text-based PDF or DOCX, up to 5 MiB. Scanned PDF OCR is not part of this MVP.</p>
            <div className="upload-zone" onDragOver={event => event.preventDefault()} onDrop={event => {
              event.preventDefault()
              if (submitting.current) return
              if (event.dataTransfer.files.length !== 1) {
                change('file', null)
                if (fileControl.current) fileControl.current.value = ''
                setErrors(previous => ({ ...previous, file: 'Drop one resume at a time.' }))
                return
              }
              if (fileControl.current) fileControl.current.value = ''
              chooseFile(event.dataTransfer.files[0])
            }}>
              <label htmlFor="resume-file">Choose your resume</label>
              <input id="resume-file" ref={fileControl} type="file" accept={RESUME_ACCEPT}
                aria-required="true" aria-invalid={!!errors.file} aria-describedby={`resume-help${errors.file ? ' resume-error' : ''}`}
                onChange={event => chooseFile(event.target.files?.[0] ?? null)} />
              <p id="resume-help" className="field-help">Or drag and drop one PDF or DOCX here. The file stays in this page until you continue.</p>
            </div>
            {errors.file && <p className="field-error" id="resume-error">{errors.file}</p>}
            {input.file && <div className="selected-file"><div><strong>{input.file.name}</strong><span>{(input.file.size / 1024).toFixed(1)} KiB · {draft.current.resume ? 'Upload confirmed for this draft' : 'Selected, not uploaded'}</span></div>
              <button type="button" className="button secondary" onClick={() => { change('file', null); if (fileControl.current) fileControl.current.value = '' }}>Remove resume</button></div>}
            <p className="privacy-note">Do not include sensitive personal information while backend integration is pending. This form does not use browser storage.</p>
          </section>
          <section className="panel" aria-labelledby="job-heading">
            <span className="section-index">02</span><h2 id="job-heading">The opportunity</h2>
            <p className="muted">Use the actual job description so future analysis can distinguish resume evidence from unproven skills.</p>
            <label htmlFor="job-title">Job title <span aria-hidden="true">*</span></label>
            <input id="job-title" required maxLength={CANDIDATE_LIMITS.title} value={input.title} placeholder="e.g. Frontend Developer"
              aria-invalid={!!errors.title} aria-describedby={errors.title ? 'title-error' : undefined} onChange={event => change('title', event.target.value)} />
            {errors.title && <p id="title-error" className="field-error">{errors.title}</p>}
            <label htmlFor="company">Company <span className="muted">(optional)</span></label>
            <input id="company" maxLength={CANDIDATE_LIMITS.company} value={input.company} placeholder="Company name"
              aria-invalid={!!errors.company} aria-describedby={errors.company ? 'company-error' : undefined} onChange={event => change('company', event.target.value)} />
            {errors.company && <p id="company-error" className="field-error">{errors.company}</p>}
            <label htmlFor="job-description">Job description <span aria-hidden="true">*</span></label>
            <textarea id="job-description" required maxLength={CANDIDATE_LIMITS.description} value={input.description} rows={8}
              placeholder="Paste the role responsibilities, requirements, and preferred skills…"
              aria-invalid={!!errors.description} aria-describedby={`description-help${errors.description ? ' description-error' : ''}`}
              onChange={event => change('description', event.target.value)} />
            <p id="description-help" className="field-help">{input.description.length.toLocaleString()} / 20,000 characters. Required fields are marked *.</p>
            {errors.description && <p id="description-error" className="field-error">{errors.description}</p>}
          </section>
        </div>
      </fieldset>
      {busy && <div role="status" aria-live="polite" className="flow-status">
        {stepLabels[step]}{step === 'upload' && progress !== undefined ? ` · ${Math.round(progress)}%` : '…'}
        {step === 'upload' && <progress max={100} value={progress} aria-label="Resume upload progress" />}
      </div>}
      <div className="page-actions"><Link className="button secondary" to="/">Back to overview</Link>
        <button type="submit" className="button" disabled={busy}>{busy ? 'Preparing session…' : failure ? 'Retry session creation' : 'Continue to analysis'}</button></div>
    </form>
  </div>
}
