import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import { Section } from './Section'
import { project } from '../../engine/business'
import type { Plan, Scenario } from '../../engine/plan'
import { dscr, inr, lakh, pct } from '../../lib/format'
import { type SavedCase, useApp, useT } from '../../lib/store'

/** Side-by-side loan options, scheme flags and the chosen loan's terms. Assumes an eligible plan. */
export function LoanKeyPoints({ plan, caseId }: { plan: Plan; caseId: string }) {
  const t = useT()
  const { cases, addCase } = useApp()
  const r = plan.recommended
  const s = r.schedule!
  const rule = r.route.rule!
  const setMode = (mode: 'serviced' | 'capitalised') => {
    const existing = cases.find((x) => x.id === caseId)
    const base = existing ?? ({ id: caseId, input: plan.input, createdAt: plan.createdAt, status: 'draft', channel: 'self', remarks: [] } as SavedCase)
    addCase({ ...base, input: { ...base.input, mode } })
  }
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
    [t('Every 3 months', 'हर 3 महीने'), (x) => (x.schedule ? inr(x.schedule.instalment) : '-')],
    [t('Worst-year DSCR', 'सबसे ख़राब साल DSCR'), (x) => (x.projection ? dscr(x.projection.minDscr) : '-')],
    [t('Chance of trouble', 'दिक़्क़त की संभावना'), (x) => (x.mc ? pct(x.mc.pDefault) : '-')],
    [t('Cash runs out', 'पैसा ख़त्म'), (x) => (x.projection?.moneylenderMonth ? t(`month ${x.projection.moneylenderMonth}`, `महीना ${x.projection.moneylenderMonth}`) : t('never', 'कभी नहीं'))],
  ]
  return (
      <div className="gap-5 lg:grid lg:grid-cols-3">
        <div className="lg:col-span-2">
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
                  <td className="px-3 py-1.5 text-muted">{label}</td>
                  {cols.map((c) => (
                    <td key={c.key} className={clsx('num px-3 py-1.5 text-right text-[15px]', c.key === 'rec' && 'bg-go-soft/50')}>
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
          <div className="grid gap-2 lg:grid-cols-2">
            {flags.map((f) => (
              <div key={f.code} className={clsx('rounded-lg border-l-4 px-3 py-1.5 text-[13px] leading-snug', f.severity === 'block' ? 'border-risk bg-risk-soft' : f.severity === 'warn' ? 'border-caution bg-caution-soft' : 'border-indigo bg-indigo-soft')}>
                <b className="mr-1 text-[12px]">{f.code}</b> {t(f.en, f.hi)}
              </div>
            ))}
            {plan.naive.route.alternatives.map((a) => (
              <div key={a.rule.id} className="rounded-lg border border-line bg-white px-3 py-1.5 text-[13px] leading-snug">
                {t('Side by side', 'साथ-साथ')}: <b>{a.rule.product}</b>, {t('project', 'प्रोजेक्ट')} {inr(a.projectCost)}, {t('loan', 'लोन')} {inr(a.loan)} @ {(a.rule.ratePa * 100).toFixed(1)}%, {a.rule.tenureQ / 4} {t('yrs', 'साल')}
              </div>
            ))}
          </div>
        </Section>
      )}

        </div>
        <div>
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
          {rule.confidence === 'verify' && <p className="mt-3 rounded bg-caution-soft px-2 py-1.5 text-[12.5px] text-caution">{t('Sources disagree on this product’s terms, SCA to confirm.', 'इस योजना की शर्तों पर स्रोत अलग हैं, SCA से पुष्टि करें।')}</p>}
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

        </div>
      </div>
  )
}
