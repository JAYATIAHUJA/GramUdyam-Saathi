import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { PlanInput } from '../engine/plan'
import type { FitAnswers } from '../engine/founderFit'
import type { SocialCategory } from '../engine/rules'
import type { MoratoriumMode } from '../engine/amortise'

export type Lang = 'hi' | 'en'
export type CaseStatus = 'draft' | 'ready' | 'revision'

export interface Draft {
  step: number
  name: string
  lgd: string | null
  margin: number | null
  activity: string | null
  sizeId: string | null
  fit: Partial<FitAnswers>
  category: SocialCategory | null
  familyIncome: number | null
  mode: MoratoriumMode
}

export interface SavedCase {
  id: string
  input: PlanInput
  createdAt: string
  status: CaseStatus
  channel: 'self' | 'vle' | 'seed'
  remarks: { by: string; at: string; text: string }[]
}

const EMPTY: Draft = { step: 0, name: '', lgd: null, margin: null, activity: null, sizeId: null, fit: {}, category: null, familyIncome: null, mode: 'serviced' }

interface State {
  lang: Lang
  setLang: (l: Lang) => void
  autoRead: boolean
  setAutoRead: (b: boolean) => void
  draft: Draft
  patch: (d: Partial<Draft>) => void
  resetDraft: () => void
  cases: SavedCase[]
  addCase: (c: SavedCase) => void
  setStatus: (id: string, s: CaseStatus) => void
  addRemark: (id: string, text: string, by: string) => void
}

function safeStorage() {
  try {
    const k = '__gus'
    localStorage.setItem(k, '1')
    localStorage.removeItem(k)
    return localStorage
  } catch {
    const mem = new Map<string, string>()
    return { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) }
  }
}

export const useApp = create<State>()(
  persist(
    (set) => ({
      lang: 'hi',
      setLang: (lang) => set({ lang }),
      autoRead: false,
      setAutoRead: (autoRead) => set({ autoRead }),
      draft: EMPTY,
      patch: (d) => set((s) => ({ draft: { ...s.draft, ...d } })),
      resetDraft: () => set({ draft: EMPTY }),
      cases: [],
      addCase: (c) => set((s) => ({ cases: [c, ...s.cases.filter((x) => x.id !== c.id)] })),
      setStatus: (id, status) => set((s) => ({ cases: s.cases.map((c) => (c.id === id ? { ...c, status } : c)) })),
      addRemark: (id, text, by) =>
        set((s) => ({ cases: s.cases.map((c) => (c.id === id ? { ...c, remarks: [...c.remarks, { by, at: new Date().toISOString(), text }] } : c)) })),
    }),
    { name: 'gramudyam-saathi', storage: createJSONStorage(safeStorage), version: 1 },
  ),
)

/** Bilingual helper: t('English', 'हिंदी') */
export function useT() {
  const lang = useApp((s) => s.lang)
  return Object.assign((en: string, hi: string) => (lang === 'hi' ? hi : en), { lang })
}

export const tr = (lang: Lang, l: { en: string; hi: string }) => (lang === 'hi' ? l.hi : l.en)
