import { describe, expect, it } from 'vitest'
import { GOLDEN } from './golden'
import { makePlan } from './plan'
import { parseAmount } from './guard'

describe('golden cases (SRS §11.4)', () => {
  for (const g of GOLDEN) {
    it(`${g.id}: ${g.input}`, () => {
      const r = g.run()
      expect(r.pass, `${g.id} got: ${r.actual}`).toBe(true)
    })
  }
})

describe('speech amount parser', () => {
  it.each([
    ['mere paas ek lakh rupaye hain', 100000],
    ['पचास हज़ार', 50000],
    ['1.5 lakh', 150000],
    ['२ लाख', 200000],
    ['14000', 14000],
  ])('%s → %d', (s, n) => expect(parseAmount(s)).toBe(n))
})

describe('personas', () => {
  it('Sunita (dairy, ₹1 L) is told to borrow less than the naive ₹9 L', () => {
    const p = makePlan({ name: 'Sunita Devi', lgd: '146021', activity: 'dairy', sizeId: null, margin: 100000, category: 'SC', familyIncome: 180000, fit: { experience: 1, familyLabour: 1, hours: 2, training: 0, interest: 4 }, mode: 'serviced' })
    console.log('SUNITA', p.verdict, p.fit.score, 'naive', p.naive.loan, p.naive.projection?.minDscr.toFixed(2), p.naive.mc?.pDefault, '| chosen', p.chosen.unit.size.id, p.chosen.loan, p.chosen.projection?.minDscr.toFixed(2), p.chosen.mc?.pDefault, '| rec', p.recommended.unit.size.id, p.recommended.loan, p.recommended.projection?.minDscr.toFixed(2), p.recommended.mc?.pDefault, 'inst', Math.round(p.recommended.schedule!.instalment), 'alts', p.alternatives.map((a) => a.activity.code + ':' + a.size.id + ':' + a.scenario.passes))
    expect(p.recommended.loan).toBeLessThan(p.naive.loan)
    expect(p.verdict).toBe('go')
  })
  it('Rekha (tailoring, ₹10k, low fit) gets caution + training', () => {
    const p = makePlan({ name: 'Rekha', lgd: '146022', activity: 'tailoring', sizeId: null, margin: 10000, category: 'SC', familyIncome: 120000, fit: { experience: 0, familyLabour: 0, hours: 1, training: 0, interest: 4 }, mode: 'serviced' })
    console.log('REKHA', p.verdict, p.fit.score, 'rec', p.recommended.unit.size.id, p.recommended.loan, p.recommended.projection?.minDscr.toFixed(2), p.recommended.mc?.pDefault, p.feasibility.saturation.label, p.feasibility.saturation.index.toFixed(2))
    expect(p.verdict).toBe('caution')
  })
})
