import { clsx } from 'clsx'
import { ArrowRight, FileText, Flag, MessageSquare, X } from 'lucide-react'
import { useState } from 'react'
import { ActivityArt } from '../../components/art'
import { VERDICT, VerdictTag } from '../../components/ui'
import type { Plan } from '../../engine/plan'
import { dscr, inr, lakh, pct } from '../../lib/format'
import { type SavedCase, useApp, useT } from '../../lib/store'
import { DecisionBar } from './DecisionBar'
import { EvidenceList } from './EvidenceList'
import { RemarksPanel } from './RemarksPanel'
import { WhyList } from './WhyList'

export function CaseDetail({ c, p, onClose }: { c: SavedCase; p: Plan; onClose: () => void }) {
  const t = useT()
  const addCase = useApp((s) => s.addCase)
  const [tab, setTab] = useState<'why' | 'evidence' | 'remarks'>('why')
  const update = (patch: Partial<SavedCase>) => addCase({ ...c, ...patch })
  const r = p.recommended
  return (
    <aside className="card flex flex-col overflow-hidden max-lg:fixed max-lg:inset-0 max-lg:z-50 max-lg:rounded-none max-lg:border-0 lg:min-h-0" role="dialog" aria-label={c.input.name}>
      <div className="h-1 shrink-0" style={{ background: VERDICT[p.verdict].color }} aria-hidden />
      <div className="flex shrink-0 items-start gap-3 border-b border-line px-4 py-3">
        <ActivityArt code={p.feasibility.activity.code} className="size-11 rounded-xl" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="truncate font-display text-[19px] leading-tight font-bold">{c.input.name}</div>
          </div>
          <div className="truncate text-[12.5px] text-muted">
            {t(p.feasibility.activity.name.en, p.feasibility.activity.name.hi)} · {t(p.feasibility.village.name, p.feasibility.village.nameHi)}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11.5px]">
            <VerdictTag v={p.verdict} />
            <span className="text-line">|</span>
            <span className="num rounded bg-khadi px-1.5 py-0.5 font-semibold text-ink/70">{c.id}</span>
            <span className="rounded bg-khadi px-1.5 py-0.5 font-semibold text-ink/70">{c.input.category}</span>
            <span className="rounded bg-khadi px-1.5 py-0.5 font-semibold text-ink/70">
              {t('income', 'आय')} <span className="num">{lakh(c.input.familyIncome)}</span>
            </span>
          </div>
        </div>
        <button onClick={onClose} className="grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-khadi hover:text-ink" aria-label={t('Close', 'बंद करें')}>
          <X className="size-4.5" />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 lg:min-h-0">
        <div className="flex items-stretch overflow-hidden rounded-xl border border-line">
          <div className="min-w-0 flex-1 bg-khadi/60 px-3 py-2.5">
            <div className="text-[11.5px] font-semibold text-muted">{t('Asked', 'माँगा')}</div>
            <div className={clsx('num text-[19px] leading-tight font-bold text-ink/60', r.loan < p.chosen.loan && 'line-through decoration-1')}>{inr(p.chosen.loan)}</div>
            <div className="truncate text-[11.5px] text-muted">{t(p.chosen.unit.size.label.en, p.chosen.unit.size.label.hi)}</div>
          </div>
          <div className="grid w-8 shrink-0 place-items-center bg-white text-muted">
            <ArrowRight className="size-4" />
          </div>
          <div className="min-w-0 flex-1 bg-go-soft px-3 py-2.5">
            <div className="flex items-center justify-between gap-1 text-[11.5px] font-semibold text-go">
              {t('Advised', 'सुझाया')}
              {r.loan < p.chosen.loan && <span className="num rounded bg-go px-1 text-[10.5px] text-white">−{Math.round((1 - r.loan / p.chosen.loan) * 100)}%</span>}
            </div>
            <div className="num text-[19px] leading-tight font-extrabold text-go">{inr(r.loan)}</div>
            <div className="truncate text-[11.5px] text-muted">{t(r.unit.size.label.en, r.unit.size.label.hi)}</div>
          </div>
        </div>

        <dl className="grid grid-cols-4 divide-x divide-line rounded-xl border border-line text-center">
          <Mini v={dscr(r.projection?.minDscr)} l="DSCR" bad={(r.projection?.minDscr ?? 0) < 1.5} />
          <Mini v={r.mc ? pct(r.mc.pDefault) : '-'} l={t('Risk', 'जोखिम')} bad={(r.mc?.pDefault ?? 0) >= 0.15} />
          <Mini v={String(p.fit.score)} l={t('Fit', 'फ़िट')} bad={p.fit.score < 65} />
          <Mini v={p.feasibility.saturation.index.toFixed(2) + '×'} l={t('Crowding', 'भीड़')} bad={p.feasibility.saturation.index > 1} />
        </dl>

        <div className="flex gap-1 border-b border-line text-[13px] font-bold">
          {(
            [
              ['why', t('Why', 'क्यों'), Flag],
              ['evidence', t('Evidence', 'सबूत'), FileText],
              ['remarks', t(`Remarks (${c.remarks.length})`, `टिप्पणी (${c.remarks.length})`), MessageSquare],
            ] as const
          ).map(([k, l, Icon]) => (
            <button key={k} onClick={() => setTab(k)} className={clsx('relative inline-flex items-center gap-1.5 px-2.5 py-2', tab === k ? 'text-indigo' : 'text-muted hover:text-ink')}>
              <Icon className="size-3.5" /> {l}
              {tab === k && <span className="absolute inset-x-1 bottom-0 h-[3px] rounded-t bg-marigold" />}
            </button>
          ))}
        </div>

        {tab === 'why' && <WhyList p={p} />}

        {tab === 'evidence' && <EvidenceList p={p} />}

        {tab === 'remarks' && <RemarksPanel c={c} onAdd={(text) => update({ remarks: [...c.remarks, { by: 'A. Srivastava (SCA)', at: new Date().toISOString(), text }] })} />}
      </div>

      <DecisionBar c={c} onStatus={(status) => update({ status })} />
    </aside>
  )
}

function Mini({ v, l, bad }: { v: string; l: string; bad?: boolean }) {
  return (
    <div className="px-1 py-2">
      <dd className={clsx('num text-[15px] leading-tight font-bold', bad ? 'text-caution' : 'text-ink')}>{v}</dd>
      <dt className="text-[11px] text-muted">{l}</dt>
    </div>
  )
}
