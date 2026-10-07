import axios from 'axios'
import { STAT_NAMES, type Alignment, type Hero, type HeroResponse } from './types'

const client = axios.create({
  baseURL: 'https://akabab.github.io/superhero-api/api',
  timeout: 20000,
})

const PUBLISHER = 'Marvel Comics'
const CACHE_KEY = 'ink-roster-cache-v1'

function clean(value: string | null | undefined): string {
  const v = (value ?? '').trim()
  return v === '-' || v === 'null' || v.toLowerCase().startsWith('no alter egos') ? '' : v
}

function parseHeightCm(values: string[]): number | null {
  const metric = values[1] ?? ''
  const n = parseFloat(metric)
  if (!Number.isFinite(n) || n <= 0 || !/(cm|meters)$/.test(metric)) return null
  return metric.endsWith('meters') ? n * 100 : n
}

function parseWeightKg(values: string[]): number | null {
  const metric = values[1] ?? ''
  const n = parseFloat(metric.replace(/,/g, ''))
  if (!Number.isFinite(n) || n <= 0) return null
  return metric.includes('tons') ? n * 1000 : n
}

function toAlignment(value: string): Alignment {
  if (value === 'good') return 'hero'
  if (value === 'bad') return 'villain'
  if (value === 'neutral') return 'neutral'
  return 'unknown'
}

function toHero(data: HeroResponse): Hero {
  const stats = Object.fromEntries(
    STAT_NAMES.map((s) => [s, data.powerstats[s] ?? 0]),
  ) as Hero['stats']

  return {
    id: data.id,
    name: data.name,
    fullName: clean(data.biography.fullName),
    aliases: data.biography.aliases.map(clean).filter(Boolean),
    alignment: toAlignment(data.biography.alignment),
    gender: clean(data.appearance.gender) || 'Unknown',
    race: clean(data.appearance.race) || 'Unknown',
    heightCm: parseHeightCm(data.appearance.height),
    weightKg: parseWeightKg(data.appearance.weight),
    eyeColor: clean(data.appearance.eyeColor),
    hairColor: clean(data.appearance.hairColor),
    placeOfBirth: clean(data.biography.placeOfBirth),
    firstAppearance: clean(data.biography.firstAppearance),
    occupation: clean(data.work.occupation),
    base: clean(data.work.base),
    groupAffiliation: clean(data.connections.groupAffiliation),
    relatives: clean(data.connections.relatives),
    stats,
    totalPower: STAT_NAMES.reduce((sum, s) => sum + stats[s], 0),
    image: { sm: data.images.sm, md: data.images.md, lg: data.images.lg },
  }
}

function readCache(): Hero[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as Hero[]) : null
  } catch {
    return null
  }
}

function writeCache(heroes: Hero[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(heroes))
  } catch {
    return
  }
}

export async function fetchMarvelCharacters(): Promise<Hero[]> {
  const cached = readCache()
  if (cached) return cached

  const { data } = await client.get<HeroResponse[]>('/all.json')
  const heroes = data
    .filter((h) => h.biography.publisher === PUBLISHER)
    .map(toHero)
    .sort((a, b) => a.name.localeCompare(b.name))

  writeCache(heroes)
  return heroes
}

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 429) return 'Too many requests — the API is rate limiting us. Wait a moment and retry.'
    if (err.response) return `The Superhero API responded with status ${err.response.status}.`
    if (err.code === 'ECONNABORTED') return 'The request timed out.'
    return 'Could not reach the Superhero API. Check your network connection.'
  }
  return err instanceof Error ? err.message : 'Unknown error.'
}
