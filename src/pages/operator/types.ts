import type { PlanInput } from '../../engine/plan'

export type SetInput = (p: Partial<PlanInput>) => void

export type SetFit = (p: Partial<PlanInput['fit']>) => void
