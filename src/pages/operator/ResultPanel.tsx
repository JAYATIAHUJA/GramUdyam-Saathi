import { clsx } from 'clsx'
import { CalendarClock, ChevronDown, Circle, ClipboardList, Printer, Send, Wallet } from 'lucide-react'
import type { ReactNode } from 'react'
import { ActivityArt } from '../../components/art'
import { VerdictStamp } from '../../components/ui'
import { activityByCode } from '../../data/activities'
import type { Plan } from '../../engine/plan'
import { dscr, inr, lakh, pct } from '../../lib/format'
import { useT } from '../../lib/store'

/** Live result beside the form, with print and send actions. */
export function ResultPanel({ plan, activity, missing, onPrint, onSend }: { plan: Plan; activity: string; missing: { key: string; en: string; hi: string }[]; onPrint: () => void; onSend: () => void }) {
  const t = useT()
  const r = plan.recommended
  const a = activityByCode(activity)
  const ready = missing.length === 0
  return (
    <aside className="card flex flex-col lg:min-h-0">
      <div className="flex shrink-0 items-center justify-between border-b border-line px-4 py-3">
        <span className="font-display text-[18px] font-bold">{t('Result', 'नतीजा')}</span>
        {ready && <span className="text-[12px] font-semibold text-muted">{t('updates live', 'साथ-साथ बदलता है')}</span>}
      </div>
      {!ready ? (
        <div className="flex-1 px-4 py-4 lg:min-h-0 lg:overflow-y-auto">
          <div className="grid place-items-center rounded-2xl border border-dashed border-line bg-khadi/40 px-4 py-6 text-center">
            <span className="grid size-11 place-items-center rounded-full bg-indigo-soft text-indigo">
              <ClipboardList className="size-5" />
            </span>
            <p className="mt-2 font-display text-[16px] font-bold text-indigo-deep">{t('Result appears here', 'नतीजा यहाँ दिखेगा')}</p>
            <p className="mt-0.5 text-[12.5px] text-muted">{t('Fill the form with the applicant first.', 'पहले आवेदक के साथ फ़ॉर्म भरें।')}</p>
          </div>
          <div className="mt-4 flex items-center justify-between text-[12.5px] font-bold text-muted">
            <span>{t('Still to fill', 'अभी भरना है')}</span>
            <span className="num">{t(`${missing.length} left`, `${missing.length} बाक़ी`)}</span>
          </div>
          <ul className="mt-1.5 space-y-1">
            {missing.map((m) => (
              <li key={m.key} className="flex items-center gap-2 rounded-lg px-2 py-1 text-[13px] text-ink/80">
                <Circle className="size-3.5 text-line" />
                {t(m.en, m.hi)}
              </li>
            ))}
          </ul>
        </div>
      ) : (
      <div className="flex-1 px-4 py-3 lg:min-h-0 lg:overflow-y-auto">
        <div className="flex items-center gap-3">
          <ActivityArt code={a.code} className="size-12" />
          <div className="min-w-0 flex-1 leading-tight">
            <div className="font-display text-[17px] font-bold">{t(r.unit.size.label.en, r.unit.size.label.hi)}</div>
            <div className="truncate text-[12.5px] text-muted">{t(a.name.en, a.name.hi)}</div>
          </div>
          <div className="origin-right scale-[0.62]">
            <VerdictStamp v={plan.verdict} animate={false} />
          </div>
        </div>
        {r.route.eligible && r.schedule ? (
          <>
            <div className="mt-3 rounded-2xl bg-indigo-soft/60 p-3">
              <div className="text-[12.5px] font-semibold text-indigo">{t('Recommended loan', 'सुझाया गया लोन')}</div>
              <div className="num text-[34px] leading-none font-extrabold text-indigo-deep">{inr(r.loan)}</div>
              <div className="mt-1 text-[12.5px] text-muted">
                {r.route.rule!.corporation} {t(r.route.rule!.product, r.route.rule!.productHi)}, {(r.route.rule!.ratePa * 100).toFixed(1)}%
              </div>
            </div>
            <dl className="mt-2 grid grid-cols-2 gap-2">
              <Kv icon={<CalendarClock className="size-4" />} k={t('Every 3 months', 'हर 3 महीने')} v={inr(r.schedule.instalment)} />
              <Kv icon={<Wallet className="size-4" />} k={t('Asked for', 'माँगा था')} v={lakh(plan.chosen.loan)} />
            </dl>
            <details className="group mt-2 rounded-xl border border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-[12.5px] font-bold text-muted hover:text-ink">
                {t('Details', 'विस्तार')}
                <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
              </summary>
              <dl className="grid grid-cols-2 gap-2 px-2 pb-2">
              <Kv k={t('Safety (DSCR)', 'सुरक्षा (DSCR)')} v={dscr(r.projection!.minDscr)} good={(r.projection?.minDscr ?? 0) >= 1.5} />
              <Kv k={t('Chance of trouble', 'दिक़्क़त की संभावना')} v={pct(r.mc?.pDefault ?? 0)} good={(r.mc?.pDefault ?? 1) < 0.15} />
              <Kv k={t('Right-fit score', 'फ़िट स्कोर')} v={`${plan.fit.score}/100`} good={plan.fit.score >= 65} />
              <Kv k={t('Market crowding', 'बाज़ार में भीड़')} v={`${plan.feasibility.saturation.index.toFixed(2)}×`} good={plan.feasibility.saturation.index <= 1} />
              </dl>
            </details>
          </>
        ) : (
          <p className="mt-3 rounded-xl bg-risk-soft p-3 text-[14px]">{t(r.route.flags[0]?.en ?? '', r.route.flags[0]?.hi ?? '')}</p>
        )}
        <div className="mt-3 text-[12.5px] font-bold text-muted">{t('Tell the applicant', 'आवेदक को बताएँ')}</div>
        <ul className="mt-1.5 space-y-1.5 text-[13px] leading-snug">
          {[...plan.reasons, ...[...plan.naive.route.flags, ...r.route.flags].filter((f, i, arr) => arr.findIndex((x) => x.code === f.code) === i)].slice(0, 4).map((x, i) => (
            <li key={i} className="rounded-lg bg-khadi px-2.5 py-1.5">
              {t(x.en, x.hi)}
            </li>
          ))}
        </ul>
      </div>
      )}
      <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-line p-3">
        <button
          onClick={onPrint}
          disabled={!ready}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-line bg-white px-3 py-2.5 text-[14px] font-bold hover:border-indigo/40 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-line"
        >
          <Printer className="size-4" /> {t('Print report', 'रिपोर्ट प्रिंट')}
        </button>
        <button
          onClick={onSend}
          disabled={!ready}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-go px-3 py-2.5 text-[14px] font-bold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:brightness-100"
        >
          <Send className="size-4" /> {t('Send to SCA', 'SCA को भेजें')}
        </button>
      </div>
    </aside>
  )
}

function Kv({ k, v, icon, good }: { k: string; v: string; icon?: ReactNode; good?: boolean }) {
  return (
    <div className="rounded-xl bg-khadi px-2.5 py-2">
      <dt className="flex items-center gap-1 text-[12px] text-muted">
        {icon}
        {k}
      </dt>
      <dd className={clsx('num text-[17px] font-bold', good === true && 'text-go', good === false && 'text-caution')}>{v}</dd>
    </div>
  )
}
