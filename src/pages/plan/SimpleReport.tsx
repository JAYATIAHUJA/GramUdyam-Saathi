import { clsx } from 'clsx'
import { ArrowLeft, ArrowRight, Download, ExternalLink, MessageCircle, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ActivityArt, Didi } from '../../components/art'
import { GovBar } from '../../components/site'
import { LangToggle, ReadAloud, VERDICT } from '../../components/ui'
import type { Plan } from '../../engine/plan'
import { inr } from '../../lib/format'
import { useApp, useT } from '../../lib/store'
import { DIDI_SAYS } from './didiSays'

/** The beneficiary's view: one column, three numbers, three cautions, four actions. */
export function SimpleReport({ plan, onFull, narration }: { plan: Plan; onFull: () => void; narration: string }) {
  const t = useT()
  const lang = useApp((s) => s.lang)
  const r = plan.recommended
  const a = plan.feasibility.activity
  const s = r.schedule
  const says = DIDI_SAYS[plan.verdict]
  const v = VERDICT[plan.verdict]
  const VIcon = v.icon
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
        {/* Didi says the answer in one sentence, then the verdict as a plain coloured tag */}
        <div className="rise flex shrink-0 items-center gap-3">
          <Didi mood={says.mood} className="w-[56px] shrink-0 sm:w-[72px]" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-[20px] leading-tight font-bold text-indigo-deep sm:text-[26px]">{t(says.en, says.hi)}</p>
            <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-bold" style={{ color: v.color, background: v.color + '14', boxShadow: `inset 0 0 0 1px ${v.color}33` }}>
              <VIcon className="size-4" aria-hidden />
              {t(v.en, v.hi)}
              <span className="hidden font-medium text-ink/60 sm:inline">· {t(v.enSub, v.hiSub)}</span>
            </span>
          </div>
        </div>

        {ok ? (
          <section className="card shrink-0 overflow-hidden shadow-[0_16px_40px_-30px_rgba(28,37,102,0.5)]">
            {/* The one number that matters most */}
            <div className="flex items-center gap-3 px-4 pt-4 pb-3.5">
              <ActivityArt code={a.code} className="size-12 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-muted">{t('Take a loan of', 'इतना लोन लें')}</div>
                <div className="num text-[34px] leading-none font-extrabold text-indigo-deep sm:text-[40px]">{r.loan > 0 ? inr(r.loan) : t('None', 'ज़रूरत नहीं')}</div>
                <div className="mt-1 truncate text-[13px] text-ink/70">{t(`for ${r.unit.size.label.en}`, `${r.unit.size.label.hi} के लिए`)}</div>
              </div>
            </div>

            {/* What repaying it feels like, big to small */}
            <div className="border-t border-line bg-khadi/40 px-4 pt-2.5 pb-3">
              <div className="text-[12.5px] font-bold text-muted">{t('To repay', 'चुकाना होगा')}</div>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                <Repay v={inr(s!.instalment)} l={t('every 3 months', 'हर 3 महीने')} strong />
                <Repay v={inr(s!.instalment / 3)} l={t('save a month', 'हर महीने बचाएँ')} />
                <Repay v={`~${inr(plan.perDay)}`} l={t('each day', 'रोज़')} />
              </div>
              <p className="mt-2 text-[12.5px] text-ink/65">
                {t('That is about the earning from ', 'यानी लगभग ')}
                <b className="num text-ink">{Math.max(1, Math.round(plan.localUnits))}</b> {t(`(${a.localUnit.en}) a day`, `(${a.localUnit.hi}) की रोज़ की कमाई`)}
              </p>
            </div>
          </section>
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

        <section className="shrink-0">
          <h2 className="mb-2 px-0.5 font-display text-[17px] font-bold text-ink">{t('Keep in mind', 'ध्यान रखें')}</h2>
          <ul className="space-y-1.5">
            {[...plan.topRisks]
              .sort((x, y) => RANK[x.level] - RANK[y.level])
              .map((x, i) => (
                <li key={i} className={clsx('flex gap-2.5 rounded-xl px-3 py-2.5 text-[14px] leading-snug sm:text-[15px]', x.level === 'high' ? 'bg-risk-soft/80' : x.level === 'medium' ? 'bg-caution-soft/80' : 'bg-white')}>
                  <TriangleAlert className={clsx('mt-0.5 size-4.5 shrink-0', x.level === 'high' ? 'text-risk' : x.level === 'medium' ? 'text-caution' : 'text-muted')} />
                  <span>{t(x.en, x.hi)}</span>
                </li>
              ))}
          </ul>
        </section>

        <button onClick={onFull} className="mx-auto hidden shrink-0 md:inline-flex items-center gap-1.5 py-1 text-[14px] font-semibold text-indigo hover:underline">
          {t('See full calculation (for helpers and officers)', 'पूरा हिसाब देखें (सहायक और अधिकारी के लिए)')} <ArrowRight className="size-4" />
        </button>

        {/* One slim action bar: the two main actions get words, the two helpers are icons on phones */}
        <div className="sticky bottom-0 -mx-4 mt-auto flex shrink-0 gap-2 border-t border-line bg-paper/95 px-4 py-2.5 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
          {narration && (
            <ReadAloud
              text={narration}
              lang={lang}
              label={<span className="hidden sm:inline">{t('Hear it', 'सुनें')}</span>}
              className="!size-12 shrink-0 !justify-center !rounded-xl !border-2 !p-0 !text-[15px] sm:!h-12 sm:!w-auto sm:!px-4"
            />
          )}
          <a href={`https://wa.me/?text=${share}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="flex size-12 shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-go/30 bg-white text-[15px] font-bold text-go sm:w-auto sm:px-4">
            <MessageCircle className="size-5" /> <span className="hidden sm:inline">WhatsApp</span>
          </a>
          <Link to={`/dpr/${plan.id}`} className="flex h-12 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-indigo/25 bg-white px-2 text-[15px] font-bold text-indigo">
            <Download className="size-5 shrink-0" /> <span className="truncate">{t('Report', 'रिपोर्ट')}</span>
          </Link>
          <a href="https://pmsuraj.dosje.gov.in" target="_blank" rel="noreferrer" className="flex h-12 min-w-0 flex-[1.4] items-center justify-center gap-1.5 rounded-xl bg-indigo px-2 text-[15px] font-bold text-white shadow-[0_6px_16px_-8px_rgba(46,58,140,0.8)]">
            <ExternalLink className="size-5 shrink-0 text-marigold" /> <span className="truncate">{t('Apply', 'आवेदन करें')}</span>
          </a>
        </div>
      </main>
    </div>
  )
}

const RANK = { high: 0, medium: 1, low: 2 } as const

function Repay({ v, l, strong }: { v: string; l: string; strong?: boolean }) {
  return (
    <div className={clsx('min-w-0 rounded-xl px-2 py-2 text-center', strong ? 'bg-indigo-soft' : 'bg-white')}>
      <div className={clsx('num truncate leading-tight font-bold', strong ? 'text-[17px] text-indigo-deep' : 'text-[16px] text-ink')}>{v}</div>
      <div className="text-[11.5px] leading-tight text-muted">{l}</div>
    </div>
  )
}
