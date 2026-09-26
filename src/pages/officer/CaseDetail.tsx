import { clsx } from 'clsx'
import { FileText, Flag, MessageSquare, X } from 'lucide-react'
import { useState } from 'react'
import { ActivityArt } from '../../components/art'
import { VerdictStamp } from '../../components/ui'
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
      <div className="flex shrink-0 items-start gap-3 border-b border-line p-3.5">
        <ActivityArt code={p.feasibility.activity.code} className="size-12" />
        <div className="min-w-0 flex-1">
          <div className="font-display text-[21px] leading-tight font-bold">{c.input.name}</div>
          <div className="truncate text-[13px] text-muted">
            {t(p.feasibility.activity.name.en, p.feasibility.activity.name.hi)}, {t(p.feasibility.village.name, p.feasibility.village.nameHi)}
          </div>
          <div className="text-[12px] text-muted">
            {c.id} · {c.input.category} · {t('income', 'आय')} {lakh(c.input.familyIncome)}
          </div>
        </div>
        <button onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-khadi" aria-label={t('Close', 'बंद करें')}>
          <X className="size-5" />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-3.5 lg:min-h-0">
        <div className="flex items-center gap-3">
          <div className="grid flex-1 grid-cols-2 gap-2">
            <div className="rounded-xl bg-khadi p-2.5">
              <div className="text-[12px] text-muted">{t('Asked', 'माँगा')}</div>
              <div className="num text-[20px] font-bold text-ink/70">{inr(p.chosen.loan)}</div>
              <div className="text-[11.5px] text-muted">{t(p.chosen.unit.size.label.en, p.chosen.unit.size.label.hi)}</div>
            </div>
            <div className="rounded-xl bg-go-soft p-2.5">
              <div className="text-[12px] text-go">{t('Advised', 'सुझाया')}</div>
              <div className="num text-[20px] font-bold text-go">{inr(r.loan)}</div>
              <div className="text-[11.5px] text-muted">{t(r.unit.size.label.en, r.unit.size.label.hi)}</div>
            </div>
          </div>
          <div className="origin-right scale-[0.85]">
            <VerdictStamp v={p.verdict} size="sm" animate={false} />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-center text-[11px] text-muted">
          <Mini v={dscr(r.projection?.minDscr)} l="DSCR" />
          <Mini v={r.mc ? pct(r.mc.pDefault) : '-'} l={t('Risk', 'जोखिम')} />
          <Mini v={String(p.fit.score)} l={t('Fit', 'फ़िट')} />
          <Mini v={p.feasibility.saturation.index.toFixed(2) + '×'} l={t('Crowding', 'भीड़')} />
        </div>

        <div className="flex gap-1 border-b border-line text-[13.5px] font-bold">
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

function Mini({ v, l }: { v: string; l: string }) {
  return (
    <div className="rounded-lg bg-khadi px-1 py-1.5">
      <div className="num text-[16px] font-bold text-ink">{v}</div>
      {l}
    </div>
  )
}
