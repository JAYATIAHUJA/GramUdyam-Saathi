import { clsx } from 'clsx'
import { CalendarClock, Landmark, ShieldCheck, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { ActivityArt, Bubble, Didi } from '../../components/art'
import { VERDICT } from '../../components/ui'
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
  const v = VERDICT[plan.verdict]
  const VIcon = v.icon
  return (
    <aside className="flex flex-col gap-2 lg:min-h-0 lg:overflow-y-auto">
      <div className="flex shrink-0 items-end gap-2">
        <Didi mood={says.mood} className="-mb-1 w-[60px] shrink-0" />
        <Bubble className="flex-1 !py-2">
          <p className="text-[14.5px] leading-snug font-semibold text-indigo-deep">{t(says.en, says.hi)}</p>
        </Bubble>
      </div>

      <div className="card relative flex-1 overflow-hidden shadow-[0_16px_40px_-28px_rgba(28,37,102,0.45)]">
        {/* 1. The verdict, as a full-width band so it never sits on top of the title */}
        <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: v.color + '14', borderBottom: `1px solid ${v.color}33` }}>
          <VIcon className="size-5 shrink-0" style={{ color: v.color }} aria-hidden />
          <div className="min-w-0 leading-tight">
            <div className="font-display text-[16px] font-bold" style={{ color: v.color }}>{t(v.en, v.hi)}</div>
            <div className="truncate text-[12px] text-ink/65">{t(v.enSub, v.hiSub)}</div>
          </div>
        </div>

        <div className="p-4">
          {/* 2. What they are starting */}
          <div className="flex items-center gap-3">
            <ActivityArt code={a.code} className="size-11 rounded-xl" />
            <div className="min-w-0 leading-tight">
              <div className="font-display text-[18px] font-bold">{t(r.unit.size.label.en, r.unit.size.label.hi)}</div>
              <div className="text-[13px] text-muted">{t(a.name.en, a.name.hi)}</div>
            </div>
          </div>

          {r.route.eligible && s ? (
            <>
              {/* 3. How much to borrow, and what the usual formula would have done */}
              <div className="mt-4 rounded-2xl bg-indigo-soft/60 px-4 py-3">
                <div className="text-[12.5px] font-semibold text-indigo">{t('Saathi advises you borrow', 'साथी की सलाह: इतना लोन लें')}</div>
                <div className="num text-[36px] leading-tight font-extrabold text-indigo-deep">{r.loan > 0 ? inr(r.loan) : t('No loan needed', 'लोन की ज़रूरत नहीं')}</div>
                {r.loan === 0 && <div className="mt-0.5 text-[13px] text-muted">{t('Your savings cover this unit. Keep the rest as a buffer.', 'आपकी बचत से यह इकाई शुरू हो जाएगी। बाकी पैसा बचाकर रखें।')}</div>}
                {naiveDiffers && (
                  <div className="mt-2 flex items-center justify-between gap-2 border-t border-indigo/10 pt-2 text-[12.5px]">
                    <span className="text-muted">
                      {t('Usual 10% formula', 'आम 10% फ़ॉर्मूला')}: <span className="num font-semibold text-ink/60 line-through">{inr(plan.naive.loan)}</span>
                    </span>
                    <span className="num shrink-0 rounded-md bg-risk-soft px-1.5 py-0.5 font-bold text-risk">
                      {t(`${pct(plan.naive.mc?.pDefault ?? 0)} risk`, `${pct(plan.naive.mc?.pDefault ?? 0)} जोखिम`)}
                    </span>
                  </div>
                )}
              </div>

              {/* 4. What repaying feels like, from the bank's schedule down to one day's work */}
              <div className="mt-4 text-[12.5px] font-bold text-muted">{t('To repay', 'चुकाना होगा')}</div>
              <div className="mt-1.5 grid grid-cols-3 divide-x divide-line rounded-xl border border-line text-center">
                <Pay v={inr(s.instalment)} l={t('every 3 months', 'हर 3 महीने')} strong />
                <Pay v={inr(s.instalment / 3)} l={t('save a month', 'हर महीने बचाएँ')} />
                <Pay v={`~${inr(plan.perDay)}`} l={t('a day', 'रोज़')} />
              </div>
              <p className="mt-1.5 text-[12px] text-muted">
                {t('A day’s instalment ≈ ', 'रोज़ की किस्त ≈ ')}
                <b className="num text-ink/80">{Math.max(1, Math.round(plan.localUnits))}</b> ({t(a.localUnit.en, a.localUnit.hi)})
              </p>

              {/* 5. The loan's terms, each with a plain label */}
              <dl className="mt-4 space-y-2 text-[13px]">
                <Term icon={<Landmark className="size-4" />} k={t('Lender', 'लोन देने वाला')} v={`${r.route.rule!.corporation} ${t(r.route.rule!.product, r.route.rule!.productHi)} · ${(r.route.rule!.ratePa * 100).toFixed(1)}%`} />
                <Term icon={<CalendarClock className="size-4" />} k={t('Grace period', 'शुरुआती छूट')} v={t(`First ${r.route.moratoriumQ * 3} months: interest only`, `पहले ${r.route.moratoriumQ * 3} महीने: सिर्फ़ ब्याज`)} />
                <Term
                  icon={<ShieldCheck className="size-4" />}
                  k={t('Safety', 'सुरक्षा')}
                  v={t(`Earns ${dscr(r.projection!.minDscr)}× the instalment · ${pct(r.mc?.pDefault ?? 0)} chance of trouble`, `किस्त से ${dscr(r.projection!.minDscr)} गुना कमाई · ${pct(r.mc?.pDefault ?? 0)} दिक़्क़त की संभावना`)}
                  good={(r.projection?.minDscr ?? 0) >= 1.5 && (r.mc?.pDefault ?? 1) < 0.15}
                />
              </dl>
            </>
          ) : (
          <div className="mt-4 rounded-xl bg-risk-soft p-3 text-[14px]">
            <b className="text-risk">{t('Not eligible for this corporation.', 'इस निगम के लिए पात्र नहीं।')}</b>
            <p className="mt-1">{t(r.route.flags[0]?.en ?? '', r.route.flags[0]?.hi ?? '')}</p>
            <p className="mt-2 font-semibold">{r.route.otherSchemes.map((o) => t(o.name, o.nameHi)).join(' / ')}</p>
          </div>
          )}

          {smaller && (
            <p className="mt-4 rounded-lg border-l-4 border-go bg-go-soft/60 px-3 py-2 text-[13px] font-semibold">
              {t(`You asked for ${plan.chosen.unit.size.label.en} (${lakh(plan.chosen.loan)} loan). Start with ${r.unit.size.label.en}, safe even in a bad year.`, `आपने ${plan.chosen.unit.size.label.hi} (${lakh(plan.chosen.loan)} लोन) चाहा। ${r.unit.size.label.hi} से शुरू करें, ख़राब साल में भी सुरक्षित।`)}
            </p>
          )}

          {/* 6. What to watch out for, worst first */}
          <div className="mt-4 border-t border-line pt-3">
            <div className="mb-2 text-[12.5px] font-bold text-muted">{t('Watch out for', 'इन बातों का ध्यान रखें')}</div>
            <ul className="space-y-1.5">
              {[...plan.topRisks]
                .sort((x, y) => RANK[x.level] - RANK[y.level])
                .map((x, i) => (
                  <li key={i} className={clsx('flex gap-2 rounded-lg px-2.5 py-2 text-[13px] leading-snug', x.level === 'high' ? 'bg-risk-soft/70' : x.level === 'medium' ? 'bg-caution-soft/70' : 'bg-khadi')}>
                    <TriangleAlert className={clsx('mt-0.5 size-4 shrink-0', x.level === 'high' ? 'text-risk' : x.level === 'medium' ? 'text-caution' : 'text-muted')} />
                    <span>{t(x.en, x.hi)}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </aside>
  )
}

const RANK = { high: 0, medium: 1, low: 2 } as const

function Pay({ v, l, strong }: { v: string; l: string; strong?: boolean }) {
  return (
    <div className={clsx('px-1.5 py-2.5', strong && 'bg-indigo-soft/40')}>
      <div className={clsx('num leading-tight font-bold', strong ? 'text-[18px] text-indigo-deep' : 'text-[16px] text-ink')}>{v}</div>
      <div className="text-[11.5px] text-muted">{l}</div>
    </div>
  )
}

function Term({ icon, k, v, good }: { icon: ReactNode; k: string; v: string; good?: boolean }) {
  return (
    <div className="flex gap-2.5">
      <span className={clsx('mt-0.5 shrink-0', good === undefined ? 'text-indigo' : good ? 'text-go' : 'text-caution')}>{icon}</span>
      <div className="min-w-0">
        <dt className="text-[11.5px] font-semibold text-muted">{k}</dt>
        <dd className="leading-snug text-ink/90">{v}</dd>
      </div>
    </div>
  )
}
