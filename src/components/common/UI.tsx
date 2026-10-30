import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function PageHeading({ eyebrow, title, description, action }: {
  eyebrow: string; title: string; description: string; action?: ReactNode
}) {
  return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="muted heading-description">{description}</p></div>{action}</div>
}

export function EmptyState({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return <section className="empty-state"><div className="empty-icon" aria-hidden="true">◇</div><h2>{title}</h2><p className="muted">{description}</p>{children}</section>
}

export function LoadingState({ label = 'Loading workspace…' }: { label?: string }) {
  return <div role="status" className="loading-state"><span className="spinner" aria-hidden="true" />{label}</div>
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div role="alert" className="error-state"><h2>Something went wrong</h2><p>{message}</p>{onRetry && <button className="button" onClick={onRetry}>Try again</button>}</div>
}

export function BackToWorkspace() {
  return <Link className="button secondary" to="/">Back to workspace</Link>
}
