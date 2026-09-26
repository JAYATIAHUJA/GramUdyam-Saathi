import type { Activity, ActivitySize } from '../data/activities'
import { buildSchedule, yearlyDebtService, type MoratoriumMode, type Schedule } from './amortise'

export const ASSUMPTIONS = {
  hiredLabourMonthly: 7500, // ₹ per hired worker (UP rural wage, 2026)
  householdDraw: 4000, // ₹/month the family takes out for living costs
  priceInflation: 0.04,
  costInflation: 0.05,
  discountRate: 0.12,
  mcRuns: 1000,
}

export interface Unit {
  activity: Activity
  size: ActivitySize
  scale: number // 1 = the library size; >1 when stretched to a larger project cost
}

export interface YearRow {
  year: number
  revenue: number
  variable: number
  fixed: number
  hiredLabour: number
  draw: number
  ebitda: number
  depreciation: number
  interest: number
  principal: number
  netProfit: number
  cfads: number
  dscr: number
}

export interface Projection {
  years: YearRow[]
  minDscr: number
  avgDscr: number
  breakEvenMonthlySales: number
  expectedMonthlySales: number
  paybackMonth: number | null
  npv: number
  irr: number | null
  monthlyCash: { m: number; label: string; cash: number; sales: number; outflow: number }[]
  moneylenderMonth: number | null
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function unitRevenueCap(u: Unit, marketCap: number | null) {
  const cap = u.size.capacityRevenue * u.scale
  return marketCap == null ? cap : Math.min(cap, marketCap)
}

interface Shock {
  price: number
  volume: number
  cost: number
  badYears: boolean[]
}

const NO_SHOCK: Shock = { price: 1, volume: 1, cost: 1, badYears: [] }

export function project(
  u: Unit,
  schedule: Schedule,
  opts: { familyLabour: number; marketCap: number | null; startMonth?: number; shock?: Shock; fast?: boolean },
): Projection {
  const { familyLabour, marketCap } = opts
  const shock = opts.shock ?? NO_SHOCK
  const A = ASSUMPTIONS
  const s = u.size
  const loanYears = Math.ceil(schedule.totalQ / 4)
  const nYears = Math.max(5, loanYears)
  const ds = yearlyDebtService(schedule, nYears)
  const baseRev = unitRevenueCap(u, marketCap)
  const labourNeeded = Math.ceil(s.labourNeeded * Math.sqrt(u.scale))
  const hired = Math.max(0, labourNeeded - familyLabour)
  const capex = s.capex * u.scale
  const dep = capex / s.depYears
  const years: YearRow[] = []
  for (let y = 0; y < nYears; y++) {
    const ramp = y === 0 ? u.activity.rampYear1 : 1
    const bad = shock.badYears[y] ? 0.8 : 1
    const revenue = baseRev * 12 * ramp * Math.pow(1 + A.priceInflation, y) * shock.price * shock.volume * bad
    const variable = revenue * s.variableCostPct * shock.cost / shock.price
    const fixed = s.fixedMonthly * u.scale * 12 * Math.pow(1 + A.costInflation, y)
    const hiredLabour = hired * A.hiredLabourMonthly * 12 * Math.pow(1 + A.costInflation, y)
    const draw = A.householdDraw * 12
    const ebitda = revenue - variable - fixed - hiredLabour - draw
    const { interest, principal } = ds[y]
    const depreciation = y < s.depYears ? dep : 0
    const netProfit = ebitda - depreciation - interest
    const cfads = netProfit + depreciation + interest
    const service = principal + interest
    years.push({ year: y + 1, revenue, variable, fixed, hiredLabour, draw, ebitda, depreciation, interest, principal, netProfit, cfads, dscr: service > 0 ? cfads / service : Infinity })
  }
  const serviced = years.filter((r) => r.principal + r.interest > 0 && r.year <= loanYears)
  const minDscr = serviced.length ? Math.min(...serviced.map((r) => r.dscr)) : Infinity
  const avgDscr = serviced.length ? serviced.reduce((a, r) => a + r.dscr, 0) / serviced.length : Infinity
  if (opts.fast) {
    return { years, minDscr, avgDscr, breakEvenMonthlySales: 0, expectedMonthlySales: baseRev, paybackMonth: null, npv: 0, irr: null, monthlyCash: [], moneylenderMonth: null }
  }

  // Monthly cash walk for 24 months: working capital buffer vs seasonality.
  const qPay = (q: number) => schedule.rows.find((r) => r.q === q)?.payment ?? 0
  const start = opts.startMonth ?? 3
  let cash = s.workingCapital * u.scale
  let moneylenderMonth: number | null = null
  let cum = 0
  let paybackMonth: number | null = null
  const contribution = capex + s.workingCapital * u.scale - schedule.principal
  const monthlyCash: Projection['monthlyCash'] = []
  for (let m = 0; m < 24; m++) {
    const cal = (start + m) % 12
    const ramp = m < 12 ? u.activity.rampYear1 + (1 - u.activity.rampYear1) * (m / 12) : 1
    const sales = baseRev * u.activity.seasonality[cal] * ramp * shock.price * shock.volume
    const op = sales * (1 - s.variableCostPct) - s.fixedMonthly * u.scale - hired * A.hiredLabourMonthly - A.householdDraw
    const debt = (m + 1) % 3 === 0 ? qPay((m + 1) / 3) : 0
    cash += op - debt
    cum += op - debt
    if (cash < 0 && moneylenderMonth == null) moneylenderMonth = m + 1
    if (paybackMonth == null && cum >= contribution) paybackMonth = m + 1
    monthlyCash.push({ m: m + 1, label: MONTHS[cal], cash, sales, outflow: debt })
  }

  const contributionMargin = 1 - s.variableCostPct
  const monthlyFixed = s.fixedMonthly * u.scale + hired * A.hiredLabourMonthly + A.householdDraw + schedule.instalment / 3
  const breakEvenMonthlySales = monthlyFixed / contributionMargin

  const flows = [-(capex + s.workingCapital * u.scale), ...years.map((r) => r.ebitda)]
  flows[flows.length - 1] += s.workingCapital * u.scale
  const npvAt = (rate: number) => flows.reduce((acc, f, i) => acc + f / Math.pow(1 + rate, i), 0)
  let irr: number | null = null
  if (npvAt(-0.9) > 0 && npvAt(3) < 0) {
    let lo = -0.9
    let hi = 3
    for (let i = 0; i < 80; i++) {
      const mid = (lo + hi) / 2
      if (npvAt(mid) > 0) lo = mid
      else hi = mid
    }
    irr = (lo + hi) / 2
  }

  return {
    years,
    minDscr,
    avgDscr,
    breakEvenMonthlySales,
    expectedMonthlySales: baseRev,
    paybackMonth,
    npv: npvAt(A.discountRate),
    irr,
    monthlyCash,
    moneylenderMonth,
  }
}

// Seeded PRNG so every plan is reproducible from its inputs (audit).
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function gauss(rng: () => number) {
  const u = Math.max(rng(), 1e-9)
  const v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export interface MonteCarlo {
  runs: number
  pDefault: number
  dscrP10: number
  dscrP50: number
  dscrP90: number
  histogram: { bin: number; count: number }[]
}

export function monteCarlo(
  u: Unit,
  loan: number,
  ratePa: number,
  totalQ: number,
  moratoriumQ: number,
  mode: MoratoriumMode,
  opts: { familyLabour: number; marketCap: number | null },
  seed = 42,
): MonteCarlo {
  const rng = mulberry32(seed)
  const schedule = buildSchedule(loan, ratePa, totalQ, moratoriumQ, mode)
  const runs = ASSUMPTIONS.mcRuns
  const nYears = Math.max(5, Math.ceil(totalQ / 4))
  const mins: number[] = []
  let defaults = 0
  for (let i = 0; i < runs; i++) {
    const shock: Shock = {
      price: 1 + 0.08 * gauss(rng),
      volume: Math.max(0.3, 1 + 0.1 * gauss(rng)),
      cost: 1 + 0.08 * gauss(rng),
      badYears: Array.from({ length: nYears }, () => rng() < 0.05),
    }
    const p = project(u, schedule, { ...opts, shock, fast: true })
    const m = Math.min(p.minDscr, 9)
    mins.push(m)
    if (m < 1) defaults++
  }
  mins.sort((a, b) => a - b)
  const q = (p: number) => mins[Math.floor(p * (runs - 1))]
  const bins = Array.from({ length: 16 }, (_, i) => ({ bin: i * 0.25, count: 0 }))
  for (const m of mins) {
    const b = Math.min(bins.length - 1, Math.max(0, Math.floor(m / 0.25)))
    bins[b].count++
  }
  return { runs, pDefault: defaults / runs, dscrP10: q(0.1), dscrP50: q(0.5), dscrP90: q(0.9), histogram: bins }
}
