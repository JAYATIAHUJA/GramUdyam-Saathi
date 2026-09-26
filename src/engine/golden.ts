// SRS §11.4 golden cases. Shared by vitest and the in-app "Engine proof" page,
// so the judges see the exact same checks the CI runs.
import { buildSchedule } from './amortise'
import { numericGuard } from './guard'
import { naiveCeiling, route } from './router'
import { assessFeasibility } from './feasibility'
import { VILLAGES } from '../data/villages'
import { activityByCode } from '../data/activities'

export interface GoldenCase {
  id: string
  input: string
  expected: string
  run: () => { actual: string; pass: boolean }
}

const R = (n: number) => Math.round(n)
const inr = (n: number) => '₹' + R(n).toLocaleString('en-IN')

export const GOLDEN: GoldenCase[] = [
  {
    id: 'T1',
    input: 'Margin ₹1,00,000, need ₹10 L, 8%, moratorium serviced',
    expected: 'Term Loan, ₹9,00,000, 2 × ₹18,000 then 26 × ₹44,729',
    run: () => {
      const r = naiveCeiling(100000, 'SC', 200000)
      const s = buildSchedule(r.loan, r.rule!.ratePa, r.rule!.tenureQ, r.moratoriumQ, 'serviced')
      const pass = r.rule!.product === 'Term Loan' && r.loan === 900000 && R(s.moratoriumPayment) === 18000 && R(s.instalment) === 44729 && s.rows.length === 28
      return { actual: `${r.rule!.product}, ${inr(r.loan)}, ${r.moratoriumQ} × ${inr(s.moratoriumPayment)} then ${s.totalQ - s.moratoriumQ} × ${inr(s.instalment)}`, pass }
    },
  },
  {
    id: 'T2',
    input: 'Same, moratorium capitalised',
    expected: 'Principal ₹9,36,360; 26 × ₹46,536',
    run: () => {
      const s = buildSchedule(900000, 0.08, 28, 2, 'capitalised')
      return { actual: `Principal ${inr(s.principalAfterMoratorium)}; 26 × ${inr(s.instalment)}`, pass: R(s.principalAfterMoratorium) === 936360 && R(s.instalment) === 46536 }
    },
  },
  {
    id: 'T3',
    input: 'Margin ₹10,000, project ₹1,00,000',
    expected: 'Micro Finance, ₹90,000, Q1 ₹1,462.50 then 11 × ≈₹9,000',
    run: () => {
      const r = naiveCeiling(10000, 'SC', 150000)
      const s = buildSchedule(r.loan, r.rule!.ratePa, r.rule!.tenureQ, r.moratoriumQ, 'serviced')
      const q1 = s.moratoriumPayment.toFixed(2)
      const paise = (n: number) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      return { actual: `${r.rule!.product}, ${inr(r.loan)}, Q1 ${paise(s.moratoriumPayment)} then ${s.totalQ - s.moratoriumQ} × ${paise(s.instalment)}`, pass: r.rule!.product === 'Micro Finance' && r.loan === 90000 && q1 === '1462.50' && Math.abs(s.instalment - 9000) <= 1 }
    },
  },
  {
    id: 'T4',
    input: 'Margin ₹14,000',
    expected: 'Cap ₹1.25 L; ₹1,000 short, or project ₹1,38,888',
    run: () => {
      const r = naiveCeiling(14000, 'SC', 150000)
      const short = r.contribution - 14000
      const hasCap = r.flags.some((f) => f.code === 'A2_CAP_BINDS' && f.en.includes('₹1,38,888'))
      return { actual: `Loan ${inr(r.loan)}; ${inr(short)} short; cap flag ${hasCap ? 'raised' : 'missing'}`, pass: r.loan === 125000 && short === 1000 && hasCap }
    },
  },
  {
    id: 'T5',
    input: 'Margin ₹14,500',
    expected: 'Micro Finance (₹1.40 L) vs Term Loan (₹1.45 L) side by side',
    run: () => {
      const r = naiveCeiling(14500, 'SC', 150000)
      const alt = r.alternatives[0]
      return { actual: `${r.rule!.product} ${inr(r.projectCost)} vs ${alt?.rule.product} ${alt ? inr(alt.projectCost) : '-'}`, pass: r.rule!.product === 'Term Loan' && r.projectCost === 145000 && alt?.rule.product === 'Micro Finance' && alt.loan === 125000 }
    },
  },
  {
    id: 'T6',
    input: 'Margin ₹6,00,000',
    expected: 'Project capped ₹50 L, loan ₹45 L, surplus note, other schemes',
    run: () => {
      const r = naiveCeiling(600000, 'SC', 200000)
      const flag = r.flags.find((f) => f.code === 'A1_MARGIN_ABOVE_5L')
      const surplus = 600000 - r.contribution
      return { actual: `Project ${inr(r.projectCost)}, loan ${inr(r.loan)}, surplus ${inr(surplus)}, flag ${flag ? 'A1' : 'missing'}`, pass: r.projectCost === 5000000 && r.loan === 4500000 && surplus === 100000 && !!flag }
    },
  },
  {
    id: 'T7',
    input: 'Plantation activity, Term Loan',
    expected: 'Moratorium 4 quarters',
    run: () => {
      const r = route({ projectCost: 300000, category: 'SC', familyIncome: 150000, plantation: true })
      return { actual: `${r.rule!.product}, moratorium ${r.moratoriumQ} quarters`, pass: r.moratoriumQ === 4 }
    },
  },
  {
    id: 'T8',
    input: 'Family income ₹3.5 L, SC',
    expected: 'NSFDC ineligible; route to PMEGP / Mudra',
    run: () => {
      const r = route({ projectCost: 200000, category: 'SC', familyIncome: 350000 })
      return { actual: r.eligible ? 'eligible' : `ineligible → ${r.otherSchemes.map((s) => s.name).join(', ')}`, pass: !r.eligible && r.flags[0]?.code === 'A5_INELIGIBLE' }
    },
  },
  {
    id: 'T9',
    input: 'Narration with an injected fake number',
    expected: 'Guard rejects',
    run: () => {
      const facts = [900000, 44729, 8]
      const ok = numericGuard('आपकी किस्त ₹44,729 है, लोन ₹9,00,000 पर 8% ब्याज।', facts)
      const bad = numericGuard('आपकी किस्त ₹44,729 है, ब्याज सिर्फ़ 2% है।', facts)
      return { actual: `clean: ${ok.ok ? 'pass' : 'blocked'}; injected "2%": ${bad.ok ? 'shipped' : 'blocked'}`, pass: ok.ok && !bad.ok }
    },
  },
  {
    id: 'T10',
    input: 'Village with no pakka road / thin data',
    expected: 'Fallback, confidence "Low"',
    run: () => {
      const v = VILLAGES.find((x) => !x.facilities.pakkaRoad)!
      const f = assessFeasibility(v, activityByCode('tea'))
      return { actual: `${v.name}: confidence ${f.confidence}`, pass: f.confidence === 'Low' }
    },
  },
]
