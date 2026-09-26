import { clsx } from 'clsx'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { AltTab, MarketTab, MoneyTab, NextTab, RisksTab } from '../../components/plan'
import { GovBar } from '../../components/site'
import { LangToggle, Logo, ReadAloud } from '../../components/ui'
import type { Plan } from '../../engine/plan'
import { type SavedCase, useApp, useT } from '../../lib/store'
import { VerdictPanel } from './VerdictPanel'
import { TabKey, TABS } from './tabs'

/** Helpers' and officers' view: verdict on the left, the five report sections on the right. */
export function FullReport({ plan, c, narration, onSimple }: { plan: Plan; c: SavedCase; narration: string; onSimple: () => void }) {
  const t = useT()
  const lang = useApp((s) => s.lang)
  const [tab, setTab] = useState<TabKey>('market')
  return (
    // From lg up the whole report is one screen: verdict on the left, sections on the right.
    <div className="flex min-h-dvh flex-col bg-khadi/60 lg:h-dvh lg:overflow-hidden">
      <GovBar />
      <header className="no-print flex shrink-0 items-center justify-between gap-3 border-b border-line bg-paper px-4 py-1.5">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={onSimple} className="inline-flex h-10 items-center gap-1 rounded-full pr-3 pl-2 text-[14px] font-semibold text-ink/80 hover:bg-khadi">
            <ArrowLeft className="size-5" />
            <span className="hidden sm:inline">{t('Simple report', 'आसान रिपोर्ट')}</span>
          </button>
          <span className="hidden lg:block">
            <Logo />
          </span>
        </div>
        <div className="min-w-0 truncate text-center text-[13.5px]">
          <b className="text-ink">{plan.input.name}</b>
          <span className="text-muted">
            {' '}
            · {t(plan.feasibility.village.name, plan.feasibility.village.nameHi)} · {t('Plan', 'योजना')} {plan.id}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {narration && <ReadAloud text={narration} lang={lang} label={t('Hear this plan', 'योजना सुनें')} />}
          <LangToggle className="scale-90" />
        </div>
      </header>

      <div id="main" className="flex-1 gap-4 p-3 lg:grid lg:min-h-0 lg:grid-cols-[380px_minmax(0,1fr)] lg:p-3 xl:grid-cols-[400px_minmax(0,1fr)]">
        <VerdictPanel plan={plan} />

        <section className="mt-3 flex flex-col overflow-hidden rounded-3xl border border-line bg-paper lg:mt-0 lg:min-h-0">
          <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-line bg-white px-3 [scrollbar-width:none]" role="tablist" aria-label={t('Plan sections', 'योजना के हिस्से')}>
            {TABS.map((x) => (
              <button
                key={x.k}
                role="tab"
                aria-selected={tab === x.k}
                onClick={() => setTab(x.k)}
                className={clsx('relative inline-flex shrink-0 items-center gap-1.5 px-3.5 py-2.5 text-[15px] font-bold transition-colors', tab === x.k ? 'text-indigo' : 'text-muted hover:text-ink')}
              >
                <x.icon className="size-4" aria-hidden />
                {t(x.en, x.hi)}
                {tab === x.k && <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-t bg-marigold" />}
              </button>
            ))}
          </nav>
          <div key={tab} className="rise flex-1 px-4 pt-3 pb-2 lg:min-h-0 lg:overflow-y-auto lg:px-5">
            {tab === 'market' && <MarketTab plan={plan} />}
            {tab === 'money' && <MoneyTab plan={plan} caseId={c.id} />}
            {tab === 'risks' && <RisksTab plan={plan} />}
            {tab === 'alts' && <AltTab c={c} />}
            {tab === 'next' && <NextTab plan={plan} />}
          </div>
        </section>
      </div>
    </div>
  )
}
