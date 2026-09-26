import { useMemo } from 'react'
import { makePlan, type Plan } from '../engine/plan'
import { SEED_CASES } from '../data/cases'
import { useApp, type SavedCase } from './store'

const full = new Map<string, Plan>()
const lite = new Map<string, Plan>()

export function planFor(c: SavedCase, withAlternatives = true): Plan {
  const key = c.id + JSON.stringify(c.input)
  const cache = withAlternatives ? full : lite
  let p = cache.get(key)
  if (!p) {
    p = makePlan(c.input, { id: c.id, createdAt: c.createdAt, alternatives: withAlternatives })
    cache.set(key, p)
  }
  return p
}

/** User-created cases first, then the demo queue (user edits to seed cases win). */
export function useAllCases(): SavedCase[] {
  const cases = useApp((s) => s.cases)
  return useMemo(() => {
    const ids = new Set(cases.map((c) => c.id))
    return [...cases, ...SEED_CASES.filter((c) => !ids.has(c.id))]
  }, [cases])
}

export function useCase(id: string | undefined) {
  const all = useAllCases()
  return all.find((c) => c.id === id)
}
