export interface HeroResponse {
  id: number
  name: string
  slug: string
  powerstats: Record<StatName, number | null>
  appearance: {
    gender: string
    race: string | null
    height: string[]
    weight: string[]
    eyeColor: string
    hairColor: string
  }
  biography: {
    fullName: string
    alterEgos: string
    aliases: string[]
    placeOfBirth: string
    firstAppearance: string
    publisher: string | null
    alignment: string
  }
  work: { occupation: string; base: string }
  connections: { groupAffiliation: string; relatives: string }
  images: { xs: string; sm: string; md: string; lg: string }
}

export const STAT_NAMES = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'] as const
export type StatName = (typeof STAT_NAMES)[number]

export type Alignment = 'hero' | 'villain' | 'neutral' | 'unknown'

export interface Hero {
  id: number
  name: string
  fullName: string
  aliases: string[]
  alignment: Alignment
  gender: string
  race: string
  heightCm: number | null
  weightKg: number | null
  eyeColor: string
  hairColor: string
  placeOfBirth: string
  firstAppearance: string
  occupation: string
  base: string
  groupAffiliation: string
  relatives: string
  stats: Record<StatName, number>
  totalPower: number
  image: { sm: string; md: string; lg: string }
}

export type SortKey = 'name' | 'totalPower' | StatName | 'heightCm' | 'weightKg'
export type SortOrder = 'asc' | 'desc'
