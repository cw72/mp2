import { useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useHeroes } from '../context/heroContext'
import type { Hero } from '../types'
import { ALIGNMENT_LABELS, MAIN_RACES, raceGroup } from '../utils'
import AlignmentTag from './AlignmentTag'
import StatusPanel from './StatusPanel'
import './GalleryView.css'

interface FilterGroup {
  param: string
  label: string
  options: { value: string; label: string }[]
  valueOf: (h: Hero) => string
}

const FILTER_GROUPS: FilterGroup[] = [
  {
    param: 'side',
    label: 'Side',
    options: (['hero', 'villain', 'neutral'] as const).map((a) => ({ value: a, label: ALIGNMENT_LABELS[a] })),
    valueOf: (h) => h.alignment,
  },
  {
    param: 'gender',
    label: 'Gender',
    options: ['Male', 'Female', 'Unknown'].map((g) => ({ value: g, label: g })),
    valueOf: (h) => h.gender,
  },
  {
    param: 'origin',
    label: 'Origin',
    options: [...MAIN_RACES, 'Other', 'Unknown'].map((r) => ({ value: r, label: r })),
    valueOf: (h) => raceGroup(h.race),
  },
]

function readSelection(params: URLSearchParams, group: FilterGroup): string[] {
  const allowed = new Set(group.options.map((o) => o.value))
  return (params.get(group.param) ?? '').split(',').filter((v) => allowed.has(v))
}

export default function GalleryView() {
  const { heroes, loading, error, setBrowse } = useHeroes()
  const [params, setParams] = useSearchParams()

  const selection = useMemo(
    () => Object.fromEntries(FILTER_GROUPS.map((g) => [g.param, readSelection(params, g)])),
    [params],
  )
  const activeCount = Object.values(selection).reduce((n, values) => n + values.length, 0)

  const toggle = (group: FilterGroup, value: string) => {
    const current = selection[group.param]
    const nextValues = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (nextValues.length > 0) next.set(group.param, nextValues.join(','))
        else next.delete(group.param)
        return next
      },
      { replace: true },
    )
  }

  const results = useMemo(
    () =>
      heroes.filter((h) =>
        FILTER_GROUPS.every((g) => {
          const chosen = selection[g.param]
          return chosen.length === 0 || chosen.includes(g.valueOf(h))
        }),
      ),
    [heroes, selection],
  )

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const g of FILTER_GROUPS) {
      for (const h of heroes) {
        const key = `${g.param}:${g.valueOf(h)}`
        map.set(key, (map.get(key) ?? 0) + 1)
      }
    }
    return map
  }, [heroes])

  useEffect(() => {
    if (results.length > 0) setBrowse(results.map((h) => h.id), 'Gallery results')
  }, [results, setBrowse])

  return (
    <section className="view">
      <div className="view-header">
        <h1 className="view-title">Gallery</h1>
        <p className="view-subtitle">
          Filter by side, gender and origin. Choosing several options in one group widens the results; combining
          groups narrows them.
        </p>
      </div>

      {!loading && !error && (
        <div className="filters">
          {FILTER_GROUPS.map((g) => (
            <fieldset key={g.param} className="filter-group">
              <legend className="field-label">{g.label}</legend>
              <div className="filter-options">
                {g.options.map((o) => {
                  const active = selection[g.param].includes(o.value)
                  const count = counts.get(`${g.param}:${o.value}`) ?? 0
                  return (
                    <button
                      key={o.value}
                      type="button"
                      className={active ? 'chip active' : 'chip'}
                      aria-pressed={active}
                      onClick={() => toggle(g, o.value)}
                      disabled={count === 0}
                    >
                      {o.label}
                      <span className="chip-count">{count}</span>
                    </button>
                  )
                })}
              </div>
            </fieldset>
          ))}

          <div className="filter-footer">
            <span className="result-line">
              {results.length} of {heroes.length} characters
            </span>
            {activeCount > 0 && (
              <button type="button" className="text-button" onClick={() => setParams({}, { replace: true })}>
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      <StatusPanel />

      {!loading && !error &&
        (results.length === 0 ? (
          <p className="empty">No characters match all of the selected filters.</p>
        ) : (
          <ul className="gallery-grid">
            {results.map((h) => (
              <li key={h.id}>
                <Link to={`/hero/${h.id}`} className="gallery-item">
                  <span className="gallery-frame">
                    <img src={h.image.md} alt={h.name} loading="lazy" />
                  </span>
                  <span className="gallery-name">{h.name}</span>
                  <span className="gallery-meta">
                    <AlignmentTag alignment={h.alignment} />
                    <span className="gallery-power">{h.totalPower} pts</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ))}
    </section>
  )
}
