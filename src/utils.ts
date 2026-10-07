import type { Alignment, Hero, SortKey, SortOrder, StatName } from './types'

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'totalPower', label: 'Total power' },
  { key: 'intelligence', label: 'Intelligence' },
  { key: 'strength', label: 'Strength' },
  { key: 'speed', label: 'Speed' },
  { key: 'durability', label: 'Durability' },
  { key: 'power', label: 'Power' },
  { key: 'combat', label: 'Combat' },
  { key: 'heightCm', label: 'Height' },
  { key: 'weightKg', label: 'Weight' },
]

export const STAT_LABELS: Record<StatName, string> = {
  intelligence: 'INT',
  strength: 'STR',
  speed: 'SPD',
  durability: 'DUR',
  power: 'POW',
  combat: 'CBT',
}

export const ALIGNMENT_LABELS: Record<Alignment, string> = {
  hero: 'Hero',
  villain: 'Villain',
  neutral: 'Neutral',
  unknown: 'Unknown',
}

export function isSortKey(value: string | null): value is SortKey {
  return SORT_OPTIONS.some((o) => o.key === value)
}

function sortValue(h: Hero, key: SortKey): number | string | null {
  if (key === 'name' || key === 'totalPower' || key === 'heightCm' || key === 'weightKg') return h[key]
  return h.stats[key]
}

export function sortHeroes(list: Hero[], key: SortKey, order: SortOrder): Hero[] {
  const direction = order === 'asc' ? 1 : -1
  return [...list].sort((a, b) => {
    const va = sortValue(a, key)
    const vb = sortValue(b, key)
    if (va === null || vb === null) {
      if (va === vb) return a.name.localeCompare(b.name)
      return va === null ? 1 : -1
    }
    const cmp = typeof va === 'string' ? va.localeCompare(vb as string) : va - (vb as number)
    return cmp !== 0 ? cmp * direction : a.name.localeCompare(b.name)
  })
}

export function matchesQuery(h: Hero, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [h.name, h.fullName, ...h.aliases].some((text) => text.toLowerCase().includes(q))
}

export function formatHeight(cm: number | null): string {
  if (cm === null) return '—'
  return cm >= 1000 ? `${(cm / 100).toFixed(0)} m` : `${Math.round(cm)} cm`
}

export function formatWeight(kg: number | null): string {
  if (kg === null) return '—'
  return kg >= 10000 ? `${(kg / 1000).toFixed(0)} t` : `${Math.round(kg)} kg`
}

export const MAIN_RACES = ['Human', 'Mutant', 'Human / Radiation', 'Alien', 'Asgardian', 'Inhuman', 'Cyborg', 'Cosmic Entity']

export function raceGroup(race: string): string {
  if (race === 'Unknown') return 'Unknown'
  return MAIN_RACES.includes(race) ? race : 'Other'
}
