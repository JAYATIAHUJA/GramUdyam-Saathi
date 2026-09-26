import { clsx } from 'clsx'
import { TriangleAlert } from 'lucide-react'
import type { Plan } from '../../engine/plan'
import { useT } from '../../lib/store'

/** Why the engine gave this verdict: its reasons, the top risks, then scheme flags. */
export function WhyList({ p }: { p: Plan }) {
  const t = useT()
  const r = p.recommended
  const flags = [...p.naive.route.flags, ...r.route.flags].filter((f, i, a) => a.findIndex((x) => x.code === f.code) === i)
  return (
    <ul className="space-y-1.5 text-[13.5px] leading-snug">
      {p.reasons.map((x, i) => (
        <li key={'r' + i} className="rounded-lg bg-khadi px-3 py-2">
          {t(x.en, x.hi)}
        </li>
      ))}
      {p.topRisks.map((x, i) => (
        <li key={'k' + i} className={clsx('flex gap-2 rounded-lg px-3 py-2', x.level === 'high' ? 'bg-risk-soft' : 'bg-caution-soft/70')}>
          <TriangleAlert className={clsx('mt-0.5 size-4 shrink-0', x.level === 'high' ? 'text-risk' : 'text-caution')} />
          {t(x.en, x.hi)}
        </li>
      ))}
      {flags.map((f) => (
        <li key={f.code} className="rounded-lg border border-line px-3 py-2">
          <b className="text-[11px] text-muted">{f.code}</b> {t(f.en, f.hi)}
        </li>
      ))}
    </ul>
  )
}
