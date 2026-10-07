import { STAT_NAMES, type Hero } from './types'
import { formatHeight, formatWeight } from './utils'

export interface StorySection {
  heading: string
  paragraphs: string[]
}

export interface Story {
  headline: string
  deck: string
  pullQuote: string | null
  sections: StorySection[]
}

function article(word: string): string {
  return /^[aeiou]/i.test(word) ? 'an' : 'a'
}

function tidy(text: string): string {
  return text.trim().replace(/[;,.\s]+$/, '')
}

function listJoin(items: string[]): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

function ordinal(n: number): string {
  const tens = n % 100
  if (tens >= 11 && tens <= 13) return `${n}th`
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`
}

const HEADLINES: Record<Hero['alignment'], string> = {
  hero: 'Profile of a hero',
  villain: 'Portrait of a villain',
  neutral: 'Somewhere in between',
  unknown: 'A mystery on file',
}

const DECKS: Record<Hero['alignment'], string> = {
  hero: 'Who they are, what they can do, and who has their back.',
  villain: 'What drives them, what they are capable of, and who stands beside them.',
  neutral: 'Not quite hero, not quite villain — a look at what makes them tick.',
  unknown: 'Little is certain. Here is everything the files do say.',
}

const SIGN_OFF: Record<Hero['alignment'], (name: string) => string> = {
  hero: (name) => `Whatever the numbers say, the files count ${name} firmly among the heroes.`,
  villain: (name) => `Make no mistake: the files mark ${name} as a villain.`,
  neutral: (name) => `Whose side ${name} is on, it seems, depends on the day.`,
  unknown: (name) => `Which side ${name} is on remains anyone’s guess.`,
}

function originSection(h: Hero): StorySection {
  const p1: string[] = []
  if (h.fullName && h.fullName !== h.name) p1.push(`Behind the name ${h.name} is ${h.fullName}.`)
  else if (h.fullName) p1.push(`${h.name} keeps no secret identity — that is the name on the paperwork.`)
  else p1.push(`Nobody is quite sure who hides behind the name ${h.name}.`)

  if (h.placeOfBirth) p1.push(`The story begins in ${tidy(h.placeOfBirth)}.`)

  const race = h.race !== 'Unknown' ? h.race.toLowerCase() : ''
  const body: string[] = []
  if (h.heightCm !== null) body.push(`standing ${formatHeight(h.heightCm)}`)
  if (h.weightKg !== null) body.push(`weighing ${formatWeight(h.weightKg)}`)
  if (race || body.length > 0) {
    const who = race ? `${article(race)} ${race}` : 'a figure'
    p1.push(`${h.name} is ${who}${body.length > 0 ? `, ${listJoin(body)}` : ''}.`)
  }

  const eyes = h.eyeColor ? `${h.eyeColor.toLowerCase()} eyes` : ''
  const hair = h.hairColor
    ? h.hairColor.toLowerCase() === 'no hair'
      ? 'no hair at all'
      : `${h.hairColor.toLowerCase()} hair`
    : ''
  if (eyes || hair) p1.push(`Look for the ${listJoin([eyes, hair].filter(Boolean))}.`)

  return { heading: 'Origins', paragraphs: [p1.join(' ')] }
}

function careerSection(h: Hero): StorySection | null {
  const sentences: string[] = []
  if (h.occupation) sentences.push(`On paper, ${h.name}’s line of work reads: “${tidy(h.occupation)}.”`)
  if (h.base) sentences.push(`These days the base of operations is ${tidy(h.base)}.`)
  if (h.firstAppearance) sentences.push(`Readers first met ${h.name} in ${tidy(h.firstAppearance)}.`)
  return sentences.length > 0 ? { heading: 'Line of work', paragraphs: [sentences.join(' ')] } : null
}

function tiesSection(h: Hero): StorySection | null {
  const paragraphs: string[] = []
  if (h.groupAffiliation) paragraphs.push(`When it comes to allies, the files list ${tidy(h.groupAffiliation)}.`)
  if (h.relatives) paragraphs.push(`Family ties run through ${tidy(h.relatives)}.`)
  if (h.aliases.length > 1) {
    const shown = h.aliases.slice(0, 6)
    const more = h.aliases.length > shown.length ? ', among others' : ''
    paragraphs.push(`Over the years, ${h.name} has also answered to ${listJoin(shown)}${more}.`)
  }
  return paragraphs.length > 0 ? { heading: 'Allies, family & other names', paragraphs } : null
}

function powerSection(h: Hero, rank: number, total: number): StorySection {
  const ranked = [...STAT_NAMES].sort((a, b) => h.stats[b] - h.stats[a])
  const best = ranked[0]
  const worst = ranked[ranked.length - 1]
  const sentences: string[] = []

  if (h.stats[best] === h.stats[worst]) {
    sentences.push(`All six measured attributes sit level at ${h.stats[best]} out of 100.`)
  } else {
    sentences.push(
      `Of the six attributes on record, ${best} rates highest at ${h.stats[best]} out of 100, while ${worst} trails at ${h.stats[worst]}.`,
    )
  }
  sentences.push(
    `That adds up to ${h.totalPower} out of a possible 600 — ${ordinal(rank)} of the ${total} Marvel characters in these files.`,
  )
  sentences.push(SIGN_OFF[h.alignment](h.name))

  return { heading: 'Power profile', paragraphs: [sentences.join(' ')] }
}

export function powerRank(hero: Hero, all: Hero[]): number {
  return all.filter((h) => h.totalPower > hero.totalPower).length + 1
}

export function buildStory(hero: Hero, all: Hero[]): Story {
  const sections = [
    originSection(hero),
    careerSection(hero),
    tiesSection(hero),
    powerSection(hero, powerRank(hero, all), all.length),
  ].filter((s): s is StorySection => s !== null)

  return {
    headline: HEADLINES[hero.alignment],
    deck: DECKS[hero.alignment],
    pullQuote: hero.aliases[0] ? `They call me ${hero.aliases[0]}.` : null,
    sections,
  }
}
