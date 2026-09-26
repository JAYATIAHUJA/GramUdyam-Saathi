import { ArrowRight } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActivityArt } from '../art'
import { VerdictPill } from '../ui'
import type { Plan, Scenario, Verdict } from '../../engine/plan'
import { dscr, inr, lakh } from '../../lib/format'
import { planFor } from '../../lib/plans'
import { type SavedCase, useApp, useT } from '../../lib/store'

/* ---------------- Alternatives ---------------- */
export function AltTab({ c }: { c: SavedCase }) {
  const t = useT()
  const nav = useNavigate()
  const addCase = useApp((s) => s.addCase)
  const plan = useMemo(() => planFor(c, true), [c])
  const verdictOf = (sc: Scenario): Verdict => (sc.passes ? 'go' : (sc.projection?.minDscr ?? 0) < 1.2 ? 'rethink' : 'caution')
  return (
    <div>
      <p className="mb-4 text-[15px] text-muted">{t(`Other businesses that fit ${plan.feasibility.village.name} and ${inr(c.input.margin)}, ranked by market gap × your fit × repayment safety.`, `${plan.feasibility.village.nameHi} और ${inr(c.input.margin)} के हिसाब से दूसरे काम, बाज़ार की कमी × आपका फ़िट × किस्त की सुरक्षा से क्रम।`)}</p>
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {plan.alternatives.map((a, i) => {
          const sc = a.scenario
          return (
            <div key={a.activity.code} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ActivityArt code={a.activity.code} className="size-14" />
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
                  <div className="num text-[17px] font-bold">{sc.schedule && sc.loan > 0 ? inr(sc.schedule.instalment) : '-'}</div>
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
