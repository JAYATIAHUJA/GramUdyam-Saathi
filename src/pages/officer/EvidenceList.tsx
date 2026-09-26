import { ConfidenceBadge } from '../../components/ui'
import type { Plan } from '../../engine/plan'
import { useT } from '../../lib/store'

export function EvidenceList({ p }: { p: Plan }) {
  const t = useT()
  const r = p.recommended
  return (
    <div>
      {p.feasibility.facts.slice(0, 8).map((f) => (
        <div key={f.id} className="flex items-center justify-between gap-2 border-b border-line py-1.5 text-[13px] last:border-0">
          <span className="text-muted">{t(f.label.en, f.label.hi)}</span>
          <span className="flex shrink-0 items-center gap-2">
            <b className="num">{f.display}</b>
            <ConfidenceBadge c={f.confidence} />
          </span>
        </div>
      ))}
      <p className="mt-2 rounded-lg bg-indigo-soft/60 px-3 py-2 text-[12px]">
        {t('Rule', 'नियम')} <b>{r.route.rule?.id ?? '-'}</b> ({p.ruleVersion}), {t('data', 'डेटा')} <b>{p.dataVersion}</b>. {t('Re-running gives the same numbers.', 'दोबारा चलाने पर वही संख्याएँ।')}
      </p>
    </div>
  )
}
