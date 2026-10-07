import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchMarvelCharacters, getErrorMessage } from '../api'
import type { Hero } from '../types'
import { HeroContext, type HeroContextValue } from './heroContext'

export function HeroProvider({ children }: { children: ReactNode }) {
  const [heroes, setHeroes] = useState<Hero[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [browse, setBrowseState] = useState<{ ids: number[]; source: string }>({ ids: [], source: '' })

  useEffect(() => {
    let cancelled = false
    fetchMarvelCharacters()
      .then((data) => {
        if (!cancelled) {
          setHeroes(data)
          setError(null)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getErrorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  const retry = useCallback(() => {
    setLoading(true)
    setError(null)
    setAttempt((n) => n + 1)
  }, [])

  const byId = useMemo(() => new Map(heroes.map((h) => [h.id, h])), [heroes])
  const getById = useCallback((id: number) => byId.get(id), [byId])

  const setBrowse = useCallback((ids: number[], source: string) => {
    setBrowseState((prev) =>
      prev.source === source && prev.ids.length === ids.length && prev.ids.every((id, i) => id === ids[i])
        ? prev
        : { ids, source },
    )
  }, [])

  const value = useMemo<HeroContextValue>(
    () => ({
      heroes,
      loading,
      error,
      retry,
      getById,
      browseIds: browse.ids,
      browseSource: browse.source,
      setBrowse,
    }),
    [heroes, loading, error, retry, getById, browse, setBrowse],
  )

  return <HeroContext.Provider value={value}>{children}</HeroContext.Provider>
}
