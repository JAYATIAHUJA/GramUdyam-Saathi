import { clsx } from 'clsx'
import { ArrowLeft, CalendarClock, Landmark, ShieldCheck, TriangleAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LangToggle, Logo, ReadAloud, VerdictStamp } from '../components/ui'
import { AltTab, MarketTab, MoneyTab, NextTab, RisksTab } from '../components/planTabs'
import { narrate } from '../engine/narrate'
import type { Plan } from '../engine/plan'
import { inr, lakh, pct, dscr } from '../lib/format'
import { planFor, useCase } from '../lib/plans'
import { useApp, useT } from '../lib/store'

const TABS = [
  { k: 'market', en: 'Market', hi: 'बाज़ार' },
  { k: 'money', en: 'Money', hi: 'पैसा' },
  { k: 'risks', en: 'Risks', hi: 'जोखिम' },
  { k: 'alts', en: 'Other ideas', hi: 'विकल्प' },
  { k: 'next', en: 'Next steps', hi: 'आगे क्या' },
] as const
type TabKey = (typeof TABS)[number]['k']

export default function PlanPage() {
  const { id } = useParams()
  const t = useT()
  const c = useCase(id)
  const [tab, setTab] = useState<TabKey>('market')
  const plan = useMemo(() => (c ? planFor(c, false) : null), [c])
  if (!c || !plan) {
    return (
      <div className="grid min-h-dvh place-items-center p-6 text-center">
        <div>
          <p className="font-display text-[26px] font-bold">{t('This plan is not on this phone.', 'यह योजना इस फ़ोन में नहीं है।')}</p>
          <Link to="/saathi" className="mt-4 inline-block rounded-full bg-indigo px-5 py-3 font-bold text-white">{t('Make a new plan', 'नई योजना बनाएँ')}</Link>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-dvh bg-khadi/60 lg:grid lg:grid-cols-[minmax(0,1fr)_520px_minmax(360px,1fr)]">
      <div className="hidden lg:block p-8">
        <Logo />
      </div>
      <main className="bg-paper lg:my-6 lg:rounded-[28px] lg:border lg:border-line lg:shadow-[0_30px_80px_-40px_rgba(28,37,102,0.55)] overflow-hidden">
        <header className="flex items-center justify-between px-4 pt-4">
          <Link to="/saathi" className="grid size-10 place-items-center rounded-full hover:bg-khadi" aria-label={t('Back', 'पीछे')}>
            <ArrowLeft className="size-5" />
          </Link>
          <span className="text-[12px] font-semibold text-muted">
            {t('Plan', 'योजना')} {plan.id}
          </span>
          <LangToggle className="scale-90" />
        </header>
        <VerdictCard plan={plan} />
        <nav className="sticky top-0 z-10 mt-2 flex gap-1 overflow-x-auto border-b border-line bg-paper/95 px-3 backdrop-blur" role="tablist">
          {TABS.map((x) => (
            <button
              key={x.k}
              role="tab"
              aria-selected={tab === x.k}
              onClick={() => setTab(x.k)}
              className={clsx('relative shrink-0 px-3 py-3 text-[15px] font-bold transition-colors', tab === x.k ? 'text-indigo' : 'text-muted hover:text-ink')}
            >
              {t(x.en, x.hi)}
              {tab === x.k && <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-t bg-marigold" />}
            </button>
          ))}
        </nav>
        <div className="px-4 py-5">
          {tab === 'market' && <MarketTab plan={plan} />}
          {tab === 'money' && <MoneyTab plan={plan} caseId={c.id} />}
          {tab === 'risks' && <RisksTab plan={plan} />}
          {tab === 'alts' && <AltTab c={c} />}
          {tab === 'next' && <NextTab plan={plan} />}
        </div>
      </main>
      <NarrationTrace plan={plan} />
    </div>
  )
}

function VerdictCard({ plan }: { plan: Plan }) {
  const t = useT()
  const lang = useApp((s) => s.lang)
  const r = plan.recommended
  const a = plan.feasibility.activity
  const s = r.schedule
  const smaller = r !== plan.chosen && r.passes
  const narration = useMemo(() => narrate(plan, lang), [plan, lang])
  const naiveDiffers = plan.naive.loan !== r.loan
  return (
    <section className="px-4 pt-3">
      <div className="card relative overflow-hidden p-5">
        <div className="absolute top-5 right-4">
          <VerdictStamp v={plan.verdict} />
        </div>
        <div className="pr-40">
          <div className="text-[14px] text-muted">
            {plan.input.name}, {t(plan.feasibility.village.name, plan.feasibility.village.nameHi)}
          </div>
          <div className="mt-0.5 flex items-center gap-2 font-display text-[22px] font-bold leading-tight">
            <span aria-hidden>{a.emoji}</span> {t(r.unit.size.label.en, r.unit.size.label.hi)}
          </div>
        </div>

        {r.route.eligible && s ? (
          <>
            <div className="mt-6">
              <div className="text-[13px] font-semibold text-muted">{t('Borrow', 'लोन लीजिए')}</div>
              <div className="num text-[52px] font-extrabold leading-none text-indigo-deep">{r.loan > 0 ? inr(r.loan) : t('No loan needed', 'लोन की ज़रूरत नहीं')}</div>
              {r.loan === 0 && <div className="mt-1 text-[14px] text-muted">{t('Your savings cover this unit. Keep the rest as a buffer.', 'आपकी बचत से यह इकाई शुरू हो जाएगी। बाकी पैसा बचाकर रखें।')}</div>}
              {naiveDiffers && (
                <div className="mt-2 text-[14px]">
                  <span className="text-muted">{t('The 10% formula would give', '10% फ़ॉर्मूला देता')} </span>
                  <span className="num font-bold text-risk line-through decoration-2">{inr(plan.naive.loan)}</span>
                  <span className="text-muted"> — {t(`${pct(plan.naive.mc?.pDefault ?? 0)} chance of trouble`, `${pct(plan.naive.mc?.pDefault ?? 0)} दिक़्क़त की संभावना`)}</span>
                </div>
              )}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-indigo-soft/70 p-3">
                <div className="text-[12.5px] font-semibold text-indigo">{t('Every 3 months', 'हर 3 महीने')}</div>
                <div className="num text-[26px] font-bold leading-tight">{inr(s.instalment)}</div>
                <div className="text-[12.5px] text-muted">{t(`Save ${inr(s.instalment / 3)} each month`, `हर महीने ${inr(s.instalment / 3)} बचाएँ`)}</div>
              </div>
              <div className="rounded-xl bg-marigold-soft p-3">
                <div className="text-[12.5px] font-semibold text-[#7a5500]">{t('That is, a day', 'यानी रोज़')}</div>
                <div className="num text-[26px] font-bold leading-tight">~{inr(plan.perDay)}</div>
                <div className="text-[12.5px] text-[#7a5500]">
                  ≈ {Math.max(1, Math.round(plan.localUnits))} {t(a.localUnit.en, a.localUnit.hi)}
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[13.5px]">
              <span className="inline-flex items-center gap-1.5">
                <Landmark className="size-4 text-indigo" />
                {r.route.rule!.corporation} {t(r.route.rule!.product, r.route.rule!.productHi)}, {(r.route.rule!.ratePa * 100).toFixed(1)}%
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="size-4 text-indigo" />
                {t(`First ${r.route.moratoriumQ * 3} months: interest only`, `पहले ${r.route.moratoriumQ * 3} महीने: सिर्फ़ ब्याज`)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-go" />
                DSCR {dscr(r.projection!.minDscr)}, {t('risk', 'जोखिम')} {pct(r.mc?.pDefault ?? 0)}
              </span>
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-xl bg-risk-soft p-4 text-[15px]">
            <b className="text-risk">{t('Not eligible for this corporation.', 'इस निगम के लिए पात्र नहीं।')}</b>
            <p className="mt-1">{t(r.route.flags[0]?.en ?? '', r.route.flags[0]?.hi ?? '')}</p>
            <p className="mt-2 font-semibold">{r.route.otherSchemes.map((o) => t(o.name, o.nameHi)).join(' / ')}</p>
          </div>
        )}

        {smaller && (
          <p className="mt-4 rounded-lg border-l-4 border-go bg-go-soft/60 px-3 py-2 text-[14.5px] font-semibold">
            {t(`You asked for ${plan.chosen.unit.size.label.en} (${lakh(plan.chosen.loan)} loan). Start with ${r.unit.size.label.en} — the repayment stays safe even in a bad year.`, `आपने ${plan.chosen.unit.size.label.hi} (${lakh(plan.chosen.loan)} लोन) चाहा। ${r.unit.size.label.hi} से शुरू करें — ख़राब साल में भी किस्त सुरक्षित।`)}
          </p>
        )}

        <div className="mt-5">
          <div className="mb-2 text-[13px] font-bold text-muted">{t('Top 3 risks', 'मुख्य 3 जोखिम')}</div>
          <ul className="space-y-2">
            {plan.topRisks.map((x, i) => (
              <li key={i} className="flex gap-2.5 text-[14.5px]">
                <TriangleAlert className={clsx('mt-0.5 size-4 shrink-0', x.level === 'high' ? 'text-risk' : x.level === 'medium' ? 'text-caution' : 'text-muted')} />
                {t(x.en, x.hi)}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
          <ReadAloud text={narration.text} lang={lang} label={t('Hear this plan', 'यह योजना सुनें')} />
          <span className="text-[12px] text-muted">{t('60-second summary', '60 सेकंड का सार')}</span>
        </div>
      </div>
    </section>
  )
}

function NarrationTrace({ plan }: { plan: Plan }) {
  const t = useT()
  const lang = useApp((s) => s.lang)
  const n = useMemo(() => narrate(plan, lang), [plan, lang])
  return (
    <aside className="hidden lg:flex flex-col gap-4 p-6 text-[13px]">
      <div className="rounded-2xl bg-indigo-deep p-5 text-white">
        <div className="font-display text-[18px] font-bold">{t('Narration + numeric guard', 'वाचन + संख्या गार्ड')}</div>
        <p className="mt-3 rounded-lg bg-white/5 p-3 text-[14px] leading-relaxed">{n.text}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {n.guard.found.map((x, i) => (
            <span key={i} className="rounded bg-go/25 px-1.5 py-0.5 font-mono text-[11.5px] text-[#b8f0c8]">
              {x.toLocaleString('en-IN')} ✓
            </span>
          ))}
        </div>
        <p className={clsx('mt-3 font-semibold', n.guard.ok ? 'text-[#8fe3a8]' : 'text-[#ffb4a8]')}>
          {n.guard.ok ? t(`Guard passed: all ${n.guard.found.length} numbers exist in the facts JSON.`, `गार्ड पास: सभी ${n.guard.found.length} संख्याएँ तथ्यों में हैं।`) : t(`Blocked: ${n.guard.unknown.join(', ')} not in facts — template fallback used.`, `रोका गया: ${n.guard.unknown.join(', ')} तथ्यों में नहीं।`)}
        </p>
      </div>
      <div className="card p-4">
        <div className="font-display text-[16px] font-bold">{t('Audit record', 'ऑडिट रिकॉर्ड')}</div>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
          <dt className="text-muted">{t('Rule set', 'नियम')}</dt>
          <dd className="font-semibold">{plan.ruleVersion}</dd>
          <dt className="text-muted">{t('Rule ID', 'नियम ID')}</dt>
          <dd className="font-semibold">{plan.recommended.route.rule?.id ?? '—'}</dd>
          <dt className="text-muted">{t('Data', 'डेटा')}</dt>
          <dd className="font-semibold">{plan.dataVersion}</dd>
          <dt className="text-muted">{t('Monte Carlo', 'मोंटे कार्लो')}</dt>
          <dd className="font-semibold">{t('1,000 runs, seeded from inputs', '1,000 बार, इनपुट से तय बीज')}</dd>
          <dt className="text-muted">{t('Narrator', 'वाचक')}</dt>
          <dd className="font-semibold">{t('Template path (Sarvam-30B in production)', 'टेम्पलेट (प्रोडक्शन में Sarvam-30B)')}</dd>
        </dl>
        <p className="mt-3 text-muted">{t('Same inputs + same versions → same rupees. The SCA can re-run this plan.', 'वही इनपुट + वही संस्करण → वही रुपये। SCA इसे दोबारा चला सकता है।')}</p>
      </div>
    </aside>
  )
}
