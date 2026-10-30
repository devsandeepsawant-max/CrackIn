import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import OverviewPage from './pages/OverviewPage'
import CandidatePage from './pages/CandidatePage'
import HistoryPage from './pages/HistoryPage'
import StagePage from './pages/StagePage'
import TeamPage from './pages/TeamPage'
import NotFoundPage from './pages/NotFoundPage'
import { journey, workstreams } from './config/workstreams'
import { QUESTION_DISTRIBUTION, RUBRIC_MAXIMUMS } from './types/interview'
import { interviewService, ServiceNotConfiguredError } from './services/interview'
import { ErrorState, LoadingState } from './components/common/UI'

function markup(node: React.ReactNode) {
  return renderToStaticMarkup(<MemoryRouter>{node}</MemoryRouter>)
}

describe('foundation contracts', () => {
  it('keeps the agreed 100-point rubric', () => {
    expect(Object.values(RUBRIC_MAXIMUMS).reduce((a, b) => a + b, 0)).toBe(100)
  })
  it('keeps the agreed ten-question distribution', () => {
    expect(Object.values(QUESTION_DISTRIBUTION).reduce((a, b) => a + b, 0)).toBe(10)
  })
  it('names eight owners and distinct feature branches', () => {
    expect(workstreams).toHaveLength(8)
    expect(new Set(workstreams.map(w => w.branch)).size).toBe(8)
  })
  it('defines four preview journey steps', () => {
    expect(journey).toHaveLength(4)
    expect(journey.every(s => s.to.startsWith('/'))).toBe(true)
  })
  it('never reports a successful backend operation before configuration', async () => {
    for (const method of Object.values(interviewService)) {
      await expect(method()).rejects.toBeInstanceOf(ServiceNotConfiguredError)
    }
  })
})

describe('preview screen smoke checks', () => {
  it.each([
    ['overview', <OverviewPage />, 'Foundation only'],
    ['intake', <CandidatePage />, 'Upload not connected'],
    ['analysis', <StagePage stage="analysis" />, 'No analysis available yet'],
    ['practice', <StagePage stage="practice" />, 'No interview questions yet'],
    ['feedback', <StagePage stage="feedback" />, 'No answer evaluation yet'],
    ['history', <HistoryPage />, 'This preview stores no session data'],
    ['team', <TeamPage />, 'Static foundation handoff'],
    ['404', <NotFoundPage />, 'Back to workspace'],
  ])('renders the %s route honestly', (_name, node, expected) => {
    expect(markup(node)).toContain(expected)
  })
  it('exposes loading and error semantics', () => {
    expect(markup(<LoadingState />)).toContain('role="status"')
    expect(markup(<ErrorState message="Test failure" />)).toContain('role="alert"')
  })
})
