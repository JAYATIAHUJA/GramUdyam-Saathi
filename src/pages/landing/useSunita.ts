import { useMemo } from 'react'
import { SEED_CASES } from '../../data/cases'
import { planFor } from '../../lib/plans'

/** Sunita's live engine result, shared by the hero and the example. */
export function useSunita() {
  return useMemo(() => planFor(SEED_CASES[0], false), [])
}
