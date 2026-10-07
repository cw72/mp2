import { useHeroes } from '../context/heroContext'
import './StatusPanel.css'

export default function StatusPanel() {
  const { loading, error, retry } = useHeroes()

  if (loading) {
    return (
      <div className="status" role="status">
        <span className="status-spinner" aria-hidden="true" />
        <p>Loading characters…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="status status-error" role="alert">
        <p>{error}</p>
        <button type="button" className="button" onClick={retry}>
          Try again
        </button>
      </div>
    )
  }

  return null
}
