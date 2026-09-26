// Quarterly amortisation with moratorium. r = annual rate / 4 (nominal).
// Golden: ₹9,00,000 @ 8%, 2 moratorium + 26 repayment quarters
//   serviced    → 2 × ₹18,000 then 26 × ₹44,729
//   capitalised → principal ₹9,36,360, 26 × ₹46,536

export type MoratoriumMode = 'serviced' | 'capitalised'

export interface ScheduleRow {
  q: number
  phase: 'moratorium' | 'repayment'
  opening: number
  interest: number
  principal: number
  payment: number
  closing: number
}

export interface Schedule {
  principal: number
  ratePa: number
  totalQ: number
  moratoriumQ: number
  mode: MoratoriumMode
  principalAfterMoratorium: number
  moratoriumPayment: number
  instalment: number
  rows: ScheduleRow[]
  totalPaid: number
  totalInterest: number
}

export function annuity(p: number, r: number, n: number): number {
  if (n <= 0) return p
  if (r === 0) return p / n
  return (p * r) / (1 - Math.pow(1 + r, -n))
}

export function buildSchedule(
  principal: number,
  ratePa: number,
  totalQ: number,
  moratoriumQ: number,
  mode: MoratoriumMode = 'serviced',
): Schedule {
  const r = ratePa / 4
  const n = totalQ - moratoriumQ
  const rows: ScheduleRow[] = []
  let bal = principal
  for (let q = 1; q <= moratoriumQ; q++) {
    const interest = bal * r
    if (mode === 'serviced') {
      rows.push({ q, phase: 'moratorium', opening: bal, interest, principal: 0, payment: interest, closing: bal })
    } else {
      rows.push({ q, phase: 'moratorium', opening: bal, interest, principal: -interest, payment: 0, closing: bal + interest })
      bal += interest
    }
  }
  const pAfter = bal
  const emi = annuity(pAfter, r, n)
  for (let i = 1; i <= n; i++) {
    const interest = bal * r
    const prin = i === n ? bal : emi - interest
    const payment = i === n ? bal + interest : emi
    rows.push({ q: moratoriumQ + i, phase: 'repayment', opening: bal, interest, principal: prin, payment, closing: Math.max(0, bal - prin) })
    bal -= prin
  }
  const totalPaid = rows.reduce((s, x) => s + x.payment, 0)
  return {
    principal,
    ratePa,
    totalQ,
    moratoriumQ,
    mode,
    principalAfterMoratorium: pAfter,
    moratoriumPayment: mode === 'serviced' ? principal * r : 0,
    instalment: emi,
    rows,
    totalPaid,
    totalInterest: totalPaid - principal,
  }
}

/** Interest and principal paid in each loan year (4 quarters per year). */
export function yearlyDebtService(s: Schedule, years: number) {
  const out = Array.from({ length: years }, () => ({ interest: 0, principal: 0 }))
  for (const row of s.rows) {
    const y = Math.floor((row.q - 1) / 4)
    if (y >= years) continue
    if (row.phase === 'moratorium' && s.mode === 'capitalised') continue
    out[y].interest += row.interest
    out[y].principal += Math.max(0, row.principal)
  }
  return out
}
