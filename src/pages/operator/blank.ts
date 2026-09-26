import { DEFAULT_FIT } from '../../engine/founderFit'
import type { PlanInput } from '../../engine/plan'

export const BLANK: PlanInput = { name: '', lgd: '146021', activity: 'dairy', sizeId: null, margin: 50000, category: 'SC', familyIncome: 150000, fit: { ...DEFAULT_FIT }, mode: 'serviced' }
