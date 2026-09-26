import { clsx } from 'clsx'
import { ClipboardList, Inbox, TrendingDown, TriangleAlert, UserCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { lakh } from '../../lib/format'
import { useT } from '../../lib/store'
import { Row } from './types'

/** Five headline numbers across all cases in the district. */
export function KpiRow({ rows }: { rows: Row[] }) {
  const t = useT()
  const asked = rows.reduce((s, r) => s + r.p.chosen.loan, 0)
  const rec = rows.reduce((s, r) => s + r.p.recommended.loan, 0)
  const flagged = rows.filter((r) => r.p.verdict !== 'go').length
  const avgFit = Math.round(rows.reduce((s, r) => s + r.p.fit.score, 0) / Math.max(1, rows.length))
  const waiting = rows.filter((r) => r.c.status === 'draft').length
  return (
    <div className="-mx-3 flex shrink-0 gap-2.5 overflow-x-auto px-3 pb-1 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0 md:pb-0 [&>*]:w-[230px] [&>*]:shrink-0 md:[&>*]:w-auto">
      <Kpi icon={<Inbox className="size-5" />} tint="bg-indigo-soft text-indigo" label={t('Waiting for you', 'आपकी समीक्षा बाक़ी')} value={String(waiting)} sub={t(`of ${rows.length} cases`, `${rows.length} केस में से`)} />
      <Kpi icon={<ClipboardList className="size-5" />} tint="bg-khadi text-ink" label={t('Loan asked', 'माँगा गया लोन')} value={lakh(asked)} sub={t('by all applicants', 'सभी आवेदकों ने')} />
      <Kpi icon={<TrendingDown className="size-5" />} tint="bg-go-soft text-go" label={t('Saathi advises', 'साथी की सलाह')} value={lakh(rec)} sub={t(`${lakh(asked - rec)} less debt`, `${lakh(asked - rec)} कम क़र्ज़`)} tone="go" />
      <Kpi icon={<TriangleAlert className="size-5" />} tint="bg-caution-soft text-caution" label={t('Need a closer look', 'ध्यान से देखें')} value={String(flagged)} sub={t('caution or rethink', 'सावधानी या दोबारा सोचें')} tone="caution" />
      <Kpi icon={<UserCheck className="size-5" />} tint="bg-marigold-soft text-[#7a5500]" label={t('Avg right-fit score', 'औसत फ़िट स्कोर')} value={`${avgFit}`} sub={t('out of 100', '100 में से')} />
    </div>
  )
}

function Kpi({ icon, tint, label, value, sub, tone }: { icon: ReactNode; tint: string; label: string; value: string; sub: string; tone?: 'go' | 'caution' }) {
  return (
    <div className="card flex items-center gap-3 px-3.5 py-3">
      <span className={clsx('grid size-10 shrink-0 place-items-center rounded-xl', tint)}>{icon}</span>
      <div className="min-w-0">
        <div className="truncate text-[12.5px] font-semibold text-muted">{label}</div>
        <div className={clsx('num text-[24px] leading-tight font-bold', tone === 'go' && 'text-go', tone === 'caution' && 'text-caution')}>{value}</div>
        <div className="truncate text-[12px] text-muted">{sub}</div>
      </div>
    </div>
  )
}
