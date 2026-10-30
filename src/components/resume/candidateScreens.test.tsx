// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom'
import CandidatePage from '../../pages/CandidatePage'
import { CandidateAnalysis } from '../analysis/CandidateAnalysis'
import { analysis, detail, resume, resumeFile, services, session } from './__tests__/fixtures'
import type { Resume, SessionDetail } from '../../types/interview'

afterEach(cleanup)

function fillIntake() {
  fireEvent.change(screen.getByLabelText('Choose your resume'), { target: { files: [resumeFile()] } })
  fireEvent.change(screen.getByRole('textbox', { name: 'Job title' }), { target: { value: 'Frontend Developer' } })
  fireEvent.change(screen.getByRole('textbox', { name: 'Job description' }), { target: { value: 'Build accessible React interfaces.' } })
}

describe('candidate intake interactions', () => {
  it('shows field errors, focuses the summary and blocks invalid submission', async () => {
    const service = services()
    render(<MemoryRouter><CandidatePage service={service} /></MemoryRouter>)
    await userEvent.click(screen.getByRole('button', { name: 'Continue to analysis' }))
    expect(screen.getByRole('alert').textContent).toContain('Choose a PDF or DOCX resume.')
    expect(document.activeElement).toBe(screen.getByRole('alert'))
    expect(service.uploadResume).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox', { name: 'Job description' }).getAttribute('aria-invalid')).toBe('true')
  })
  it('rejects an invalid selection and allows selecting and removing a supported file', async () => {
    const user = userEvent.setup({ applyAccept: false })
    render(<MemoryRouter><CandidatePage /></MemoryRouter>)
    const input = screen.getByLabelText('Choose your resume')
    await user.upload(input, resumeFile('portrait.png', 'image/png'))
    expect(screen.getByRole('link', { name: 'Only PDF and DOCX resumes are supported.' })).toBeTruthy()
    await user.upload(input, resumeFile())
    expect(screen.getByText('fictional.pdf')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Remove resume' }))
    expect(screen.queryByText('fictional.pdf')).toBeNull()
  })
  it('rejects a multi-file drop without silently retaining a previous resume', async () => {
    const service = services()
    render(<MemoryRouter><CandidatePage service={service} /></MemoryRouter>)
    fillIntake()
    fireEvent.drop(screen.getByText(/Or drag and drop/).parentElement!, { dataTransfer: { files: [resumeFile('one.pdf'), resumeFile('two.pdf')] } })
    expect(screen.getByRole('alert').textContent).toContain('Drop one resume at a time.')
    expect(screen.queryByText('fictional.pdf')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Continue to analysis' }))
    expect(service.uploadResume).not.toHaveBeenCalled()
  })
  it('retains the form after the real adapter reports backend-not-configured', async () => {
    render(<MemoryRouter><CandidatePage /></MemoryRouter>)
    fillIntake()
    await userEvent.click(screen.getByRole('button', { name: 'Continue to analysis' }))
    expect((await screen.findByRole('alert')).textContent).toContain('Backend is not connected yet')
    expect((screen.getByRole('textbox', { name: 'Job title' }) as HTMLInputElement).value).toBe('Frontend Developer')
    expect(screen.getByText('fictional.pdf')).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Retry session creation' }) as HTMLButtonElement).disabled).toBe(false)
  })
  it('locks duplicate submits, shows only adapter-reported upload progress, and navigates after session creation', async () => {
    const service = services()
    let resolveUpload!: (value: Resume) => void
    let report!: (percent: number) => void
    service.uploadResume.mockImplementationOnce((_file, onProgress) => {
      report = onProgress!
      return new Promise(resolve => { resolveUpload = resolve })
    })
    render(<MemoryRouter initialEntries={['/start']}><Routes>
      <Route path="/start" element={<CandidatePage service={service} />} />
      <Route path="/sessions/:sessionId/analysis" element={<p>Session analysis opened</p>} />
    </Routes></MemoryRouter>)
    fillIntake()
    const form = screen.getByRole('button', { name: 'Continue to analysis' }).closest('form')!
    fireEvent.submit(form); fireEvent.submit(form)
    expect(service.uploadResume).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('progressbar').hasAttribute('value')).toBe(false)
    act(() => report(37))
    expect(screen.getByRole('progressbar').getAttribute('value')).toBe('37')
    expect((screen.getByRole('button', { name: 'Preparing session…' }) as HTMLButtonElement).disabled).toBe(true)
    await act(async () => resolveUpload(resume))
    expect(await screen.findByText('Session analysis opened')).toBeTruthy()
    expect(service.createSession).toHaveBeenCalledExactlyOnceWith({ resume_id: 'resume-test', job_description_id: 'job-test' })
  })
  it('connects the complete UI journey using explicitly injected test services', async () => {
    const service = services()
    function AnalysisRoute() { const { sessionId } = useParams(); return <CandidateAnalysis sessionId={sessionId} service={service} /> }
    render(<MemoryRouter initialEntries={['/start']}><Routes>
      <Route path="/start" element={<CandidatePage service={service} />} />
      <Route path="/sessions/:sessionId/analysis" element={<AnalysisRoute />} />
    </Routes></MemoryRouter>)
    fillIntake()
    await userEvent.click(screen.getByRole('button', { name: 'Continue to analysis' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Analyse match' }))
    expect(await screen.findByText('68%')).toBeTruthy()
    expect(service.getSession).toHaveBeenCalledWith('session-test')
    expect(service.analyseSession).toHaveBeenCalledExactlyOnceWith('session-test')
    expect(screen.getByRole('link', { name: 'View practice screen' }).getAttribute('href')).toBe('/sessions/session-test/practice')
  })
})

describe('session analysis interactions', () => {
  it('does not fetch or display a fabricated score on the preview route', () => {
    const service = services()
    render(<MemoryRouter><CandidateAnalysis service={service} /></MemoryRouter>)
    expect(screen.getByText('No analysis available yet')).toBeTruthy()
    expect(service.getSession).not.toHaveBeenCalled()
    expect(screen.queryByRole('meter')).toBeNull()
  })
  it('loads persisted results with evidence and the missing-evidence distinction', async () => {
    const service = services()
    service.getSession.mockResolvedValueOnce({ ...detail, session: { ...session, match_analysis: analysis } })
    render(<MemoryRouter><CandidateAnalysis sessionId={session.id} service={service} /></MemoryRouter>)
    expect(await screen.findByText('68%')).toBeTruthy()
    expect(screen.getByText(analysis.matched_skills[0].evidence)).toBeTruthy()
    expect(screen.getByText('Missing resume evidence does not mean you lack the ability.')).toBeTruthy()
    expect(service.analyseSession).not.toHaveBeenCalled()
  })
  it('handles loading failure and retries without exposing internal errors', async () => {
    const service = services()
    service.getSession.mockRejectedValueOnce(new Error('internal confidential detail'))
    render(<MemoryRouter><CandidateAnalysis sessionId={session.id} service={service} /></MemoryRouter>)
    expect((await screen.findByRole('alert')).textContent).toContain('We could not load this session')
    expect(screen.queryByText('internal confidential detail')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('button', { name: 'Analyse match' })).toBeTruthy()
    expect(service.getSession).toHaveBeenCalledTimes(2)
  })
  it('rejects an invalid AI response, then retries analysis on the same session', async () => {
    const service = services()
    service.analyseSession.mockResolvedValueOnce({ ...analysis, overall_match_score: 150 })
    render(<MemoryRouter><CandidateAnalysis sessionId={session.id} service={service} /></MemoryRouter>)
    await userEvent.click(await screen.findByRole('button', { name: 'Analyse match' }))
    expect((await screen.findByRole('alert')).textContent).toContain('No score is shown')
    expect(screen.queryByRole('meter')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Retry analysis' }))
    expect(await screen.findByText('68%')).toBeTruthy()
    expect(service.getSession).toHaveBeenCalledTimes(1)
    expect(service.analyseSession).toHaveBeenCalledTimes(2)
  })
  it('does not display another session returned for the requested ID', async () => {
    const service = services()
    service.getSession.mockResolvedValueOnce({ ...detail, session: { ...session, id: 'other-session', match_analysis: analysis } })
    render(<MemoryRouter><CandidateAnalysis sessionId={session.id} service={service} /></MemoryRouter>)
    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(screen.queryByText('68%')).toBeNull()
  })
  it('ignores late responses after changing session routes', async () => {
    const service = services()
    let finishOld!: (value: SessionDetail) => void
    service.getSession.mockImplementationOnce(() => new Promise(resolve => { finishOld = resolve }))
    service.getSession.mockResolvedValueOnce({ ...detail, session: { ...session, id: 'new-session', match_analysis: { ...analysis, overall_match_score: 92 } } })
    const node = (id: string) => <MemoryRouter><CandidateAnalysis sessionId={id} service={service} /></MemoryRouter>
    const view = render(node(session.id))
    view.rerender(node('new-session'))
    expect(await screen.findByText('92%')).toBeTruthy()
    await act(async () => finishOld({ ...detail, session: { ...session, match_analysis: analysis } }))
    await waitFor(() => expect(screen.queryByText('68%')).toBeNull())
    expect(screen.getByText('92%')).toBeTruthy()
  })
})
