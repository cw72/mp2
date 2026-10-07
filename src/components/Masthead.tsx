import { NavLink } from 'react-router-dom'
import './Masthead.css'

export default function Masthead() {
  return (
    <header className="masthead">
      <div className="masthead-inner">
        <NavLink to="/" className="masthead-logo">
          <span className="masthead-mark" aria-hidden="true" />
          Ink Roster
        </NavLink>
        <nav className="masthead-nav" aria-label="Main">
          <NavLink to="/" end className="masthead-link">
            Roster
          </NavLink>
          <NavLink to="/gallery" className="masthead-link">
            Gallery
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
