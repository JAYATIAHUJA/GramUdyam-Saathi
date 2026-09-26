import { parseAmount } from '../../engine/guard'
import type { SocialCategory } from '../../engine/rules'
import { matchActivity } from '../../lib/speech'
import type { Draft } from '../../lib/store'
import { CATEGORY, EXPERIENCE, FAMILY, HOURS, INTEREST, matchOpt, TRAINING } from './questions'

/** Turns what the person said into an answer for the current question. */
export function useSpeechAnswer({ draft, patch, onHeard, onVillageText, onAmount }: { draft: Draft; patch: (d: Partial<Draft>) => void; onHeard: (text: string) => void; onVillageText: (text: string) => void; onAmount: (n: number) => void }) {
  const step = draft.step
  const choose = <T,>(apply: (v: T) => Partial<Draft>) => (v: T) => {
    patch({ ...apply(v), step: step + 1 })
  }
  return (text: string) => {
    onHeard(text)
    if (step === 1) patch({ name: text.replace(/(mera|meri|naam|name|is|my|मेरा|नाम|है)/gi, '').trim() || text })
    else if (step === 2) onVillageText(text)
    else if (step === 3) {
      const n = parseAmount(text)
      if (n) onAmount(n)
    } else if (step === 4) {
      const a = matchActivity(text)
      if (a) patch({ activity: a, sizeId: null, step: 5 })
    } else if (step === 6) {
      const o = matchOpt(text, EXPERIENCE)
      if (o) choose<0 | 1 | 2>((v) => ({ fit: { ...draft.fit, experience: v } }))(o.v)
    } else if (step === 7) {
      const o = matchOpt(text, FAMILY)
      if (o) choose<0 | 1 | 2>((v) => ({ fit: { ...draft.fit, familyLabour: v } }))(o.v)
    } else if (step === 8) {
      const o = matchOpt(text, HOURS)
      if (o) choose<0 | 1 | 2>((v) => ({ fit: { ...draft.fit, hours: v } }))(o.v)
    } else if (step === 9) {
      const o = matchOpt(text, TRAINING)
      if (o) choose<0 | 1>((v) => ({ fit: { ...draft.fit, training: v } }))(o.v)
    } else if (step === 10) {
      const o = matchOpt(text, INTEREST)
      if (o) choose<1 | 2 | 3 | 4 | 5>((v) => ({ fit: { ...draft.fit, interest: v } }))(o.v)
    } else if (step === 11) {
      const o = matchOpt(text, CATEGORY)
      if (o) choose<SocialCategory>((v) => ({ category: v }))(o.v)
    } else if (step === 12) {
      const n = parseAmount(text)
      if (n) patch({ familyIncome: n, step: 13 })
    }
  }
}
