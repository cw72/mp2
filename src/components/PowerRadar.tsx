import { STAT_NAMES, type Hero } from '../types'
import { STAT_LABELS } from '../utils'
import './PowerRadar.css'

const SIZE = 260
const CENTER = SIZE / 2
const RADIUS = 92
const RINGS = [25, 50, 75, 100]

function point(index: number, value: number): [number, number] {
  const angle = (Math.PI * 2 * index) / STAT_NAMES.length - Math.PI / 2
  const r = (RADIUS * value) / 100
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)]
}

function polygon(values: number[]): string {
  return values.map((v, i) => point(i, v).map((n) => n.toFixed(1)).join(',')).join(' ')
}

export default function PowerRadar({ hero }: { hero: Hero }) {
  const values = STAT_NAMES.map((s) => hero.stats[s])
  const summary = STAT_NAMES.map((s) => `${s} ${hero.stats[s]}`).join(', ')

  return (
    <svg
      className={`radar radar-${hero.alignment}`}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={`Power stats for ${hero.name}: ${summary}`}
    >
      {RINGS.map((ring) => (
        <polygon key={ring} className={ring === 100 ? 'radar-ring radar-ring-outer' : 'radar-ring'} points={polygon(STAT_NAMES.map(() => ring))} />
      ))}
      {STAT_NAMES.map((s, i) => {
        const [x, y] = point(i, 100)
        return <line key={s} className="radar-spoke" x1={CENTER} y1={CENTER} x2={x} y2={y} />
      })}
      <polygon className="radar-shape" points={polygon(values)} />
      {values.map((v, i) => {
        const [x, y] = point(i, v)
        return <circle key={STAT_NAMES[i]} className="radar-dot" cx={x} cy={y} r={2.5} />
      })}
      {STAT_NAMES.map((s, i) => {
        const [x, y] = point(i, 122)
        return (
          <text key={s} className="radar-label" x={x} y={y} textAnchor="middle" dominantBaseline="middle">
            {STAT_LABELS[s]}
          </text>
        )
      })}
    </svg>
  )
}
