import { DEFAULT_FIT, type FitAnswers } from '../../engine/founderFit'
import type { PlanInput } from '../../engine/plan'
import type { Draft } from '../../lib/store'
import Saathi from './Saathi'

export function draftToInput(d: Draft): PlanInput {
  return {
    name: d.name || 'Saathi user',
    lgd: d.lgd!,
    activity: d.activity!,
    sizeId: d.sizeId,
    margin: d.margin!,
    category: d.category ?? 'SC',
    familyIncome: d.familyIncome ?? 150000,
    fit: { ...DEFAULT_FIT, ...d.fit } as FitAnswers,
    mode: d.mode,
  }
}
