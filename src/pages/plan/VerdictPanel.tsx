import { clsx } from 'clsx'
import { CalendarClock, Landmark, ShieldCheck, TriangleAlert } from 'lucide-react'
import { ActivityArt, Bubble, Didi } from '../../components/art'
import { VerdictStamp } from '../../components/ui'
import type { Plan } from '../../engine/plan'
import { dscr, inr, lakh, pct } from '../../lib/format'
import { useT } from '../../lib/store'
import { DIDI_SAYS } from './didiSays'

export function VerdictPanel({ plan }: { plan: Plan }) {
  const t = useT()
  const r = plan.recommended
  const a = plan.feasibility.activity
  const s = r.schedule
  const smaller = r !== plan.chosen && r.passes
  const naiveDiffers = plan.naive.loan !== r.loan
  const says = DIDI_SAYS[plan.verdict]
  return (
    <aside className="flex flex-col gap-2 lg:min-h-0 lg:overflow-y-auto">
      <div className="flex shrink-0 items-end gap-2">
        <Didi mood={says.mood} className="-mb-1 w-[60px] shrink-0" />
        <Bubble className="flex-1 !py-2">
          <p className="text-[14.5px] leading-snug font-semibold text-indigo-deep">{t(says.en, says.hi)}</p>
        </Bubble>
      </div>

      <div className="card relative flex-1 p-3.5 shadow-[0_16px_40px_-28px_rgba(28,37,102,0.45)]">
        <div className="flex items-center gap-2.5 pr-28">
          <ActivityArt code={a.code} className="size-11" />
          <div className="min-w-0 leading-tight">
            <div className="font-display text-[20px] font-bold">{t(r.unit.size.label.en, r.unit.size.label.hi)}</div>
            <div className="truncate text-[13px] text-muted">{t(a.name.en, a.name.hi)}</div>
          </div>
        </div>
        <div className="absolute top-2 right-1 origin-top-right scale-[0.66]">
          <VerdictStamp v={plan.verdict} />
        </div>

        {r.route.eligible && s ? (
          <>
            <div className="mt-4">
              <div className="text-[12.5px] font-semibold text-muted">{t('Borrow', 'लोन लीजिए')}</div>
              <div className="num text-[38px] leading-none font-extrabold text-indigo-deep">{r.loan > 0 ? inr(r.loan) : t('No loan needed', 'लोन की ज़रूरत नहीं')}</div>
              {r.loan === 0 && <div className="mt-1 text-[13px] text-muted">{t('Your savings cover this unit. Keep the rest as a buffer.', 'आपकी बचत से यह इकाई शुरू हो जाएगी। बाकी पैसा बचाकर रखें।')}</div>}
              {naiveDiffers && (
                <div className="mt-1.5 text-[13px]">
                  <span className="text-muted">{t('The 10% formula would give', '10% फ़ॉर्मूला देता')} </span>
                  <span className="num font-bold text-risk line-through decoration-2">{inr(plan.naive.loan)}</span>
                  <span className="text-muted">, {t(`${pct(plan.naive.mc?.pDefault ?? 0)} chance of trouble`, `${pct(plan.naive.mc?.pDefault ?? 0)} दिक़्क़त की संभावना`)}</span>
                </div>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-indigo-soft/70 p-2.5">
                <div className="text-[12px] font-semibold text-indigo">{t('Every 3 months', 'हर 3 महीने')}</div>
                <div className="num text-[22px] leading-tight font-bold">{inr(s.instalment)}</div>
                <div className="text-[12px] text-muted">{t(`Save ${inr(s.instalment / 3)} a month`, `हर महीने ${inr(s.instalment / 3)} बचाएँ`)}</div>
              </div>
              <div className="rounded-xl bg-marigold-soft p-2.5">
                <div className="text-[12px] font-semibold text-[#7a5500]">{t('That is, a day', 'यानी रोज़')}</div>
                <div className="num text-[22px] leading-tight font-bold">~{inr(plan.perDay)}</div>
                <div className="text-[12px] text-[#7a5500]">
                  ≈ {Math.max(1, Math.round(plan.localUnits))} {t(a.localUnit.en, a.localUnit.hi)}
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-1 text-[13px]">
              <div className="flex items-center gap-1.5">
                <Landmark className="size-4 shrink-0 text-indigo" />
                {r.route.rule!.corporation} {t(r.route.rule!.product, r.route.rule!.productHi)}, {(r.route.rule!.ratePa * 100).toFixed(1)}%
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarClock className="size-4 shrink-0 text-indigo" />
                {t(`First ${r.route.moratoriumQ * 3} months: interest only`, `पहले ${r.route.moratoriumQ * 3} महीने: सिर्फ़ ब्याज`)}
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 shrink-0 text-go" />
                DSCR {dscr(r.projection!.minDscr)}, {t('risk', 'जोखिम')} {pct(r.mc?.pDefault ?? 0)}
              </div>
            </div>
          </>
        ) : (
          <div className="mt-4 rounded-xl bg-risk-soft p-3 text-[14px]">
            <b className="text-risk">{t('Not eligible for this corporation.', 'इस निगम के लिए पात्र नहीं।')}</b>
            <p className="mt-1">{t(r.route.flags[0]?.en ?? '', r.route.flags[0]?.hi ?? '')}</p>
            <p className="mt-2 font-semibold">{r.route.otherSchemes.map((o) => t(o.name, o.nameHi)).join(' / ')}</p>
          </div>
        )}

        {smaller && (
          <p className="mt-3 rounded-lg border-l-4 border-go bg-go-soft/60 px-3 py-2 text-[13px] font-semibold">
            {t(`You asked for ${plan.chosen.unit.size.label.en} (${lakh(plan.chosen.loan)} loan). Start with ${r.unit.size.label.en}, safe even in a bad year.`, `आपने ${plan.chosen.unit.size.label.hi} (${lakh(plan.chosen.loan)} लोन) चाहा। ${r.unit.size.label.hi} से शुरू करें, ख़राब साल में भी सुरक्षित।`)}
          </p>
        )}

        <div className="mt-2.5 border-t border-line pt-2.5">
          <div className="mb-1 text-[12.5px] font-bold text-muted">{t('Top 3 risks', 'मुख्य 3 जोखिम')}</div>
          <ul className="space-y-1.5">
            {plan.topRisks.map((x, i) => (
              <li key={i} className="flex gap-2 text-[13.5px] leading-snug">
                <TriangleAlert className={clsx('mt-0.5 size-4 shrink-0', x.level === 'high' ? 'text-risk' : x.level === 'medium' ? 'text-caution' : 'text-muted')} />
                {t(x.en, x.hi)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  )
}
