import { clsx } from 'clsx'
import { useMemo, useState } from 'react'
import { CashRunway, DscrBars, McHistogram } from '../charts'
import { Collapse } from './Collapse'
import { Section } from './Section'
import { Slider } from './Slider'
import { ConfidenceBadge } from '../ui'
import { project } from '../../engine/business'
import type { Plan } from '../../engine/plan'
import { dscr, inr, lakh, pct } from '../../lib/format'
import { useT } from '../../lib/store'

/** Charts, the what-if sliders and the full tables. Assumes an eligible plan. */
export function LoanDetails({ plan }: { plan: Plan }) {
  const t = useT()
  const r = plan.recommended
  const s = r.schedule!
  const proj = r.projection!
  const [price, setPrice] = useState(0)
  const [sales, setSales] = useState(0)
  const [showSched, setShowSched] = useState(false)
  const [showPL, setShowPL] = useState(false)
  const whatIf = useMemo(
    () => project(r.unit, s, { familyLabour: plan.fit.familyLabourPersons, marketCap: plan.feasibility.demand.uncapped ? null : (plan.feasibility.demand.monthlyLow + plan.feasibility.demand.monthlyHigh) / 2, shock: { price: 1 + price / 100, volume: 1 + sales / 100, cost: 1, badYears: [] } }),
    [r, s, price, sales, plan],
  )
  const loanYears = Math.ceil(s.totalQ / 4)
  return (
      <div className="gap-x-4 lg:grid lg:grid-cols-2 xl:grid-cols-4">
      <Section title={t('Cash in hand, month by month', 'हाथ में पैसा, महीने दर महीने')}>
        <div className="card p-3">
          <CashRunway p={proj} />
          <p className="px-1 pt-1 text-[13.5px]">
            {proj.moneylenderMonth ? (
              <span className="font-semibold text-risk">{t(`Cash goes below zero in month ${proj.moneylenderMonth}. Without a buffer, this is when people go to a moneylender.`, `महीने ${proj.moneylenderMonth} में पैसा शून्य से नीचे। बचत के बिना लोग इसी समय साहूकार के पास जाते हैं।`)}</span>
            ) : (
              <span className="font-semibold text-go">{t(`Working capital of ${inr(r.unit.size.workingCapital)} keeps cash above zero through lean months.`, `${inr(r.unit.size.workingCapital)} की कार्यशील पूंजी कमज़ोर महीनों में भी पैसा बचाए रखती है।`)}</span>
            )}
          </p>
        </div>
      </Section>

      <Section title={t('Can the unit pay the bank each year?', 'क्या हर साल बैंक की किस्त निकलेगी?')}>
        <div className="card p-3">
          <DscrBars p={proj} loanYears={loanYears} />
          <p className="px-1 text-[12.5px] text-muted">{t('DSCR = cash available ÷ amount due. Banks look for 1.5 or more.', 'DSCR = उपलब्ध पैसा ÷ देय रकम। बैंक 1.5 या ज़्यादा चाहते हैं।')}</p>
        </div>
      </Section>

      {r.mc && (
        <Section title={t('1,000 possible futures', '1,000 संभावित हालात')} aside={<ConfidenceBadge c="model" />}>
          <div className="card p-3">
            <McHistogram mc={r.mc} />
            <p className="px-1 text-[13.5px]">
              {t(
                `Prices, sales and costs varied, bad years included. In ${Math.round(r.mc.pDefault * 1000)} of 1,000 futures, some year could not cover the instalment.`,
                `दाम, बिक्री और ख़र्च बदलकर, ख़राब साल भी शामिल। 1,000 में से ${Math.round(r.mc.pDefault * 1000)} हालात में किसी साल किस्त नहीं निकली।`,
              )}
            </p>
          </div>
        </Section>
      )}

      <Section title={t('What if…', 'अगर…')}>
        <div className="card space-y-4 p-4">
          <Slider label={t('Selling price', 'बिक्री का दाम')} v={price} set={setPrice} min={-20} max={20} />
          <Slider label={t('Sales volume', 'बिक्री की मात्रा')} v={sales} set={setSales} min={-40} max={20} />
          {whatIf && (
            <div className="flex items-center justify-between rounded-lg bg-khadi px-3 py-2">
              <span className="text-[14px]">{t('Worst-year DSCR', 'सबसे ख़राब साल DSCR')}</span>
              <span className={clsx('num text-[24px] font-bold', whatIf.minDscr >= 1.5 ? 'text-go' : whatIf.minDscr >= 1 ? 'text-caution' : 'text-risk')}>{dscr(whatIf.minDscr)}</span>
            </div>
          )}
        </div>
      </Section>

      <div className="lg:col-span-2">
      <Collapse open={showSched} toggle={() => setShowSched((x) => !x)} title={t(`Repayment schedule (${s.rows.length} quarters)`, `किस्त तालिका (${s.rows.length} तिमाही)`)}>
        <div className="max-h-80 overflow-auto">
          <table className="w-full text-[13px]">
            <thead className="sticky top-0 bg-white">
              <tr className="text-right text-muted">
                <th className="px-2 py-1.5 text-left">Q</th>
                <th className="px-2">{t('Opening', 'शुरू')}</th>
                <th className="px-2">{t('Interest', 'ब्याज')}</th>
                <th className="px-2">{t('Principal', 'मूल')}</th>
                <th className="px-2">{t('Pay', 'भरें')}</th>
              </tr>
            </thead>
            <tbody className="num">
              {s.rows.map((row) => (
                <tr key={row.q} className={clsx('border-t border-line text-right', row.phase === 'moratorium' && 'bg-marigold-soft/60')}>
                  <td className="px-2 py-1 text-left">{row.q}</td>
                  <td className="px-2">{inr(row.opening)}</td>
                  <td className="px-2">{inr(row.interest)}</td>
                  <td className="px-2">{inr(Math.max(0, row.principal))}</td>
                  <td className="px-2 font-bold">{inr(row.payment)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[12.5px] text-muted">
          {t('Total paid', 'कुल भुगतान')} {inr(s.totalPaid)} · {t('interest', 'ब्याज')} {inr(s.totalInterest)}
        </p>
      </Collapse>
      </div>

      <div className="lg:col-span-2">
      <Collapse open={showPL} toggle={() => setShowPL((x) => !x)} title={t('5-year profit & loss', '5 साल का लाभ-हानि')}>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-right text-muted">
                <th className="px-2 py-1.5 text-left" />
                {proj.years.slice(0, 5).map((y) => (
                  <th key={y.year} className="px-2">
                    {t('Y', 'व')}
                    {y.year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="num">
              {(
                [
                  [t('Sales', 'बिक्री'), 'revenue'],
                  [t('Materials', 'सामग्री'), 'variable'],
                  [t('Fixed costs', 'स्थायी ख़र्च'), 'fixed'],
                  [t('Hired help', 'मज़दूरी'), 'hiredLabour'],
                  [t('Family draw', 'घर ख़र्च'), 'draw'],
                  [t('Interest', 'ब्याज'), 'interest'],
                  [t('Depreciation', 'घिसाई'), 'depreciation'],
                  [t('Net profit', 'शुद्ध लाभ'), 'netProfit'],
                ] as const
              ).map(([label, k]) => (
                <tr key={k} className={clsx('border-t border-line text-right', k === 'netProfit' && 'font-bold')}>
                  <td className="px-2 py-1 text-left font-sans text-muted">{label}</td>
                  {proj.years.slice(0, 5).map((y) => (
                    <td key={y.year} className="px-2">
                      {lakh(y[k])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[12.5px] text-muted">
          NPV @12%: {inr(proj.npv)} · IRR: {proj.irr != null ? pct(proj.irr, 1) : '-'} · {t('payback', 'वापसी')}: {proj.paybackMonth ? t(`month ${proj.paybackMonth}`, `महीना ${proj.paybackMonth}`) : t('after 24 months', '24 महीने बाद')}
        </p>
      </Collapse>
      </div>
      </div>
  )
}
