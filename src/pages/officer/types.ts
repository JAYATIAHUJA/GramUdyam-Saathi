import type { Plan, Verdict } from '../../engine/plan'
import type { SavedCase } from '../../lib/store'

export type Row = { c: SavedCase; p: Plan }

export type DeskView = 'queue' | 'map'

export type VerdictFilter = Verdict | 'all'
