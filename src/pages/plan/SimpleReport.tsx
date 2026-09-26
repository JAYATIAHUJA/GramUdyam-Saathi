import { clsx } from 'clsx'
import { ArrowLeft, ArrowRight, CalendarClock, Download, ExternalLink, MessageCircle, TriangleAlert, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ActivityArt, Didi } from '../../components/art'
import { GovBar } from '../../components/site'
import { LangToggle, ReadAloud, VerdictStamp } from '../../components/ui'
import type { Plan } from '../../engine/plan'
import { inr } from '../../lib/format'
import { useApp, useT } from '../../lib/store'
import { NumCard } from './NumCard'
import { DIDI_SAYS } from './didiSays'

/** The beneficiary's view: one column, three numbers, three cautions, four actions. */
export function SimpleReport({ plan, onFull, narration }: { plan: Plan; onFull: () => void; narration: string }) {
  const t = useT()
  const lang = useApp((s) => s.lang)
  const r = plan.recommended
  const a = plan.feasibility.activity
  const s = r.schedule
  const says = DIDI_SAYS[plan.verdict]
  const ok = r.route.eligible && !!s
  const smaller = r !== plan.chosen && r.passes
  const share = encodeURIComponent(
    t(
      `My GramUdyam Saathi plan ${plan.id}: ${a.name.en}, ${r.unit.size.label.en}. Loan ${inr(r.loan)}, ${inr(s?.instalment ?? 0)} every 3 months.`,
      `मेरी ग्रामउद्यम साथी योजना ${plan.id}: ${a.name.hi}, ${r.unit.size.label.hi}। लोन ${inr(r.loan)}, हर 3 महीने ${inr(s?.instalment ?? 0)}।`,
    ),
  )
  return (
    <div className="flex min-h-dvh flex-col bg-khadi/60 md:h-dvh md:overflow-hidden">
      <GovBar />
      <header className="no-print flex shrink-0 items-center justify-between gap-3 border-b border-line bg-paper px-4 py-1.5">
        <Link to="/saathi" className="inline-flex h-10 items-center gap-1 rounded-full pr-3 pl-2 text-[14px] font-semibold text-ink/80 hover:bg-khadi">
          <ArrowLeft className="size-5" />
          <span className="hidden sm:inline">{t('Back', 'पीछे')}</span>
        </Link>
        <span className="min-w-0 truncate text-[14px]">
          <b>{plan.input.name}</b>
          <span className="text-muted"> · {t(plan.feasibility.village.name, plan.feasibility.village.nameHi)}</span>
        </span>
        <LangToggle className="scale-90" />
      </header>

      <main id="main" className="mx-auto flex w-full max-w-[760px] flex-1 flex-col gap-3 px-4 py-3 md:min-h-0">
        {/* Didi says the answer in one sentence */}
        <div className="rise flex shrink-0 items-center gap-3">
          <Didi mood={says.mood} className="w-[60px] shrink-0 sm:w-[76px]" />
          <div className="flex-1">
            <p className="font-display text-[21px] leading-tight font-bold text-indigo-deep sm:text-[28px]">{t(says.en, says.hi)}</p>
          </div>
          <div className="hidden shrink-0 sm:block">
            <VerdictStamp v={plan.verdict} />
          </div>
        </div>

        {ok ? (
          <div className="grid shrink-0 gap-2 sm:grid-cols-3 sm:gap-2.5">
            <NumCard icon={<ActivityArt code={a.code} className="size-8 rounded-lg" />} label={t('Take a loan of', 'इतना लोन लें')} value={r.loan > 0 ? inr(r.loan) : t('None', 'ज़रूरत नहीं')} sub={t(`for ${r.unit.size.label.en}`, `${r.unit.size.label.hi} के लिए`)} strong />
            <NumCard icon={<span className="grid size-8 place-items-center rounded-lg bg-indigo-soft text-indigo"><CalendarClock className="size-4.5" /></span>} label={t('Pay every 3 months', 'हर 3 महीने भरें')} value={inr(s!.instalment)} sub={t(`Save ${inr(s!.instalment / 3)} a month`, `हर महीने ${inr(s!.instalment / 3)} बचाएँ`)} />
            <NumCard warm icon={<span className="grid size-8 place-items-center rounded-lg bg-white/70 text-[#7a5500]"><Wallet className="size-4.5" /></span>} label={t('That means, each day', 'यानी रोज़')} value={`~${inr(plan.perDay)}`} sub={`≈ ${Math.max(1, Math.round(plan.localUnits))} ${t(a.localUnit.en, a.localUnit.hi)}`} />
          </div>
        ) : (
          <div className="card shrink-0 p-4 text-[15.5px]">
            <b className="text-risk">{t('This loan scheme is not for you.', 'यह लोन योजना आपके लिए नहीं है।')}</b>
            <p className="mt-1">{t(r.route.flags[0]?.en ?? '', r.route.flags[0]?.hi ?? '')}</p>
            <p className="mt-2">
              {t('You can try', 'आप कोशिश कर सकते हैं')}: <b>{r.route.otherSchemes.map((o) => t(o.name, o.nameHi)).join(', ')}</b>
            </p>
          </div>
        )}

        {smaller && (
          <p className="shrink-0 rounded-xl border-l-4 border-go bg-go-soft/70 px-3.5 py-2 text-[14px] font-semibold sm:px-4 sm:py-2.5 sm:text-[15px]">
            {t(`Start smaller: ${r.unit.size.label.en} instead of ${plan.chosen.unit.size.label.en}. It stays safe even in a bad year.`, `छोटे से शुरू करें: ${plan.chosen.unit.size.label.hi} नहीं, ${r.unit.size.label.hi}। ख़राब साल में भी सुरक्षित।`)}
          </p>
        )}

        <div className="card shrink-0 px-3.5 py-3 sm:p-4">
          <div className="mb-1.5 font-display text-[17px] font-bold text-ink sm:mb-2 sm:text-[18px]">{t('Keep in mind', 'ध्यान रखें')}</div>
          <ul className="space-y-1.5 text-[14px] sm:text-[15px]">
            {plan.topRisks.map((x, i) => (
              <li key={i} className="flex gap-2.5 leading-snug">
                <TriangleAlert className={clsx('mt-0.5 size-4.5 shrink-0', x.level === 'high' ? 'text-risk' : x.level === 'medium' ? 'text-caution' : 'text-muted')} />
                {t(x.en, x.hi)}
              </li>
            ))}
          </ul>
        </div>

        <div className="sticky bottom-0 -mx-4 grid shrink-0 grid-cols-2 gap-2 border-t border-line bg-khadi/95 px-4 py-2.5 backdrop-blur sm:static sm:mx-0 sm:grid-cols-4 sm:gap-2.5 sm:border-0 sm:bg-transparent sm:p-0">
          {narration && <ReadAloud text={narration} lang={lang} label={t('Hear it', 'सुनें')} className="!justify-center !rounded-2xl !border-2 !py-3 !text-[16px]" />}
          <Link to={`/dpr/${plan.id}`} className="flex items-center justify-center gap-2 rounded-2xl bg-indigo px-3 py-3 text-[16px] font-bold text-white">
            <Download className="size-5 text-marigold" /> {t('Report', 'रिपोर्ट')}
          </Link>
          <a href={`https://wa.me/?text=${share}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl border-2 border-go/30 bg-white px-3 py-3 text-[16px] font-bold text-go">
            <MessageCircle className="size-5" /> WhatsApp
          </a>
          <a href="https://pmsuraj.dosje.gov.in" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl border-2 border-indigo/25 bg-white px-3 py-3 text-[16px] font-bold text-indigo">
            <ExternalLink className="size-5" /> {t('Apply', 'आवेदन करें')}
          </a>
        </div>

        <button onClick={onFull} className="mx-auto inline-flex shrink-0 items-center gap-1.5 text-[14.5px] font-semibold text-indigo hover:underline">
          {t('See full calculation (for helpers and officers)', 'पूरा हिसाब देखें (सहायक और अधिकारी के लिए)')} <ArrowRight className="size-4" />
        </button>
      </main>
    </div>
  )
}
