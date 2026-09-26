import { ACTIVITIES, activityByCode, sizeCost, type Activity, type ActivitySize } from '../data/activities'
import { villageByLgd } from '../data/villages'
import { buildSchedule, type MoratoriumMode, type Schedule } from './amortise'
import { monteCarlo, project, type MonteCarlo, type Projection, type Unit } from './business'
import { assessFeasibility, hash01, type Feasibility } from './feasibility'
import { founderFit, type FitAnswers, type FitResult } from './founderFit'
import { route, type RouteResult } from './router'
import { RULESET_VERSION, THRESHOLDS, type SocialCategory } from './rules'

export const DATA_VERSION = 'demo-barabanki-2026.09'

export interface PlanInput {
  name: string
  lgd: string
  activity: string
  sizeId: string | null // null → "suggest me"
  margin: number
  category: SocialCategory
  familyIncome: number
  fit: FitAnswers
  mode: MoratoriumMode
  userCompetitorCount?: number
}

export interface Scenario {
  unit: Unit
  projectCost: number
  loan: number
  contribution: number
  marginShort: number
  route: RouteResult
  schedule: Schedule | null
  projection: Projection | null
  mc: MonteCarlo | null
  passes: boolean
}

export type Verdict = 'go' | 'caution' | 'rethink'

export interface Plan {
  id: string
  createdAt: string
  input: PlanInput
  ruleVersion: string
  dataVersion: string
  feasibility: Feasibility
  fit: FitResult
  naive: Scenario
  chosen: Scenario
  recommended: Scenario
  verdict: Verdict
  reasons: { en: string; hi: string }[]
  topRisks: { en: string; hi: string; level: 'low' | 'medium' | 'high' }[]
  swot: Record<'S' | 'W' | 'O' | 'T', { en: string; hi: string; fact?: string }[]>
  alternatives: { activity: Activity; size: ActivitySize; scenario: Scenario; score: number; saturation: Feasibility['saturation']['label'] }[]
  perDay: number
  localUnits: number
}

const rupee = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')

export function buildScenario(
  unit: Unit,
  margin: number,
  input: Pick<PlanInput, 'category' | 'familyIncome' | 'mode'>,
  opts: { familyLabour: number; marketCap: number | null; needBased: boolean; mcRuns?: boolean; seed?: number },
): Scenario {
  const projectCost = Math.round(sizeCost(unit.size) * unit.scale)
  const r = route({ projectCost, category: input.category, familyIncome: input.familyIncome, plantation: unit.activity.plantation, margin })
  if (!r.eligible || !r.rule) {
    return { unit, projectCost, loan: 0, contribution: projectCost, marginShort: Math.max(0, projectCost - margin), route: r, schedule: null, projection: null, mc: null, passes: false }
  }
  // Need-based: put in all the margin you have → the smallest loan that funds the unit.
  let loan = r.loan
  if (opts.needBased) loan = Math.max(0, Math.min(r.loan, r.projectCost - margin))
  const contribution = r.projectCost - loan
  const marginShort = r.rule.marginRequired ? Math.max(0, contribution - margin) : 0
  const schedule = buildSchedule(loan, r.rule.ratePa, r.rule.tenureQ, r.moratoriumQ, input.mode)
  const projection = project(unit, schedule, { familyLabour: opts.familyLabour, marketCap: opts.marketCap })
  const mc =
    opts.mcRuns === false
      ? null
      : monteCarlo(unit, loan, r.rule.ratePa, schedule.totalQ, r.moratoriumQ, input.mode, { familyLabour: opts.familyLabour, marketCap: opts.marketCap }, opts.seed)
  const pD = mc ? mc.pDefault : projection.minDscr < 1 ? 1 : 0
  const passes = marginShort === 0 && projection.minDscr >= THRESHOLDS.dscrComfort && pD <= THRESHOLDS.pDefaultMax
  return { unit, projectCost: r.projectCost, loan, contribution, marginShort, route: r, schedule, projection, mc, passes }
}

function marketCapFor(f: Feasibility) {
  return f.demand.uncapped ? null : (f.demand.monthlyLow + f.demand.monthlyHigh) / 2
}

function seedOf(s: string) {
  return Math.floor(hash01(s) * 1e9)
}

