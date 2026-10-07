import { useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useHeroes } from '../context/heroContext'
import { STAT_NAMES, type Hero, type SortKey, type SortOrder, type StatName } from '../types'
import {
  SORT_OPTIONS,
  STAT_LABELS,
  formatHeight,
  formatWeight,
  isSortKey,
  matchesQuery,
  sortHeroes,
} from '../utils'
import AlignmentTag from './AlignmentTag'
import StatusPanel from './StatusPanel'
import './ListView.css'

function isStat(key: SortKey): key is StatName {
  return (STAT_NAMES as readonly string[]).includes(key)
}

function meterFor(hero: Hero, key: SortKey): { label: string; value: number; max: number } {
  if (isStat(key)) return { label: STAT_LABELS[key], value: hero.stats[key], max: 100 }
  return { label: 'Total', value: hero.totalPower, max: 600 }
}

export default function ListView() {
  const { heroes, loading, error, setBrowse } = useHeroes()
  const [params, setParams] = useSearchParams()

  const query = params.get('q') ?? ''
  const sortParam = params.get('sort')
  const sortKey: SortKey = isSortKey(sortParam) ? sortParam : 'name'
  const order: SortOrder = params.get('order') === 'desc' ? 'desc' : 'asc'

  const updateParam = (key: string, value: string, defaultValue: string) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value === defaultValue) next.delete(key)
        else next.set(key, value)
        return next
      },
      { replace: true },
    )
  }

  const results = useMemo(
    () => sortHeroes(heroes.filter((h) => matchesQuery(h, query)), sortKey, order),
    [heroes, query, sortKey, order],
  )

  useEffect(() => {
    if (results.length > 0) setBrowse(results.map((h) => h.id), 'Roster results')
  }, [results, setBrowse])

  const sortLabel = SORT_OPTIONS.find((o) => o.key === sortKey)?.label ?? ''

  return (
    <section className="view">
      <div className="view-header">
        <h1 className="view-title">Roster</h1>
        <p className="view-subtitle">
          {heroes.length > 0 ? `${heroes.length} Marvel heroes, villains and everyone in between.` : 'Marvel heroes, villains and everyone in between.'}{' '}
          Search by codename, real name or alias.
        </p>
      </div>

      <div className="controls">
        <label className="field field-search">
          <span className="field-label">Search</span>
          <input
            type="search"
            className="input"
            placeholder="Spider-Man, Logan, Thor…"
            value={query}
            onChange={(e) => updateParam('q', e.target.value, '')}
          />
        </label>

        <label className="field">
          <span className="field-label">Sort by</span>
          <select
            className="input"
            value={sortKey}
            onChange={(e) => updateParam('sort', e.target.value, 'name')}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <div className="field">
          <span className="field-label">Order</span>
          <div className="toggle" role="group" aria-label="Sort order">
            <button
              type="button"
              className={order === 'asc' ? 'toggle-option active' : 'toggle-option'}
              aria-pressed={order === 'asc'}
              onClick={() => updateParam('order', 'asc', 'asc')}
            >
              Ascending
            </button>
            <button
              type="button"
              className={order === 'desc' ? 'toggle-option active' : 'toggle-option'}
              aria-pressed={order === 'desc'}
              onClick={() => updateParam('order', 'desc', 'asc')}
            >
              Descending
            </button>
          </div>
        </div>
      </div>

      <StatusPanel />

      {!loading && !error && (
        <>
          <p className="result-line">
            {results.length} result{results.length === 1 ? '' : 's'} · sorted by{' '}
            {sortLabel.toLowerCase()}, {order === 'asc' ? 'ascending' : 'descending'}
          </p>

          {results.length === 0 ? (
            <p className="empty">No characters match “{query}”.</p>
          ) : (
            <ol className="card-grid">
              {results.map((h, index) => {
                const meter = meterFor(h, sortKey)
                return (
                  <li key={h.id}>
                    <Link to={`/hero/${h.id}`} className={`hero-card align-${h.alignment}`}>
                      <span className="hero-card-rank">#{index + 1}</span>
                      <span className="hero-card-top">
                        <span className="hero-card-thumb">
                          <img src={h.image.sm} alt="" loading="lazy" />
                        </span>
                        <span className="hero-card-id">
                          <span className="hero-card-name">{h.name}</span>
                          <span className="hero-card-real">{h.fullName || 'Identity unknown'}</span>
                          <AlignmentTag alignment={h.alignment} />
                        </span>
                      </span>
                      <span className="hero-card-meter">
                        <span className="hero-card-meter-label">{meter.label}</span>
                        <progress className="meter-bar" max={meter.max} value={meter.value} />
                        <span className="hero-card-meter-value">{meter.value}</span>
                      </span>
                      <span className="hero-card-foot">
                        <span>Height {formatHeight(h.heightCm)}</span>
                        <span>Weight {formatWeight(h.weightKg)}</span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ol>
          )}
        </>
      )}
    </section>
  )
}
