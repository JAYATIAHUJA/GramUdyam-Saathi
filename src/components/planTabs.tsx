import { clsx } from 'clsx'
import { ArrowRight, Check, ChevronDown, Download, ExternalLink, GraduationCap, MapPin, MessageCircle, Phone, Send } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CatchmentMap } from './CatchmentMap'
import { CashRunway, DemandVsBreakeven, DscrBars, McHistogram, SeasonBars } from './charts'
import { ConfidenceBadge, FactRow, VerdictPill } from './ui'
import { DISTRICT } from '../data/villages'
import { project } from '../engine/business'
import type { Plan, Scenario, Verdict } from '../engine/plan'
import { inr, lakh, pct, MONTHS_EN, MONTHS_HI, dscr } from '../lib/format'
import { planFor } from '../lib/plans'
import { useApp, useT, type SavedCase } from '../lib/store'

function Section({ title, children, aside }: { title: ReactNode; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="mb-7">
      <div className="mb-3 flex items-end justify-between gap-2">
        <h2 className="font-display text-[20px] font-bold leading-tight text-indigo-deep">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

/* ---------------- Market ---------------- */
export function MarketTab({ plan }: { plan: Plan }) {
  const t = useT()
  const f = plan.feasibility
  const p = plan.recommended.projection
  const sat = f.saturation
  const satTxt = { crowded: t('Crowded', 'भीड़'), normal: t('Normal', 'सामान्य'), gap: t('Gap — room to grow', 'कमी — जगह है') }[sat.label]
  const satCls = { crowded: 'text-risk bg-risk-soft', normal: 'text-caution bg-caution-soft', gap: 'text-go bg-go-soft' }[sat.label]
  return (
    <div>
      <Section title={t('Your market, 5 and 10 km', 'आपका बाज़ार, 5 और 10 किमी')} aside={<ConfidenceBadge c={f.confidence === 'Low' ? 'model' : 'official'} />}>
        <CatchmentMap f={f} />
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-white p-3">
            <div className="num text-[22px] font-bold">{f.catchment5.population.toLocaleString('en-IN')}</div>
            <div className="text-[12px] text-muted">{t('people in 5 km', '5 किमी में लोग')}</div>
          </div>
          <div className="rounded-xl bg-white p-3">
            <div className="num text-[22px] font-bold">
              {f.competitors.low}–{f.competitors.high}
            </div>
            <div className="text-[12px] text-muted">{t('similar units', 'ऐसी इकाइयाँ')}</div>
          </div>
          <div className={clsx('rounded-xl p-3', satCls)}>
            <div className="num text-[22px] font-bold">{sat.index.toFixed(2)}×</div>
            <div className="text-[12px] font-semibold">{satTxt}</div>
          </div>
        </div>
        {f.confidence === 'Low' && (
          <p className="mt-3 rounded-lg bg-caution-soft px-3 py-2 text-[13.5px] text-caution">{t('Thin data for this village (no pakka road in the records). Block averages used — confidence Low.', 'इस गाँव का डेटा कम है। ब्लॉक औसत लिया — भरोसा कम।')}</p>
        )}
      </Section>

      <Section title={t('Can sales cover the costs?', 'क्या बिक्री से ख़र्च निकलेगा?')}>
        <div className="card p-4">
          {p && <DemandVsBreakeven expected={p.expectedMonthlySales} breakeven={p.breakEvenMonthlySales} />}
          <p className="mt-3 border-t border-line pt-3 text-[13.5px]">{t(f.demand.channelNote.en, f.demand.channelNote.hi)}</p>
        </div>
      </Section>

      <Section title={t('Good months and lean months', 'अच्छे और कमज़ोर महीने')}>
        <div className="card p-4">
          <SeasonBars idx={f.seasonality.index} lean={f.seasonality.leanMonths} />
          <p className="mt-2 text-[13.5px]">
            {t('Lean', 'कमज़ोर')}: <b>{f.seasonality.leanMonths.map((m) => t(MONTHS_EN[m], MONTHS_HI[m])).join(', ') || '—'}</b>
            {f.seasonality.peakMonths.length > 0 && (
              <>
                {' '}
                · {t('Best', 'सबसे अच्छे')}: <b>{f.seasonality.peakMonths.map((m) => t(MONTHS_EN[m], MONTHS_HI[m])).join(', ')}</b>
              </>
            )}
          </p>
        </div>
      </Section>

      <Section title={t('Price to charge', 'कितना दाम लें')}>
        <div className="card p-4">
          <div className="text-[14px] text-muted">{t(f.price.item.en, f.price.item.hi)}</div>
          <div className="relative mt-6 mb-2 h-2 rounded-full bg-gradient-to-r from-caution-soft via-go-soft to-caution-soft">
            <span className="absolute -top-6 -translate-x-1/2 rounded bg-indigo px-1.5 text-[12px] font-bold text-white" style={{ left: `${((f.price.suggested - f.price.low) / (f.price.high - f.price.low)) * 100}%` }}>
              {f.price.unit.en === '%' ? `${f.price.suggested}%` : `₹${f.price.suggested}`}
            </span>
            <span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-indigo" style={{ left: `${((f.price.suggested - f.price.low) / (f.price.high - f.price.low)) * 100}%` }} />
          </div>
          <div className="flex justify-between text-[12.5px] text-muted">
            <span>{f.price.unit.en === '%' ? `${f.price.low}%` : `₹${f.price.low}`}</span>
            <span>
              {t('per', 'प्रति')} {t(f.price.unit.en, f.price.unit.hi)}
            </span>
            <span>{f.price.unit.en === '%' ? `${f.price.high}%` : `₹${f.price.high}`}</span>
          </div>
          <p className="mt-3 text-[14px]">
            {t('Suggested', 'सुझाया')} {f.price.unit.en === '%' ? `${f.price.suggested}%` : `₹${f.price.suggested}`} → {t('margin', 'मार्जिन')} <b>{pct(f.price.marginPct)}</b>
          </p>
        </div>
      </Section>

      <Section title={t('Where to sell', 'कहाँ बेचें')}>
        <ul className="space-y-2">
          {f.activity.channels.map((c, i) => (
            <li key={i} className="flex items-center gap-2 text-[15px]">
              <MapPin className="size-4 text-indigo" /> {t(c.en, c.hi)}
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t('Every number, with its source', 'हर संख्या, उसके स्रोत के साथ')}>
        <div className="card px-4">
          {f.facts.map((x) => (
            <FactRow key={x.id} label={`${x.id} · ${t(x.label.en, x.label.hi)}`} value={x.display} source={x.source} year={x.year} c={x.confidence} />
          ))}
        </div>
      </Section>
    </div>
  )
}

/* ---------------- Money ---------------- */
export function MoneyTab({ plan, caseId }: { plan: Plan; caseId: string }) {
  const t = useT()
  const { cases, addCase } = useApp()
  const r = plan.recommended
  const [price, setPrice] = useState(0)
  const [sales, setSales] = useState(0)
  const [showSched, setShowSched] = useState(false)
  const [showPL, setShowPL] = useState(false)
  const s = r.schedule
  const whatIf = useMemo(() => {
    if (!s) return null
    return project(r.unit, s, { familyLabour: plan.fit.familyLabourPersons, marketCap: plan.feasibility.demand.uncapped ? null : (plan.feasibility.demand.monthlyLow + plan.feasibility.demand.monthlyHigh) / 2, shock: { price: 1 + price / 100, volume: 1 + sales / 100, cost: 1, badYears: [] } })
  }, [r, s, price, sales, plan])

  if (!r.route.eligible || !s || !r.projection) {
    return <p className="text-[15px]">{t('No NSFDC-family loan applies. See “Next steps” for PMEGP / Mudra.', 'NSFDC परिवार का लोन लागू नहीं। “आगे क्या” में PMEGP / मुद्रा देखें।')}</p>
  }
  const setMode = (mode: 'serviced' | 'capitalised') => {
    const existing = cases.find((x) => x.id === caseId)
    const base = existing ?? ({ id: caseId, input: plan.input, createdAt: plan.createdAt, status: 'draft', channel: 'self', remarks: [] } as SavedCase)
    addCase({ ...base, input: { ...base.input, mode } })
  }
  const rule = r.route.rule!
  const loanYears = Math.ceil(s.totalQ / 4)
  const flags = [...plan.naive.route.flags, ...r.route.flags].filter((f, i, a) => a.findIndex((x) => x.code === f.code) === i)

  const cols: { key: string; label: string; sc: Scenario; tone: string }[] = [
    { key: 'naive', label: t('10% formula', '10% फ़ॉर्मूला'), sc: plan.naive, tone: 'text-risk' },
    ...(plan.chosen !== plan.recommended ? [{ key: 'chosen', label: t('You asked', 'आपने माँगा'), sc: plan.chosen, tone: 'text-caution' }] : []),
    { key: 'rec', label: t('Saathi', 'साथी'), sc: r, tone: 'text-go' },
  ]
  const rows: [string, (x: Scenario) => ReactNode][] = [
    [t('Unit', 'इकाई'), (x) => (x.unit.scale > 1.01 ? `${t(x.unit.size.label.en, x.unit.size.label.hi)} ×${x.unit.scale.toFixed(1)}` : t(x.unit.size.label.en, x.unit.size.label.hi))],
    [t('Project cost', 'प्रोजेक्ट लागत'), (x) => lakh(x.projectCost)],
    [t('Loan', 'लोन'), (x) => <b>{lakh(x.loan)}</b>],
    [t('You put in', 'आपका हिस्सा'), (x) => lakh(x.contribution)],
    [t('Every 3 months', 'हर 3 महीने'), (x) => (x.schedule ? inr(x.schedule.instalment) : '—')],
    [t('Worst-year DSCR', 'सबसे ख़राब साल DSCR'), (x) => (x.projection ? dscr(x.projection.minDscr) : '—')],
    [t('Chance of trouble', 'दिक़्क़त की संभावना'), (x) => (x.mc ? pct(x.mc.pDefault) : '—')],
    [t('Cash runs out', 'पैसा ख़त्म'), (x) => (x.projection?.moneylenderMonth ? t(`month ${x.projection.moneylenderMonth}`, `महीना ${x.projection.moneylenderMonth}`) : t('never', 'कभी नहीं'))],
  ]

  return (
    <div>
      <Section title={t('Three ways to borrow', 'लोन के तीन रास्ते')}>
        <div className="card overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-line">
                <th className="px-3 py-2.5 text-left font-semibold text-muted" />
                {cols.map((c) => (
                  <th key={c.key} className={clsx('px-3 py-2.5 text-right font-bold', c.tone)}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, fn]) => (
                <tr key={label} className="border-b border-line last:border-0">
                  <td className="px-3 py-2 text-muted">{label}</td>
                  {cols.map((c) => (
                    <td key={c.key} className={clsx('num px-3 py-2 text-right text-[15px]', c.key === 'rec' && 'bg-go-soft/50')}>
                      {fn(c.sc)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {flags.length > 0 && (
        <Section title={t('Scheme rules that matter here', 'यहाँ लागू होने वाले नियम')}>
          <div className="space-y-2">
            {flags.map((f) => (
              <div key={f.code} className={clsx('rounded-lg border-l-4 px-3 py-2 text-[14px]', f.severity === 'block' ? 'border-risk bg-risk-soft' : f.severity === 'warn' ? 'border-caution bg-caution-soft' : 'border-indigo bg-indigo-soft')}>
                <b className="mr-1 text-[12px]">{f.code}</b> {t(f.en, f.hi)}
              </div>
            ))}
            {plan.naive.route.alternatives.map((a) => (
              <div key={a.rule.id} className="rounded-lg border border-line bg-white px-3 py-2 text-[14px]">
                {t('Side by side', 'साथ-साथ')}: <b>{a.rule.product}</b> — {t('project', 'प्रोजेक्ट')} {inr(a.projectCost)}, {t('loan', 'लोन')} {inr(a.loan)} @ {(a.rule.ratePa * 100).toFixed(1)}%, {a.rule.tenureQ / 4} {t('yrs', 'साल')}
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title={t('Your loan', 'आपका लोन')} aside={<span className="text-[12px] text-muted">{rule.id}</span>}>
        <div className="card p-4">
          <div className="grid grid-cols-2 gap-y-3 text-[14px]">
            <div>
              <div className="text-muted">{t('Scheme', 'योजना')}</div>
              <b>
                {rule.corporation} {t(rule.product, rule.productHi)}
              </b>
            </div>
            <div>
              <div className="text-muted">{t('Interest', 'ब्याज')}</div>
              <b>{(rule.ratePa * 100).toFixed(1)}% {t('a year', 'सालाना')}</b>
            </div>
            <div>
              <div className="text-muted">{t('Repay over', 'चुकाने की अवधि')}</div>
              <b>
                {s.totalQ / 4} {t('years, quarterly', 'साल, तिमाही')}
              </b>
            </div>
            <div>
              <div className="text-muted">{t('Interest-only period', 'सिर्फ़ ब्याज की अवधि')}</div>
              <b>
                {s.moratoriumQ * 3} {t('months', 'महीने')}
              </b>
            </div>
          </div>
          {rule.confidence === 'verify' && <p className="mt-3 rounded bg-caution-soft px-2 py-1.5 text-[12.5px] text-caution">{t('Sources disagree on this product’s terms — SCA to confirm.', 'इस योजना की शर्तों पर स्रोत अलग हैं — SCA से पुष्टि करें।')}</p>}
          <div className="mt-4 border-t border-line pt-3">
            <div className="mb-2 text-[13px] font-semibold text-muted">{t('Interest during the first months', 'शुरुआती महीनों का ब्याज')}</div>
            <div className="grid grid-cols-2 gap-2">
              {(['serviced', 'capitalised'] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)} className={clsx('rounded-lg border-2 px-3 py-2 text-left text-[13.5px]', plan.input.mode === m ? 'border-indigo bg-indigo-soft' : 'border-line')}>
                  <b className="block">{m === 'serviced' ? t('Pay it as you go', 'साथ-साथ भरें') : t('Add it to the loan', 'लोन में जोड़ें')}</b>
                  <span className="text-muted">{m === 'serviced' ? t(`${inr(s.principal * (rule.ratePa / 4))} per quarter`, `${inr(s.principal * (rule.ratePa / 4))} प्रति तिमाही`) : t('Higher instalment later', 'बाद में किस्त ज़्यादा')}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-[12px] text-muted">{t('The PS leaves this open. Shown both ways until the SCA confirms.', 'PS में यह तय नहीं। SCA की पुष्टि तक दोनों तरह दिखाया।')}</p>
          </div>
        </div>
      </Section>

      <Section title={t('Cash in hand, month by month', 'हाथ में पैसा, महीने दर महीने')}>
        <div className="card p-3">
          <CashRunway p={r.projection} />
          <p className="px-1 pt-1 text-[13.5px]">
            {r.projection.moneylenderMonth ? (
              <span className="font-semibold text-risk">{t(`Cash goes below zero in month ${r.projection.moneylenderMonth}. Without a buffer, this is when people go to a moneylender.`, `महीने ${r.projection.moneylenderMonth} में पैसा शून्य से नीचे। बचत के बिना लोग इसी समय साहूकार के पास जाते हैं।`)}</span>
            ) : (
              <span className="font-semibold text-go">{t(`Working capital of ${inr(r.unit.size.workingCapital)} keeps cash above zero through lean months.`, `${inr(r.unit.size.workingCapital)} की कार्यशील पूंजी कमज़ोर महीनों में भी पैसा बचाए रखती है।`)}</span>
            )}
          </p>
        </div>
      </Section>

      <Section title={t('Can the unit pay the bank each year?', 'क्या हर साल बैंक की किस्त निकलेगी?')}>
        <div className="card p-3">
          <DscrBars p={r.projection} loanYears={loanYears} />
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

      <Collapse open={showPL} toggle={() => setShowPL((x) => !x)} title={t('5-year profit & loss', '5 साल का लाभ-हानि')}>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-right text-muted">
                <th className="px-2 py-1.5 text-left" />
                {r.projection.years.slice(0, 5).map((y) => (
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
                  {r.projection!.years.slice(0, 5).map((y) => (
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
          NPV @12%: {inr(r.projection.npv)} · IRR: {r.projection.irr != null ? pct(r.projection.irr, 1) : '—'} · {t('payback', 'वापसी')}: {r.projection.paybackMonth ? t(`month ${r.projection.paybackMonth}`, `महीना ${r.projection.paybackMonth}`) : t('after 24 months', '24 महीने बाद')}
        </p>
      </Collapse>
    </div>
  )
}

function Slider({ label, v, set, min, max }: { label: string; v: number; set: (n: number) => void; min: number; max: number }) {
  return (
    <label className="block">
      <span className="flex justify-between text-[14px]">
        <span>{label}</span>
        <b className={clsx('num', v < 0 ? 'text-risk' : v > 0 ? 'text-go' : '')}>
          {v > 0 ? '+' : ''}
          {v}%
        </b>
      </span>
      <input type="range" min={min} max={max} value={v} onChange={(e) => set(+e.target.value)} className="mt-1 w-full accent-indigo" />
    </label>
  )
}

function Collapse({ open, toggle, title, children }: { open: boolean; toggle: () => void; title: string; children: ReactNode }) {
  return (
    <div className="card mb-3">
      <button onClick={toggle} className="flex w-full items-center justify-between px-4 py-3 text-left text-[15px] font-bold" aria-expanded={open}>
        {title}
        <ChevronDown className={clsx('size-5 transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="border-t border-line px-3 py-3">{children}</div>}
    </div>
  )
}

/* ---------------- Risks & SWOT ---------------- */
export function RisksTab({ plan }: { plan: Plan }) {
  const t = useT()
  const q: { k: 'S' | 'W' | 'O' | 'T'; en: string; hi: string; cls: string }[] = [
    { k: 'S', en: 'Strengths', hi: 'ताक़त', cls: 'border-go/40 bg-go-soft/50' },
    { k: 'W', en: 'Weaknesses', hi: 'कमज़ोरी', cls: 'border-caution/40 bg-caution-soft/50' },
    { k: 'O', en: 'Opportunities', hi: 'मौक़े', cls: 'border-indigo/30 bg-indigo-soft/60' },
    { k: 'T', en: 'Threats', hi: 'ख़तरे', cls: 'border-risk/30 bg-risk-soft/50' },
  ]
  const fit = plan.fit
  return (
    <div>
      <Section title={t('Founder-Fit', 'फ़ाउंडर-फ़िट')} aside={<span className={clsx('num text-[28px] font-extrabold', fit.score >= 65 ? 'text-go' : fit.score >= 50 ? 'text-caution' : 'text-risk')}>{fit.score}<span className="text-[15px] text-muted">/100</span></span>}>
        <div className="card space-y-3 p-4">
          {fit.parts.map((p) => (
            <div key={p.key}>
              <div className="flex justify-between text-[14px]">
                <span>{t(p.en, p.hi)}</span>
                <span className="num text-muted">
                  {Math.round(p.got)}/{p.max}
                </span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-khadi">
                <div className={clsx('h-2 rounded-full', p.got / p.max >= 0.7 ? 'bg-go' : p.got / p.max >= 0.4 ? 'bg-caution' : 'bg-risk')} style={{ width: `${(p.got / p.max) * 100}%` }} />
              </div>
            </div>
          ))}
          <p className="border-t border-line pt-3 text-[12.5px] text-muted">{t('Weights follow MoSJE’s evaluation: lack of skill or interest was the #1 reason units struggled (61.5%).', 'वज़न MoSJE मूल्यांकन के अनुसार: हुनर या रुचि की कमी सबसे बड़ा कारण थी (61.5%)।')}</p>
        </div>
        {fit.score < 50 && (
          <div className="mt-3 flex items-start gap-3 rounded-xl border-2 border-indigo/20 bg-indigo-soft/60 p-4">
            <GraduationCap className="mt-0.5 size-6 shrink-0 text-indigo" />
            <div className="text-[14.5px]">
              <b>{t('Train first, then borrow', 'पहले प्रशिक्षण, फिर लोन')}</b>
              <p>{t(plan.feasibility.activity.training.en, plan.feasibility.activity.training.hi)}</p>
              <p className="mt-1 text-muted">{t('Free under PM-DAKSH / RSETI for SC, OBC and Safai Karamchari families.', 'SC, OBC और सफ़ाई कर्मचारी परिवारों के लिए PM-DAKSH / RSETI में मुफ़्त।')}</p>
            </div>
          </div>
        )}
      </Section>

      <Section title="SWOT">
        <div className="grid grid-cols-2 gap-2.5">
          {q.map((x) => (
            <div key={x.k} className={clsx('rounded-xl border p-3', x.cls)}>
              <div className="font-display text-[17px] font-bold">{t(x.en, x.hi)}</div>
              <ul className="mt-1.5 space-y-1.5 text-[13.5px]">
                {plan.swot[x.k].slice(0, 4).map((item, i) => (
                  <li key={i}>
                    {t(item.en, item.hi)}
                    {item.fact && <span className="ml-1 rounded bg-white/80 px-1 text-[10.5px] font-bold text-muted">{item.fact}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[12.5px] text-muted">{t('Every point comes from an engine fact; tags point to the evidence in the Market tab.', 'हर बात इंजन के तथ्य से; टैग बाज़ार टैब के सबूत की ओर।')}</p>
      </Section>

      <Section title={t('Threats and how to handle them', 'ख़तरे और उनसे बचाव')}>
        <ul className="space-y-2">
          {plan.feasibility.threats.map((x) => (
            <li key={x.id} className="card flex items-start gap-3 p-3 text-[14.5px]">
              <span className={clsx('mt-1 size-2.5 shrink-0 rounded-full', x.level === 'high' ? 'bg-risk' : x.level === 'medium' ? 'bg-caution' : 'bg-go')} />
              <span>
                {t(x.en, x.hi)}
                <span className="ml-1 text-[12px] font-semibold text-muted">({t(x.level, x.level === 'high' ? 'ज़्यादा' : x.level === 'medium' ? 'मध्यम' : 'कम')})</span>
              </span>
            </li>
          ))}
          {plan.feasibility.activity.risks.map((x, i) => (
            <li key={i} className="card flex items-start gap-3 p-3 text-[14.5px]">
              <span className="mt-1 size-2.5 shrink-0 rounded-full bg-caution" />
              {t(x.en, x.hi)}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  )
}

/* ---------------- Alternatives ---------------- */
export function AltTab({ c }: { c: SavedCase }) {
  const t = useT()
  const nav = useNavigate()
  const addCase = useApp((s) => s.addCase)
  const plan = useMemo(() => planFor(c, true), [c])
  const verdictOf = (sc: Scenario): Verdict => (sc.passes ? 'go' : (sc.projection?.minDscr ?? 0) < 1.2 ? 'rethink' : 'caution')
  return (
    <div>
      <p className="mb-4 text-[15px] text-muted">{t(`Other businesses that fit ${plan.feasibility.village.name} and ${inr(c.input.margin)}, ranked by market gap × your fit × repayment safety.`, `${plan.feasibility.village.nameHi} और ${inr(c.input.margin)} के हिसाब से दूसरे काम — बाज़ार की कमी × आपका फ़िट × किस्त की सुरक्षा से क्रम।`)}</p>
      <div className="space-y-3">
        {plan.alternatives.map((a, i) => {
          const sc = a.scenario
          return (
            <div key={a.activity.code} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-[34px]" aria-hidden>{a.activity.emoji}</span>
                  <div>
                    <div className="text-[12px] font-semibold text-muted">#{i + 1}</div>
                    <div className="font-display text-[19px] font-bold leading-tight">{t(a.activity.name.en, a.activity.name.hi)}</div>
                    <div className="text-[13px] text-muted">{t(a.size.label.en, a.size.label.hi)}</div>
                  </div>
                </div>
                <VerdictPill v={verdictOf(sc)} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[12px]">
                <div className="rounded-lg bg-khadi p-2">
                  <div className="num text-[17px] font-bold">{sc.loan > 0 ? lakh(sc.loan) : t('None', 'नहीं')}</div>
                  {t('loan', 'लोन')}
                </div>
                <div className="rounded-lg bg-khadi p-2">
                  <div className="num text-[17px] font-bold">{sc.schedule && sc.loan > 0 ? inr(sc.schedule.instalment) : '—'}</div>
                  {t('per quarter', 'प्रति तिमाही')}
                </div>
                <div className="rounded-lg bg-khadi p-2">
                  <div className="num text-[17px] font-bold">{dscr(sc.projection?.minDscr)}</div>
                  DSCR
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[12.5px] font-semibold text-muted">{t('Market', 'बाज़ार')}: {{ crowded: t('crowded', 'भीड़'), normal: t('normal', 'सामान्य'), gap: t('gap', 'कमी') }[a.saturation]}</span>
                <button
                  onClick={() => {
                    const id = 'GUS-' + Math.floor(Math.random() * 90000 + 10000)
                    addCase({ id, input: { ...c.input, activity: a.activity.code, sizeId: a.size.id }, createdAt: new Date().toISOString(), status: 'draft', channel: 'self', remarks: [] })
                    nav(`/plan/${id}`)
                  }}
                  className="inline-flex items-center gap-1 text-[14px] font-bold text-indigo"
                >
                  {t('Plan this instead', 'यह योजना बनाएँ')} <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------- Next steps ---------------- */
function docsFor(plan: Plan) {
  const cat = plan.input.category
  const base = [
    { en: cat === 'SAFAI' ? 'Safai Karamchari / dependant certificate' : `Caste certificate (${cat})`, hi: cat === 'SAFAI' ? 'सफ़ाई कर्मचारी / आश्रित प्रमाण पत्र' : `जाति प्रमाण पत्र (${cat})`, dl: true },
    { en: 'Family income certificate (under ₹3 lakh)', hi: 'आय प्रमाण पत्र (₹3 लाख से कम)', dl: true },
    { en: 'Aadhaar and residence proof', hi: 'आधार और निवास प्रमाण', dl: true },
    { en: 'Bank passbook (account in your name)', hi: 'बैंक पासबुक (आपके नाम का खाता)', dl: false },
    { en: 'Two passport photos', hi: 'दो पासपोर्ट फ़ोटो', dl: false },
    { en: 'Project report (DPR) — made by Saathi', hi: 'प्रोजेक्ट रिपोर्ट (DPR) — साथी ने बनाई', dl: false, done: true },
  ]
  const a = plan.feasibility.activity.code
  const q =
    a === 'dairy' ? { en: 'Cattle quotation + vet health certificate + insurance quote', hi: 'पशु कोटेशन + पशु चिकित्सक प्रमाण + बीमा कोटेशन' }
    : a === 'goat' ? { en: 'Goat purchase quotation + vet certificate', hi: 'बकरी ख़रीद कोटेशन + पशु चिकित्सक प्रमाण' }
    : a === 'tea' ? { en: 'Equipment quotation + FSSAI basic registration', hi: 'उपकरण कोटेशन + FSSAI पंजीकरण' }
    : { en: 'Quotations for machines / stock from a registered seller', hi: 'पंजीकृत विक्रेता से मशीन / माल के कोटेशन' }
  return [...base.slice(0, 3), { ...q, dl: false }, ...base.slice(3)]
}

export function NextTab({ plan }: { plan: Plan }) {
  const t = useT()
  const docs = docsFor(plan)
  const [ticks, setTicks] = useState<boolean[]>(docs.map((d) => !!(d as { done?: boolean }).done))
  const r = plan.recommended
  const share = encodeURIComponent(
    t(
      `My GramUdyam Saathi plan ${plan.id}: ${plan.feasibility.activity.name.en}, ${r.unit.size.label.en}. Loan ${inr(r.loan)}, ${inr(r.schedule?.instalment ?? 0)} every 3 months.`,
      `मेरी ग्रामउद्यम साथी योजना ${plan.id}: ${plan.feasibility.activity.name.hi}, ${r.unit.size.label.hi}। लोन ${inr(r.loan)}, हर 3 महीने ${inr(r.schedule?.instalment ?? 0)}।`,
    ),
  )
  return (
    <div>
      <div className="grid gap-2.5">
        <Link to={`/dpr/${plan.id}`} className="flex items-center gap-3 rounded-xl bg-indigo px-4 py-4 text-white">
          <Download className="size-6 text-marigold" />
          <span className="flex-1">
            <b className="block text-[17px]">{t('Download project report (DPR)', 'प्रोजेक्ट रिपोर्ट (DPR) डाउनलोड करें')}</b>
            <span className="text-[13px] text-white/75">{t('Hindi + English, bank format, with schedule', 'हिंदी + अंग्रेज़ी, बैंक फ़ॉर्मेट, किस्त तालिका सहित')}</span>
          </span>
        </Link>
        <a href="https://pmsuraj.dosje.gov.in" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border-2 border-indigo/25 bg-white px-4 py-4">
          <ExternalLink className="size-6 text-indigo" />
          <span className="flex-1">
            <b className="block text-[17px]">{t('Apply on PM-SURAJ', 'PM-SURAJ पर आवेदन करें')}</b>
            <span className="text-[13px] text-muted">{t('Your plan ID fills the summary; attach the DPR', 'योजना ID से सारांश भरें; DPR लगाएँ')}</span>
          </span>
        </a>
        <a href={`https://wa.me/?text=${share}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border-2 border-go/25 bg-white px-4 py-4">
          <MessageCircle className="size-6 text-go" />
          <span className="flex-1">
            <b className="block text-[17px]">{t('Share on WhatsApp', 'WhatsApp पर भेजें')}</b>
            <span className="text-[13px] text-muted">{t('Send the summary to family or your VLE', 'परिवार या VLE को सारांश भेजें')}</span>
          </span>
        </a>
      </div>

      <Section title={t('Documents to carry', 'साथ ले जाने वाले काग़ज़')} aside={<span className="num text-[14px] font-bold text-muted">{ticks.filter(Boolean).length}/{docs.length}</span>}>
        <ul className="card divide-y divide-line">
          {docs.map((d, i) => (
            <li key={i}>
              <button onClick={() => setTicks((x) => x.map((v, j) => (j === i ? !v : v)))} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                <span className={clsx('grid size-6 shrink-0 place-items-center rounded-md border-2', ticks[i] ? 'border-go bg-go text-white' : 'border-line')}>{ticks[i] && <Check className="size-4" strokeWidth={3} />}</span>
                <span className={clsx('flex-1 text-[15px]', ticks[i] && 'text-muted line-through')}>{t(d.en, d.hi)}</span>
                {d.dl && <span className="rounded bg-indigo-soft px-1.5 py-0.5 text-[10.5px] font-bold text-indigo">DigiLocker</span>}
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[12.5px] text-muted">{t('DigiLocker pull replaces photocopies in Phase 2.', 'चरण 2 में DigiLocker से सीधे मिलेंगे, फ़ोटोकॉपी नहीं।')}</p>
      </Section>

      <Section title={t('Your SCA office', 'आपका SCA कार्यालय')}>
        <div className="card p-4 text-[14.5px]">
          <b>{t(DISTRICT.sca.name, DISTRICT.sca.nameHi)}</b>
          <p className="text-muted">{DISTRICT.sca.address}</p>
          <p className="mt-2 inline-flex items-center gap-2 font-semibold text-indigo">
            <Phone className="size-4" /> {DISTRICT.sca.phone}
          </p>
          <p className="mt-3 flex items-center gap-2 rounded-lg bg-go-soft px-3 py-2 text-go">
            <Send className="size-4" />
            {t(`Plan ${plan.id} is already in the SCA officer’s queue.`, `योजना ${plan.id} SCA अधिकारी की कतार में पहुँच गई है।`)}
          </p>
        </div>
      </Section>

      <Section title={t('After the loan', 'लोन के बाद')}>
        <ul className="space-y-2 text-[14.5px]">
          <li className="flex gap-2"><Check className="mt-0.5 size-4 text-go" />{t('Reminder 7 days before each quarterly instalment (SMS / WhatsApp).', 'हर तिमाही किस्त से 7 दिन पहले याद दिलाना (SMS / WhatsApp)।')}</li>
          <li className="flex gap-2"><Check className="mt-0.5 size-4 text-go" />{t('Lean-month nudge: “set aside money now”.', 'कमज़ोर महीनों से पहले: “अभी पैसा बचाएँ”।')}</li>
          <li className="flex gap-2"><Check className="mt-0.5 size-4 text-go" />{t('Register on Udyam after sanction.', 'मंज़ूरी के बाद उद्यम पोर्टल पर पंजीकरण।')}</li>
        </ul>
      </Section>
    </div>
  )
}
