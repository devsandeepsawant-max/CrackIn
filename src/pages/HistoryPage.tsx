import { Link } from 'react-router-dom'
import { EmptyState, PageHeading } from '../components/common/UI'

export default function HistoryPage() {
  return <>
    <PageHeading eyebrow="YOUR PROGRESS, IN ONE PLACE" title="Every session is a step forward." description="Saved sessions will let you return to your questions, answers, and feedback." />
    <div className="notice" role="note">History is not connected to persistence or authentication. This is not a query of your saved sessions.</div>
    <EmptyState title="Session history is coming next" description="Ammar will build the history view; Santosh will connect secure, user-specific session persistence. This preview stores no session data."><Link className="button" to="/start">Explore the starting point →</Link></EmptyState>
  </>
}
