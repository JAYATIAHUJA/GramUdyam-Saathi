import { OTHER_SCHEMES, RULES, type SchemeRule, type SocialCategory } from './rules'

export type FlagCode =
  | 'A1_MARGIN_ABOVE_5L'
  | 'A2_CAP_BINDS'
  | 'A3_NEAR_BOUNDARY'
  | 'A4_PLANTATION'
  | 'A5_INELIGIBLE'
  | 'MARGIN_SHORT'
  | 'OUT_OF_SCHEME'

export interface RouterFlag {
  code: FlagCode
  severity: 'info' | 'warn' | 'block'
  en: string
  hi: string
}

export interface RouteResult {
  eligible: boolean
  rule: SchemeRule | null
  projectCost: number
  loan: number
  contribution: number
  contributionPct: number
  moratoriumQ: number
  flags: RouterFlag[]
  alternatives: { rule: SchemeRule; projectCost: number; loan: number; contribution: number }[]
  otherSchemes: typeof OTHER_SCHEMES
}

const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')

export function rulesFor(category: SocialCategory) {
  return RULES.filter((r) => r.category === category).sort((a, b) => a.minCost - b.minCost)
}

export function ruleForCost(category: SocialCategory, cost: number) {
  const rs = rulesFor(category)
  return rs.find((r) => cost >= r.minCost && cost <= r.maxCost) ?? null
}

export function loanFor(rule: SchemeRule, cost: number) {
  return Math.min(Math.round(cost * rule.loanPct), rule.maxLoan)
}

/** Pure router: project cost + person → product, loan, contribution, edge-case flags. */
export function route(input: {
  projectCost: number
  category: SocialCategory
  familyIncome: number
  plantation?: boolean
  margin?: number
}): RouteResult {
  const { category, familyIncome, plantation, margin } = input
  const flags: RouterFlag[] = []
  const rs = rulesFor(category)
  const top = rs[rs.length - 1]
  let projectCost = input.projectCost

  const incomeMax = rs[0]?.incomeMax
  if (incomeMax != null && familyIncome > incomeMax) {
    flags.push({
      code: 'A5_INELIGIBLE',
      severity: 'block',
      en: `Family income ${fmt(familyIncome)} is above the ${fmt(incomeMax)} limit for ${rs[0].corporation}. Route to PMEGP / Mudra.`,
      hi: `परिवार की आय ${fmt(familyIncome)} है, ${rs[0].corporation} की सीमा ${fmt(incomeMax)} से ज़्यादा। PMEGP / मुद्रा देखें।`,
    })
    return { eligible: false, rule: null, projectCost, loan: 0, contribution: projectCost, contributionPct: 1, moratoriumQ: 0, flags, alternatives: [], otherSchemes: OTHER_SCHEMES }
  }

  if (projectCost > top.maxCost) {
    flags.push({
      code: margin && margin > 500000 ? 'A1_MARGIN_ABOVE_5L' : 'OUT_OF_SCHEME',
      severity: 'warn',
      en: `Project capped at ${fmt(top.maxCost)} (scheme maximum). Keep the rest as working-capital buffer, or look at Stand-Up India / PMEGP.`,
      hi: `प्रोजेक्ट ${fmt(top.maxCost)} (योजना की अधिकतम सीमा) पर रोका गया। बाकी पैसा कार्यशील पूंजी के लिए रखें, या स्टैंड-अप इंडिया / PMEGP देखें।`,
    })
    projectCost = top.maxCost
  }

  const rule = ruleForCost(category, projectCost)!
  const loan = loanFor(rule, projectCost)
  const contribution = projectCost - loan
  const moratoriumQ = plantation && rule.plantationMoratoriumQ ? rule.plantationMoratoriumQ : rule.moratoriumQ

  if (plantation && rule.plantationMoratoriumQ) {
    flags.push({
      code: 'A4_PLANTATION',
      severity: 'info',
      en: `Plantation/construction activity: moratorium extended to ${rule.plantationMoratoriumQ * 3} months.`,
      hi: `पौधारोपण/निर्माण कार्य: मोहलत ${rule.plantationMoratoriumQ * 3} महीने तक बढ़ी।`,
    })
  }

  if (projectCost * rule.loanPct > rule.maxLoan && projectCost <= rule.maxCost) {
    const fitCost = Math.floor(rule.maxLoan / rule.loanPct)
    flags.push({
      code: 'A2_CAP_BINDS',
      severity: 'warn',
      en: `Loan cap ${fmt(rule.maxLoan)} binds: you must put in ${fmt(contribution)} (${((contribution / projectCost) * 100).toFixed(1)}%), not 10%. Or keep the project at ${fmt(fitCost)}.`,
      hi: `लोन सीमा ${fmt(rule.maxLoan)} लागू: आपको ${fmt(contribution)} (${((contribution / projectCost) * 100).toFixed(1)}%) लगाने होंगे, 10% नहीं। या प्रोजेक्ट ${fmt(fitCost)} रखें।`,
    })
  }

  if (margin != null && rule.marginRequired && margin < contribution) {
    flags.push({
      code: 'MARGIN_SHORT',
      severity: 'warn',
      en: `You have ${fmt(margin)}; this plan needs ${fmt(contribution)} from you, ${fmt(contribution - margin)} short.`,
      hi: `आपके पास ${fmt(margin)} हैं; इस योजना में आपका हिस्सा ${fmt(contribution)}, ${fmt(contribution - margin)} कम।`,
    })
  }

  // A3: near a product boundary, show neighbouring product side by side.
  const alternatives: RouteResult['alternatives'] = []
  for (const other of rs) {
    if (other.id === rule.id) continue
    const boundary = other.maxCost < rule.minCost ? other.maxCost : other.minCost
    if (Math.abs(projectCost - boundary) / boundary <= 0.1) {
      const altCost = other.maxCost < rule.minCost ? Math.min(other.maxCost, Math.ceil(other.maxLoan / other.loanPct)) : other.minCost
      const altLoan = loanFor(other, altCost)
      alternatives.push({ rule: other, projectCost: altCost, loan: altLoan, contribution: altCost - altLoan })
    }
  }
  if (alternatives.length) {
    flags.push({
      code: 'A3_NEAR_BOUNDARY',
      severity: 'info',
      en: `You are close to the ${fmt(rule.minCost > 0 ? rule.minCost - 1 : rule.maxCost)} boundary. Compare ${alternatives[0].rule.product} side by side.`,
      hi: `आप ${fmt(rule.minCost > 0 ? rule.minCost - 1 : rule.maxCost)} की सीमा के पास हैं। ${alternatives[0].rule.productHi} से तुलना देखें।`,
    })
  }

  return {
    eligible: true,
    rule,
    projectCost,
    loan,
    contribution,
    contributionPct: contribution / projectCost,
    moratoriumQ,
    flags,
    alternatives,
    otherSchemes: OTHER_SCHEMES,
  }
}

/** The problem statement's formula: project = margin ÷ 10%, loan = 90%, caps applied. */
export function naiveCeiling(margin: number, category: SocialCategory, familyIncome: number, plantation = false) {
  const raw = margin / 0.1
  return { rawProject: raw, ...route({ projectCost: raw, category, familyIncome, plantation, margin }) }
}
