import { BackToWorkspace, EmptyState } from '../components/common/UI'

export default function NotFoundPage() {
  return <EmptyState title="This page isn’t part of the journey." description="The link may be out of date. Head back to the workspace to continue."><BackToWorkspace /></EmptyState>
}
