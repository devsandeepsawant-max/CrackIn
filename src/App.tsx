import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { LoadingState } from './components/common/UI'
import { WorkspaceLayout } from './layouts/WorkspaceLayout'

const OverviewPage = lazy(() => import('./pages/OverviewPage'))
const CandidatePage = lazy(() => import('./pages/CandidatePage'))
const StagePage = lazy(() => import('./pages/StagePage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
const TeamPage = lazy(() => import('./pages/TeamPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

export function App() {
  return <BrowserRouter><Suspense fallback={<LoadingState />}><Routes>
    <Route element={<WorkspaceLayout />}>
      <Route index element={<OverviewPage />} />
      <Route path="start" element={<CandidatePage />} />
      <Route path="history" element={<HistoryPage />} />
      <Route path="team" element={<TeamPage />} />
      <Route path="preview/analysis" element={<StagePage stage="analysis" />} />
      <Route path="preview/practice" element={<StagePage stage="practice" />} />
      <Route path="preview/feedback" element={<StagePage stage="feedback" />} />
      <Route path="sessions/:sessionId/analysis" element={<StagePage stage="analysis" />} />
      <Route path="sessions/:sessionId/practice" element={<StagePage stage="practice" />} />
      <Route path="sessions/:sessionId/feedback" element={<StagePage stage="feedback" />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes></Suspense></BrowserRouter>
}
