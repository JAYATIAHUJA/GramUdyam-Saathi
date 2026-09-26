// Versioned scheme rules. Rules are data, never logic: an admin can change a
// rate here (or in the rule editor) without touching the engine.

export type Corporation = 'NSFDC' | 'NBCFDC' | 'NSKFDC'
export type SocialCategory = 'SC' | 'OBC' | 'SAFAI'

export interface SchemeRule {
  id: string
  corporation: Corporation
  product: string
  productHi: string
  category: SocialCategory
  minCost: number
  maxCost: number
  loanPct: number
  maxLoan: number
  ratePa: number
  tenureQ: number // total quarters incl. moratorium
  moratoriumQ: number
  plantationMoratoriumQ?: number
  incomeMax: number | null
  marginRequired: boolean
  source: string
  effectiveFrom: string
  confidence: 'official' | 'verify'
  note?: string
}

export const RULESET_VERSION = 'rules-2026.09.1'

export const RULES: SchemeRule[] = [
  {
    id: 'nsfdc_mfs_v2026_1',
    corporation: 'NSFDC',
    product: 'Micro Finance',
    productHi: 'माइक्रो फाइनेंस',
    category: 'SC',
    minCost: 0,
    maxCost: 140000,
    loanPct: 0.9,
    maxLoan: 125000,
    ratePa: 0.065,
    tenureQ: 12,
    moratoriumQ: 1,
    incomeMax: 300000,
    marginRequired: true,
    source: 'nsfdc.nic.in/scheme',
    effectiveFrom: '2026-01-01',
    confidence: 'official',
  },
  {
    id: 'nsfdc_tl_v2026_1',
    corporation: 'NSFDC',
    product: 'Term Loan',
    productHi: 'टर्म लोन',
    category: 'SC',
    minCost: 140001,
    maxCost: 5000000,
    loanPct: 0.9,
    maxLoan: 4500000,
    ratePa: 0.08,
    tenureQ: 28,
    moratoriumQ: 2,
    plantationMoratoriumQ: 4,
    incomeMax: 300000,
    marginRequired: true,
    source: 'nsfdc.nic.in/scheme',
    effectiveFrom: '2026-01-01',
    confidence: 'official',
  },
  {
    id: 'nbcfdc_mf_v2026_1',
    corporation: 'NBCFDC',
    product: 'Micro Finance',
    productHi: 'माइक्रो फाइनेंस',
    category: 'OBC',
    minCost: 0,
    maxCost: 138889,
    loanPct: 0.9,
    maxLoan: 125000,
    ratePa: 0.07,
    tenureQ: 16,
    moratoriumQ: 1,
    incomeMax: 300000,
    marginRequired: true,
    source: 'nbcfdc.gov.in/faq',
    effectiveFrom: '2026-01-01',
    confidence: 'verify',
    note: 'NBCFDC FAQ and flyer disagree on rates; SCA to confirm.',
  },
  {
    id: 'nbcfdc_gl_v2026_1',
    corporation: 'NBCFDC',
    product: 'General Loan',
    productHi: 'सामान्य ऋण',
    category: 'OBC',
    minCost: 138890,
    maxCost: 1764706,
    loanPct: 0.85,
    maxLoan: 1500000,
    ratePa: 0.08,
    tenureQ: 28,
    moratoriumQ: 1,
    incomeMax: 300000,
    marginRequired: true,
    source: 'nbcfdc.gov.in/faq',
    effectiveFrom: '2026-01-01',
    confidence: 'verify',
    note: '85% financing share, beneficiary contributes 15%, not 10%.',
  },
  {
    id: 'nskfdc_mcf_v2026_1',
    corporation: 'NSKFDC',
    product: 'Micro Credit Finance',
    productHi: 'माइक्रो क्रेडिट',
    category: 'SAFAI',
    minCost: 0,
    maxCost: 100000,
    loanPct: 0.9,
    maxLoan: 90000,
    ratePa: 0.05,
    tenureQ: 15,
    moratoriumQ: 3,
    incomeMax: null,
    marginRequired: false,
    source: 'nskfdc.nic.in',
    effectiveFrom: '2026-01-01',
    confidence: 'verify',
    note: 'Promoter contribution "not insisted upon"; 4-month implementation + 6-month moratorium modelled as 3 quarters.',
  },
  {
    id: 'nskfdc_gtl_v2026_1',
    corporation: 'NSKFDC',
    product: 'General Term Loan',
    productHi: 'सामान्य टर्म लोन',
    category: 'SAFAI',
    minCost: 100001,
    maxCost: 1666667,
    loanPct: 0.9,
    maxLoan: 1500000,
    ratePa: 0.09,
    tenureQ: 40,
    moratoriumQ: 3,
    incomeMax: null,
    marginRequired: true,
    source: 'nskfdc.nic.in',
    effectiveFrom: '2026-01-01',
    confidence: 'verify',
  },
]

// Schemes outside MoSJE the router points to when NSFDC-family rules do not fit.
export const OTHER_SCHEMES = [
  { id: 'pmegp', name: 'PMEGP', nameHi: 'पीएमईजीपी', what: '35% margin-money subsidy (rural, special category)', whatHi: '35% सब्सिडी (ग्रामीण, विशेष वर्ग)', cap: 'Up to ₹50 L (mfg) / ₹20 L (service)' },
  { id: 'mudra', name: 'PM Mudra', nameHi: 'मुद्रा', what: 'Collateral-free loan via banks', whatHi: 'बिना गारंटी बैंक ऋण', cap: 'Up to ₹20 L (Tarun Plus)' },
  { id: 'standup', name: 'Stand-Up India', nameHi: 'स्टैंड-अप इंडिया', what: 'SC/ST and women, greenfield units', whatHi: 'SC/ST व महिलाएँ, नई इकाई', cap: '₹10 L – ₹1 Cr' },
]

export const THRESHOLDS = {
  dscrComfort: 1.5,
  dscrFloor: 1.0,
  pDefaultMax: 0.15,
  pDefaultRed: 0.35,
  founderFitLow: 50,
}
