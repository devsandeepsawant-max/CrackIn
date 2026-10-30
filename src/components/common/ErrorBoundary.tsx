import { Component, type ErrorInfo, type ReactNode } from 'react'

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Add a redacted monitoring adapter here; never log resumes, answers, or secrets.
  }
  render() {
    if (this.state.failed) {
      return <main className="fatal-error" role="alert"><h1>We couldn’t open this page.</h1><p>Reload the workspace to try again. No data was submitted by this preview.</p><a className="button" href="/">Reload workspace</a></main>
    }
    return this.props.children
  }
}
