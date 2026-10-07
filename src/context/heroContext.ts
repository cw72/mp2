import { createContext, useContext } from 'react'
import type { Hero } from '../types'

export interface HeroContextValue {
  heroes: Hero[]
  loading: boolean
  error: string | null
  retry: () => void
  getById: (id: number) => Hero | undefined
  browseIds: number[]
  browseSource: string
  setBrowse: (ids: number[], source: string) => void
}

export const HeroContext = createContext<HeroContextValue | null>(null)

export function useHeroes(): HeroContextValue {
  const ctx = useContext(HeroContext)
  if (!ctx) throw new Error('useHeroes must be used inside <HeroProvider>')
  return ctx
}
