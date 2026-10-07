import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useHeroes } from '../context/heroContext'
import { STAT_NAMES } from '../types'
import { buildStory, powerRank } from '../story'
import { formatHeight, formatWeight } from '../utils'
import PowerRadar from './PowerRadar'
import StatusPanel from './StatusPanel'
import './DetailView.css'

export default function DetailView() {
  const { id: idParam } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { heroes, loading, error, getById, browseIds, browseSource } = useHeroes()

  const id = Number(idParam)
  const hero = Number.isInteger(id) ? getById(id) : undefined

  const inBrowse = browseIds.includes(id)
  const sequence = inBrowse ? browseIds : heroes.map((h) => h.id)
  const sequenceLabel = inBrowse ? browseSource : 'Full roster'
  const position = sequence.indexOf(id)
  const prevId = position >= 0 ? sequence[(position - 1 + sequence.length) % sequence.length] : undefined
  const nextId = position >= 0 ? sequence[(position + 1) % sequence.length] : undefined
  const prevHero = prevId !== undefined ? getById(prevId) : undefined
  const nextHero = nextId !== undefined ? getById(nextId) : undefined

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return
      if (e.key === 'ArrowLeft' && prevId !== undefined) navigate(`/hero/${prevId}`)
      if (e.key === 'ArrowRight' && nextId !== undefined) navigate(`/hero/${nextId}`)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prevId, nextId, navigate])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [id])

  if (loading || error) {
    return (
      <section className="view">
        <StatusPanel />
      </section>
    )
  }

  if (!hero) {
    return (
      <section className="view">
        <div className="empty">
          <p>No character with id “{idParam}”.</p>
          <Link className="button" to="/">
            Back to the roster
          </Link>
        </div>
      </section>
    )
  }

  const story = buildStory(hero, heroes)
  const rank = powerRank(hero, heroes)
  const facts: [string, string][] = [
    ['Real name', hero.fullName],
    ['Origin', hero.race === 'Unknown' ? '' : hero.race],
    ['Gender', hero.gender === 'Unknown' ? '' : hero.gender],
    ['Height', hero.heightCm === null ? '' : formatHeight(hero.heightCm)],
    ['Weight', hero.weightKg === null ? '' : formatWeight(hero.weightKg)],
  ]

  return (
    <article className={`view feature align-${hero.alignment}`}>
      <nav className="issue-nav" aria-label="Browse characters">
        <button
          type="button"
          className="issue-button"
          onClick={() => prevId !== undefined && navigate(`/hero/${prevId}`)}
          disabled={prevId === undefined}
        >
          <span className="issue-button-dir">← Previous</span>
          <span className="issue-button-name">{prevHero?.name}</span>
        </button>
        <p className="issue-position">
          {position + 1} / {sequence.length}
          <span>{sequenceLabel}</span>
        </p>
        <button
          type="button"
          className="issue-button issue-button-next"
          onClick={() => nextId !== undefined && navigate(`/hero/${nextId}`)}
          disabled={nextId === undefined}
        >
          <span className="issue-button-dir">Next →</span>
          <span className="issue-button-name">{nextHero?.name}</span>
        </button>
      </nav>

      <header className="feature-head">
        <p className="feature-kicker">
          <span>{story.headline}</span>
          <span>#{hero.id}</span>
        </p>
        <h1 className="feature-title">{hero.name}</h1>
        <p className="feature-deck">{story.deck}</p>
        <p className="feature-byline">
          {hero.firstAppearance ? <>First appeared in {hero.firstAppearance}</> : 'First appearance unknown'}
        </p>
      </header>

      <div className="feature-layout">
        <aside className="feature-aside">
          <figure className="feature-figure">
            <img src={hero.image.lg} alt={hero.name} />
            <figcaption>
              {hero.name}
              {hero.fullName && hero.fullName !== hero.name ? ` (${hero.fullName})` : ''}
            </figcaption>
          </figure>

          <section className="sidebar-box" aria-labelledby="numbers-title">
            <h2 id="numbers-title" className="sidebar-title">
              By the numbers
            </h2>
            <PowerRadar hero={hero} />
            <ul className="power-list">
              {STAT_NAMES.map((s) => (
                <li key={s}>
                  <span className="power-name">{s}</span>
                  <progress className="meter-bar" max={100} value={hero.stats[s]} />
                  <span className="power-value">{hero.stats[s]}</span>
                </li>
              ))}
            </ul>
            <p className="power-total">
              <span>
                Total <strong>{hero.totalPower}</strong> / 600
              </span>
              <span>
                Rank <strong>#{rank}</strong> of {heroes.length}
              </span>
            </p>
          </section>

          <section className="sidebar-box sidebar-facts" aria-labelledby="facts-title">
            <h2 id="facts-title" className="sidebar-title">
              Facts
            </h2>
            <dl>
              {facts.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value || <span className="unknown-value">Unknown</span>}</dd>
                </div>
              ))}
            </dl>
          </section>
        </aside>

        <div className="feature-text">
          {story.sections.map((section, i) => (
            <section key={section.heading} className="feature-section">
              <h2 className="feature-subhead">{section.heading}</h2>
              {section.paragraphs.map((text, j) => (
                <p key={j} className={i === 0 && j === 0 ? 'feature-lede' : undefined}>
                  {text}
                </p>
              ))}
              {i === 0 && story.pullQuote && (
                <blockquote className="feature-pullquote">
                  <p>“{story.pullQuote}”</p>
                </blockquote>
              )}
            </section>
          ))}
        </div>
      </div>
    </article>
  )
}