export function makePlan(input: PlanInput, opts: { id?: string; createdAt?: string; alternatives?: boolean } = {}): Plan {
  const village = villageByLgd(input.lgd)!
  const activity = activityByCode(input.activity)
  const feas = assessFeasibility(village, activity, input.userCompetitorCount)
  const fit = founderFit(input.fit, village.facilities.mandiKm)
  const familyLabour = fit.familyLabourPersons
  const cap = marketCapFor(feas)
  const seed = seedOf(JSON.stringify(input))
  const ctx = { familyLabour, marketCap: cap }

  // 1. Naive ceiling: project = margin ÷ 10%, loan 90%, stretched to fill it.
  const naiveCost = Math.min(input.margin / 0.1, 5000000)
  const sizesAsc = [...activity.sizes].sort((a, b) => sizeCost(a) - sizeCost(b))
  const base = [...sizesAsc].reverse().find((s) => sizeCost(s) <= naiveCost) ?? sizesAsc[0]
  const naive = buildScenario({ activity, size: base, scale: naiveCost / sizeCost(base) }, input.margin, input, { ...ctx, needBased: false, seed })

  // 2. What the person asked for (or the largest they can afford if "suggest me").
  const affordable = sizesAsc.filter((s) => {
    const sc = buildScenario({ activity, size: s, scale: 1 }, input.margin, input, { ...ctx, needBased: true, mcRuns: false })
    return sc.marginShort === 0 && sc.route.eligible
  })
  const chosenSize = input.sizeId ? activity.sizes.find((s) => s.id === input.sizeId)! : affordable[affordable.length - 1] ?? sizesAsc[0]
  const chosen = buildScenario({ activity, size: chosenSize, scale: 1 }, input.margin, input, { ...ctx, needBased: true, seed })

  // 3. Recommended = the largest unit ≤ chosen that meets DSCR ≥ 1.5 and P(default) ≤ 15%.
  let recommended = chosen
  if (!chosen.passes) {
    const smaller = sizesAsc.filter((s) => sizeCost(s) < sizeCost(chosenSize)).reverse()
    const scen = smaller.map((s) => buildScenario({ activity, size: s, scale: 1 }, input.margin, input, { ...ctx, needBased: true, seed }))
    recommended = scen.find((x) => x.passes) ?? [chosen, ...scen].sort((a, b) => (a.mc?.pDefault ?? 1) - (b.mc?.pDefault ?? 1))[0]
  }

  // Verdict
  const reasons: Plan['reasons'] = []
  const pD = recommended.mc?.pDefault ?? 1
  const minD = recommended.projection?.minDscr ?? 0
  let verdict: Verdict = 'go'
  if (!recommended.route.eligible) {
    verdict = 'rethink'
    reasons.push({ en: 'Not eligible for this corporation, see other schemes.', hi: 'इस निगम के लिए पात्र नहीं, दूसरी योजनाएँ देखें।' })
  } else if (!recommended.passes) {
    verdict = minD < 1.2 || pD > THRESHOLDS.pDefaultRed ? 'rethink' : 'caution'
    reasons.push({ en: `Safest size found (${recommended.unit.size.label.en}) still has repayment cover ${minD.toFixed(2)} and a ${Math.round(pD * 100)}% chance of trouble.`, hi: `सबसे सुरक्षित आकार (${recommended.unit.size.label.hi}) में भी किस्त चुकाने की क्षमता ${minD.toFixed(2)} और ${Math.round(pD * 100)}% दिक़्क़त की संभावना।` })
  }
  if (fit.score < THRESHOLDS.founderFitLow) {
    if (verdict === 'go') verdict = 'caution'
    reasons.push({ en: `Founder-Fit ${fit.score}/100, training first will protect this loan.`, hi: `फ़ाउंडर-फ़िट ${fit.score}/100, पहले प्रशिक्षण लें, लोन सुरक्षित रहेगा।` })
  }
  if (feas.saturation.label === 'crowded' && !feas.demand.uncapped) {
    if (verdict === 'go') verdict = 'caution'
    reasons.push({ en: `Crowded: ${feas.competitors.low}–${feas.competitors.high} similar units already within 5 km.`, hi: `भीड़: 5 किमी में पहले से ${feas.competitors.low}–${feas.competitors.high} ऐसी इकाइयाँ।` })
  }
  if (recommended !== chosen && recommended.passes) {
    reasons.unshift({ en: `Borrow ${rupee(recommended.loan)} for ${recommended.unit.size.label.en}, not ${rupee(chosen.loan)}. Repayment stays safe.`, hi: `${recommended.unit.size.label.hi} के लिए ${rupee(recommended.loan)} लें, ${rupee(chosen.loan)} नहीं। किस्त सुरक्षित रहेगी।` })
  }
  if (verdict === 'go' && reasons.length === 0) reasons.push({ en: 'Repayment cover is healthy and the market has room.', hi: 'किस्त चुकाने की क्षमता अच्छी है और बाज़ार में जगह है।' })

  // Top risks
  const topRisks: Plan['topRisks'] = []
  const order = { high: 0, medium: 1, low: 2 }
  const proj = recommended.projection
  if (proj?.moneylenderMonth) topRisks.push({ level: 'high', en: `Money may run out in month ${proj.moneylenderMonth}. Keep some savings aside.`, hi: `महीने ${proj.moneylenderMonth} में पैसा ख़त्म हो सकता है। कुछ बचत अलग रखें।` })
  for (const t of [...feas.threats].sort((a, b) => order[a.level] - order[b.level])) topRisks.push({ level: t.level, en: t.en, hi: t.hi })
  if (fit.score < 50) topRisks.splice(1, 0, { level: 'high', en: 'You have little experience in this work. Get training first.', hi: 'इस काम का अनुभव कम है। पहले प्रशिक्षण लें।' })

  // SWOT from facts only
  const swot: Plan['swot'] = { S: [], W: [], O: [], T: [] }
  for (const p of fit.parts) {
    if (p.got / p.max >= 0.7) swot.S.push({ en: p.en, hi: p.hi })
    else if (p.got / p.max <= 0.35) swot.W.push({ en: p.en, hi: p.hi })
  }
  if (feas.demand.uncapped) swot.S.push({ en: feas.demand.channelNote.en, hi: feas.demand.channelNote.hi, fact: activity.channel === 'milkCentre' ? 'F9' : 'F6' })
  if (feas.saturation.label === 'gap') swot.O.push({ en: `Few similar units nearby (${feas.saturation.index.toFixed(2)}× district level).`, hi: `आस-पास ऐसी इकाइयाँ कम (ज़िले का ${feas.saturation.index.toFixed(2)}×)।`, fact: 'F5' })
  if (feas.saturation.label === 'crowded') swot.T.push({ en: `Crowded market (${feas.saturation.index.toFixed(2)}× district level).`, hi: `भीड़ वाला बाज़ार (ज़िले का ${feas.saturation.index.toFixed(2)}×)।`, fact: 'F5' })
  swot.O.push({ en: `${feas.catchment5.households.toLocaleString('en-IN')} households within 5 km.`, hi: `5 किमी में ${feas.catchment5.households.toLocaleString('en-IN')} परिवार।`, fact: 'F2' })
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const MH = ['जन', 'फ़र', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नव', 'दिस']
  if (feas.seasonality.peakMonths.length) swot.O.push({ en: `Peak months: ${feas.seasonality.peakMonths.map((m) => M[m]).join(', ')}.`, hi: `सबसे अच्छे महीने: ${feas.seasonality.peakMonths.map((m) => MH[m]).join(', ')}।` })
  if (village.facilities.haat) swot.O.push({ en: 'Weekly haat in the village.', hi: 'गाँव में साप्ताहिक हाट।' })
  if (input.category === 'SC') swot.O.push({ en: 'PMEGP 35% subsidy can be stacked for a later expansion.', hi: 'आगे बढ़ाने के लिए PMEGP 35% सब्सिडी मिल सकती है।' })
  for (const t of feas.threats.filter((x) => x.level !== 'low')) swot.T.push({ en: t.en, hi: t.hi, fact: t.id === 'T-input' ? 'F8' : undefined })
  if (recommended.marginShort > 0) swot.W.push({ en: `Margin short by ${rupee(recommended.marginShort)}.`, hi: `मार्जिन ${rupee(recommended.marginShort)} कम।` })
  if (!swot.W.length) swot.W.push({ en: 'First business, no track record with banks.', hi: 'पहला व्यवसाय, बैंक के साथ कोई रिकॉर्ड नहीं।' })

  // Alternatives: demand gap × fit × capital fit × (1 − risk)
  const altFit = founderFit({ ...input.fit, experience: 0 }, village.facilities.mandiKm)
  const alternatives: Plan['alternatives'] = []
  for (const a of opts.alternatives === false ? [] : ACTIVITIES) {
    if (a.code === activity.code) continue
    const f = assessFeasibility(village, a)
    const c = marketCapFor(f)
    let best: Scenario | null = null
    for (const s of [...a.sizes].sort((x, y) => sizeCost(y) - sizeCost(x))) {
      const sc = buildScenario({ activity: a, size: s, scale: 1 }, input.margin, input, { familyLabour, marketCap: c, needBased: true, seed })
      if (sc.passes) { best = sc; break }
      if (!best || (sc.mc?.pDefault ?? 1) < (best.mc?.pDefault ?? 1)) best = sc
    }
    if (!best || !best.route.eligible) continue
    const gap = f.demand.uncapped ? 0.8 : Math.max(0.1, Math.min(1.2, 1.6 - f.saturation.index))
    const capFit = best.marginShort === 0 ? 1 : 0.3
    const score = gap * (altFit.score / 100 + 0.4) * capFit * (1 - (best.mc?.pDefault ?? 1)) * (best.passes ? 1.3 : 0.7)
    alternatives.push({ activity: a, size: best.unit.size, scenario: best, score, saturation: f.saturation.label })
  }
  alternatives.sort((a, b) => b.score - a.score)

  const q = recommended.schedule?.instalment ?? 0
  const perDay = q / 91
  const localUnits = perDay / activity.localUnit.price

  const id = opts.id ?? 'GUS-' + Math.floor(hash01(JSON.stringify(input) + Date.now()) * 90000 + 10000)
  return {
    id,
    createdAt: opts.createdAt ?? new Date().toISOString(),
    input,
    ruleVersion: RULESET_VERSION,
    dataVersion: DATA_VERSION,
    feasibility: feas,
    fit,
    naive,
    chosen,
    recommended,
    verdict,
    reasons,
    topRisks: topRisks.slice(0, 3),
    swot,
    alternatives: alternatives.slice(0, 3),
    perDay,
    localUnits,
  }
}
