import { ArrowRight } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActivityArt } from '../art'
import { VERDICT } from '../ui'
import type { Scenario, Verdict } from '../../engine/plan'
import { dscr, inr, lakh } from '../../lib/format'
import { planFor } from '../../lib/plans'
import { type SavedCase, useApp, useT } from '../../lib/store'

// Only an unusual market is worth a tag; a normal one says nothing new.
const MARKET = {
  gap: { en: 'Market gap', hi: 'बाज़ार में कमी', cls: 'text-go' },
  crowded: { en: 'Crowded', hi: 'भीड़', cls: 'text-risk' },
} as const

const safeColor = (x: number) => (x >= 1.5 ? 'var(--color-go)' : x >= 1.2 ? 'var(--color-caution)' : 'var(--color-risk)')

/* ---------------- Alternatives ---------------- */
export function AltTab({ c }: { c: SavedCase }) {
  const t = useT()
  const nav = useNavigate()
  const addCase = useApp((s) => s.addCase)
  const plan = useMemo(() => planFor(c, true), [c])
  const verdictOf = (sc: Scenario): Verdict => (sc.passes ? 'go' : (sc.projection?.minDscr ?? 0) < 1.2 ? 'rethink' : 'caution')
  const pick = (code: string, sizeId: string) => {
    const id = 'GUS-' + Math.floor(Math.random() * 90000 + 10000)
    addCase({ id, input: { ...c.input, activity: code, sizeId }, createdAt: new Date().toISOString(), status: 'draft', channel: 'self', remarks: [] })
    nav(`/plan/${id}`)
  }
  return (
    <div>
      <p className="mb-3 max-w-[70ch] text-[14px] text-muted">{t(`Other businesses that fit ${plan.feasibility.village.name} and ${inr(c.input.margin)}, best first.`, `${plan.feasibility.village.nameHi} और ${inr(c.input.margin)} के हिसाब से दूसरे काम, सबसे सही पहले।`)}</p>

      <ol className="divide-y divide-line">
        {plan.alternatives.map((a, i) => {
          const sc = a.scenario
          const v = VERDICT[verdictOf(sc)]
          const VIcon = v.icon
          const safety = sc.projection?.minDscr ?? 0
          const market = a.saturation === 'normal' ? null : MARKET[a.saturation]
          return (
            <li key={a.activity.code}>
              <button type="button" onClick={() => pick(a.activity.code, a.size.id)} className="group flex w-full items-center gap-3 py-3 text-left">
                <span className="num w-4 shrink-0 text-[13px] font-bold text-muted">{i + 1}</span>
                <ActivityArt code={a.activity.code} className="size-10 shrink-0 rounded-xl" />

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[15px] font-bold text-ink group-hover:text-indigo">{t(a.activity.name.en, a.activity.name.hi).split(' (')[0]}</span>
                    <VIcon className="size-4 shrink-0" style={{ color: v.color }} aria-label={t(v.en, v.hi)} />
                  </span>
                  <span className="block truncate text-[12.5px] text-muted">
                    {t(a.size.label.en, a.size.label.hi)}
                    {market && <span className={`font-semibold ${market.cls}`}> · {t(market.en, market.hi)}</span>}
                  </span>
                </span>

                <span className="shrink-0 text-right">
                  <span className="num block text-[15px] leading-tight font-bold text-indigo-deep">{sc.loan > 0 ? lakh(sc.loan) : t('No loan', 'लोन नहीं')}</span>
                  <span className="num block text-[12px] text-muted">{sc.schedule && sc.loan > 0 ? t(`${inr(sc.schedule.instalment)} / qtr`, `${inr(sc.schedule.instalment)} / तिमाही`) : ''}</span>
                </span>

                <span className="hidden w-20 shrink-0 sm:block" title={t('Earnings ÷ instalment. 1.5× is safe.', 'कमाई ÷ किस्त। 1.5× सुरक्षित है।')}>
                  <span className="num block text-right text-[12px] font-bold" style={{ color: safeColor(safety) }}>
                    {dscr(safety)}×
                  </span>
                  <span className="mt-1 block h-1 overflow-hidden rounded-full bg-khadi">
                    <span className="block h-full rounded-full" style={{ width: `${Math.min(100, (safety / 3) * 100)}%`, background: safeColor(safety) }} />
                  </span>
                </span>

                <ArrowRight className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-indigo" aria-hidden />
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
