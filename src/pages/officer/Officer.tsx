import { clsx } from 'clsx'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { TopNav } from '../../components/site'
import { planFor, useAllCases } from '../../lib/plans'
import { useT } from '../../lib/store'
import { CaseDetail } from './CaseDetail'
import { CaseList } from './CaseList'
import { DeskHeader } from './DeskHeader'
import { DeskToolbar } from './DeskToolbar'
import { Heatmap } from './Heatmap'
import { DeskView, VerdictFilter } from './types'

export default function Officer() {
  const { id } = useParams()
  const nav = useNavigate()
  const t = useT()
  const cases = useAllCases()
  const [view, setView] = useState<DeskView>('queue')
  const [vf, setVf] = useState<VerdictFilter>('all')
  const [q, setQ] = useState('')
  const rows = useMemo(() => cases.map((c) => ({ c, p: planFor(c, false) })), [cases])
  const filtered = rows.filter(({ c, p }) => (vf === 'all' || p.verdict === vf) && (!q || (c.input.name + p.feasibility.village.name + p.feasibility.village.nameHi + p.feasibility.activity.name.en + p.feasibility.activity.name.hi).toLowerCase().includes(q.toLowerCase())))
  const selected = rows.find((r) => r.c.id === id)
  const count = (v: VerdictFilter) => (v === 'all' ? rows.length : rows.filter((r) => r.p.verdict === v).length)

  return (
    // From lg up: one screen. KPIs on top, the queue (or map) below, the open case on the right.
    <div className="flex min-h-dvh flex-col bg-khadi/60 lg:h-dvh lg:overflow-hidden">
      <TopNav />
      <div id="main" className="mx-auto flex w-full max-w-[1500px] min-w-0 flex-1 flex-col gap-3 p-3 lg:min-h-0">
        <DeskHeader rows={rows} />

        {id && !selected && (
          <div role="alert" className="card flex flex-wrap items-center justify-between gap-3 border-caution/40 bg-caution-soft px-4 py-3">
            <div className="flex min-w-0 items-start gap-2.5">
              <SearchX className="mt-0.5 size-5 shrink-0 text-caution" aria-hidden />
              <div className="min-w-0">
                <div className="font-bold text-ink">{t(`Case ${id} is not on this device`, `केस ${id} इस डिवाइस पर नहीं है`)}</div>
                <p className="text-[13px] text-muted">{t('Cases are saved in the browser where they were made. Open this link on that device, or pick a case below.', 'केस उसी ब्राउज़र में सेव होते हैं जहाँ बने थे। वही डिवाइस खोलें, या नीचे से कोई केस चुनें।')}</p>
              </div>
            </div>
            <button onClick={() => nav('/officer')} className="shrink-0 rounded-lg border border-line bg-white px-3 py-1.5 text-[13px] font-bold hover:border-indigo/40">
              {t('Show all cases', 'सभी केस देखें')}
            </button>
          </div>
        )}

        <div className={clsx('grid flex-1 grid-cols-1 gap-3 lg:min-h-0 [&>*]:min-w-0', selected && view === 'queue' && 'lg:grid-cols-[minmax(0,1fr)_480px]')}>
          <section className="card flex flex-col overflow-hidden lg:min-h-0">
            <DeskToolbar view={view} setView={setView} q={q} setQ={setQ} vf={vf} setVf={setVf} count={count} />

            {view === 'queue' ? (
              <CaseList rows={filtered} openId={id} compact={!!selected} />
            ) : (
              <Heatmap />
            )}
          </section>

          {selected && view === 'queue' && <CaseDetail c={selected.c} p={selected.p} onClose={() => nav('/officer')} />}
        </div>
      </div>
    </div>
  )
}
