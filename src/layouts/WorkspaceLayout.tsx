import { NavLink, Outlet } from 'react-router-dom'

export function WorkspaceLayout() {
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <aside className="sidebar" aria-label="Workspace navigation">
      <NavLink to="/" className="brand" aria-label="CrackIn home"><span className="brand-mark" aria-hidden="true">c<span>↗</span></span>crack<span className="brand-accent">in</span><span className="brand-dot">.</span></NavLink>
      <p className="nav-label">YOUR WORKSPACE</p>
      <nav className="primary-nav" aria-label="Main">
        <NavLink to="/" end><span aria-hidden="true">▦</span>Overview</NavLink>
        <NavLink to="/start"><span aria-hidden="true">⊕</span>New interview</NavLink>
        <NavLink to="/history"><span aria-hidden="true">◷</span>Session history</NavLink>
      </nav>
      <p className="nav-label team-label">BUILD TOGETHER</p>
      <nav className="primary-nav" aria-label="Team">
        <NavLink to="/team"><span aria-hidden="true">♧</span>Team handoff<span className="nav-count">8</span></NavLink>
      </nav>
      <div className="sidebar-note"><span className="mini-label">THE APPROACH</span><p>Less generic prep.<br />More <strong>you’ve got this.</strong></p><div className="note-line" /></div>
      <div className="sidebar-footer"><span className="avatar" aria-hidden="true">CI</span><div><strong>CrackIn team</strong><span>Hackathon workspace</span></div></div>
    </aside>
    <div className="workspace">
      <header className="topbar"><span>Workspace <span aria-hidden="true">/</span> <strong>Foundation</strong></span><span className="preview-badge"><span aria-hidden="true" />Foundation preview</span></header>
      <main id="main-content" tabIndex={-1}><Outlet /></main>
      <footer className="page-footer"><span>Built for the interview ahead.</span><span>CrackIn · Foundation v0.1</span></footer>
    </div>
  </div>
}
