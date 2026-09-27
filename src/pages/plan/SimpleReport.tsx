import { clsx } from 'clsx'
import { ArrowLeft, ArrowRight, Download, ExternalLink, MessageCircle, Sprout, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ActivityArt, Didi } from '../../components/art'
import { GovBar } from '../../components/site'
import { LangToggle, ReadAloud, Tip, VERDICT } from '../../components/ui'
import type { Plan } from '../../engine/plan'
import { inr } from '../../lib/format'
import { useApp, useT } from '../../lib/store'
import { DIDI_SAYS } from './didiSays'

/** The beneficiary's view: Didi's answer, the loan card, what to keep in mind, and the actions. */
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

      <main id="main" className="mx-auto w-full max-w-[1040px] flex-1 px-4 py-4 md:min-h-0 md:overflow-y-auto md:py-6">
        <div className="grid gap-5 md:grid-cols-[minmax(0,300px)_minmax(0,1fr)] md:gap-8">
          {/* Left: Didi gives the answer; the verdict sits under her words */}
          <section className="flex items-center gap-4 md:flex-col md:items-start md:gap-3">
            <div className="rise relative shrink-0">
              <div aria-hidden className="absolute inset-x-2 bottom-0 h-6 rounded-full blur-md md:inset-x-6" style={{ background: v.color + '33' }} />
              <Didi mood={says.mood} className="relative w-[88px] md:w-[170px]" />
            </div>
            <div className="rise min-w-0 flex-1" style={{ animationDelay: '80ms' }}>
              <p className="font-display text-[19px] leading-snug font-bold text-indigo-deep md:text-[23px]">{t(says.en, says.hi)}</p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-bold" style={{ color: v.color, background: v.color + '14' }}>
                <VIcon className="size-3.5" aria-hidden />
                <Tip tip={t(v.enSub, v.hiSub)}>{t(v.en, v.hi)}</Tip>
              </span>
            </div>
          </section>

          {/* Right: the loan, then what to keep in mind */}
          <div className="flex min-w-0 flex-col gap-5">
            {ok ? (
              <section className="rise relative rounded-[24px] bg-indigo-deep text-white shadow-[0_24px_60px_-34px_rgba(28,37,102,0.9)]" style={{ animationDelay: '140ms' }}>
                {/* Glow is clipped in its own layer so tooltips can still pop out of the card */}
                <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px]">
                  <div className="absolute -top-24 -right-20 size-64 rounded-full bg-marigold/25 blur-3xl" />
                  <div className="absolute -bottom-24 -left-10 size-56 rounded-full bg-indigo blur-3xl" />
                </div>

                <div className="relative flex items-center gap-4 px-5 pt-5 pb-4 md:px-6 md:pt-6">
                  <ActivityArt code={a.code} className="size-12 shrink-0 rounded-2xl ring-2 ring-white/15" />
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-semibold text-white/60">{t('Loan to take', 'इतना लोन लें')}</div>
                    <div className="num text-[34px] leading-none font-extrabold tracking-tight md:text-[42px]">{r.loan > 0 ? inr(r.loan) : t('None', 'ज़रूरत नहीं')}</div>
                    <div className="mt-1 truncate text-[13px] text-white/70">{t(r.unit.size.label.en, r.unit.size.label.hi)}</div>
                  </div>
                </div>

                <dl className="relative grid grid-cols-3 rounded-b-[24px] border-t border-white/10 bg-white/[0.04]">
                  <Repay v={inr(s!.instalment)} l={t('every 3 months', 'हर 3 महीने')} tip={t('Your instalment to the bank, once a quarter.', 'बैंक को हर तिमाही जाने वाली किस्त।')} strong />
                  <Repay v={inr(s!.instalment / 3)} l={t('save a month', 'हर महीने बचाएँ')} tip={t('Put this aside every month so the instalment is ready.', 'हर महीने इतना अलग रखें, ताकि किस्त तैयार रहे।')} />
                  <Repay v={`~${inr(plan.perDay)}`} l={t('a day', 'रोज़')} tip={t(`About ${Math.max(1, Math.round(plan.localUnits))} ${a.localUnit.en}.`, `लगभग ${Math.max(1, Math.round(plan.localUnits))} ${a.localUnit.hi}।`)} />
                </dl>
              </section>
            ) : (
              <section className="rise rounded-[24px] bg-risk-soft p-5 text-[14.5px]">
                <b className="text-risk">{t('This loan scheme is not for you.', 'यह लोन योजना आपके लिए नहीं है।')}</b>
                <p className="mt-1">{t(r.route.flags[0]?.en ?? '', r.route.flags[0]?.hi ?? '')}</p>
                <p className="mt-2">
                  {t('You can try', 'आप कोशिश कर सकते हैं')}: <b>{r.route.otherSchemes.map((o) => t(o.name, o.nameHi)).join(', ')}</b>
                </p>
              </section>
            )}

            {smaller && (
              <p className="rise flex gap-2 text-[13.5px] text-ink/80" style={{ animationDelay: '200ms' }}>
                <Sprout className="mt-0.5 size-4 shrink-0 text-go" aria-hidden />
                {t(`Start smaller: ${r.unit.size.label.en}, not ${plan.chosen.unit.size.label.en}. Safe even in a bad year.`, `छोटे से शुरू करें: ${plan.chosen.unit.size.label.hi} नहीं, ${r.unit.size.label.hi}। ख़राब साल में भी सुरक्षित।`)}
              </p>
            )}

            <section className="rise" style={{ animationDelay: '240ms' }}>
              <h2 className="mb-1 text-[12.5px] font-bold tracking-wide text-muted uppercase">{t('Keep in mind', 'ध्यान रखें')}</h2>
              <ul className="divide-y divide-line/80">
                {[...plan.topRisks]
                  .sort((x, y) => RANK[x.level] - RANK[y.level])
                  .map((x, i) => (
                    <li key={i} className="flex items-start gap-3 py-2.5 text-[14px] leading-snug text-ink/85">
                      <span className={clsx('mt-0.5 grid size-6 shrink-0 place-items-center rounded-full', x.level === 'high' ? 'bg-risk-soft text-risk' : x.level === 'medium' ? 'bg-caution-soft text-caution' : 'bg-khadi text-muted')}>
                        <TriangleAlert className="size-3.5" aria-hidden />
                      </span>
                      <span className="pt-0.5">{t(x.en, x.hi)}</span>
                    </li>
                  ))}
              </ul>
            </section>

            <button onClick={onFull} className="hidden self-start text-[13.5px] font-semibold text-indigo hover:underline md:inline-flex md:items-center md:gap-1">
              {t('Full calculation for helpers and officers', 'सहायक और अधिकारी के लिए पूरा हिसाब')} <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Actions stay in reach: pinned on phones, a quiet bar on computers */}
      <div className="no-print sticky bottom-0 z-30 shrink-0 border-t border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1040px] gap-2 px-4 py-2.5">
          {narration && (
            <ReadAloud
              text={narration}
              lang={lang}
              label={<span className="hidden sm:inline">{t('Hear it', 'सुनें')}</span>}
              className="!size-11 shrink-0 !justify-center !rounded-xl !border !p-0 !text-[14px] sm:!w-auto sm:!px-4"
            />
          )}
          <a href={`https://wa.me/?text=${share}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="flex size-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-line bg-white text-[14px] font-bold text-go transition-colors hover:border-go/40 sm:w-auto sm:px-4">
            <MessageCircle className="size-5" /> <span className="hidden sm:inline">WhatsApp</span>
          </a>
          <span className="hidden flex-1 md:block" />
          <Link to={`/dpr/${plan.id}`} className="flex h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border border-line bg-white px-3 text-[14px] font-bold text-indigo transition-colors hover:border-indigo/40 md:flex-none md:px-5">
            <Download className="size-4.5 shrink-0" /> <span className="truncate">{t('Report', 'रिपोर्ट')}</span>
          </Link>
          <a href="https://pmsuraj.dosje.gov.in" target="_blank" rel="noreferrer" className="flex h-11 min-w-0 flex-[1.4] items-center justify-center gap-1.5 rounded-xl bg-marigold px-3 text-[14.5px] font-bold text-indigo-deep shadow-[0_4px_0_#b98200] transition-transform active:translate-y-0.5 active:shadow-[0_2px_0_#b98200] md:flex-none md:px-6">
            <ExternalLink className="size-4.5 shrink-0" /> <span className="truncate">{t('Apply', 'आवेदन करें')}</span>
          </a>
        </div>
      </div>
    </div>
  )
}

const RANK = { high: 0, medium: 1, low: 2 } as const

/** One repayment figure on the dark loan card; the label explains itself on hover or tap. */
function Repay({ v, l, tip, strong }: { v: string; l: string; tip: string; strong?: boolean }) {
  return (
    <div className="min-w-0 border-white/10 px-3 py-3.5 text-center [&:not(:first-child)]:border-l md:py-4">
      <dd className={clsx('num truncate leading-tight font-bold', strong ? 'text-[19px] text-marigold md:text-[21px]' : 'text-[16px] text-white md:text-[18px]')}>{v}</dd>
      <dt className="mt-0.5 text-[11.5px] leading-tight text-white/60">
        <Tip tip={tip} dark>
          {l}
        </Tip>
      </dt>
    </div>
  )
}
