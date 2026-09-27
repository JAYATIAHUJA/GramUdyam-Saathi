import { clsx } from 'clsx'
import { ClipboardList, Map as MapIcon, Search } from 'lucide-react'
import { VERDICT } from '../../components/ui'
import { useT } from '../../lib/store'
import { DeskView, VerdictFilter } from './types'

export function DeskToolbar({ view, setView, q, setQ, vf, setVf, count }: { view: DeskView; setView: (v: DeskView) => void; q: string; setQ: (s: string) => void; vf: VerdictFilter; setVf: (v: VerdictFilter) => void; count: (v: VerdictFilter) => number }) {
  const t = useT()
  const label = (v: VerdictFilter) => (v === 'all' ? t('All', 'सभी') : v === 'go' ? t('Good', 'अच्छा') : v === 'caution' ? t('Careful', 'सोच के') : t('Rethink', 'दोबारा सोचें'))
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-line px-3 py-2">
      <div className="inline-flex rounded-lg bg-khadi p-0.5 text-[13px] font-bold" role="tablist">
        <button role="tab" aria-selected={view === 'queue'} onClick={() => setView('queue')} className={clsx('inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors', view === 'queue' ? 'bg-white text-indigo-deep shadow-sm' : 'text-muted hover:text-ink')}>
          <ClipboardList className="size-4" /> {t('Cases', 'केस')}
        </button>
        <button role="tab" aria-selected={view === 'map'} onClick={() => setView('map')} className={clsx('inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors', view === 'map' ? 'bg-white text-indigo-deep shadow-sm' : 'text-muted hover:text-ink')}>
          <MapIcon className="size-4" /> {t('District map', 'ज़िले का नक़्शा')}
        </button>
      </div>
      {view === 'queue' && (
        <>
          <label className="flex h-9 w-full min-w-[180px] flex-1 items-center gap-2 rounded-lg border border-line bg-paper px-3 focus-within:border-indigo/50 focus-within:bg-white sm:w-auto">
            <Search className="size-4 text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Search name, village, business', 'नाम, गाँव, काम खोजें')} className="flex-1 bg-transparent text-[13.5px] outline-none" />
          </label>
          <div className="flex gap-1" role="group" aria-label={t('Filter by verdict', 'फ़ैसले से छाँटें')}>
            {(['all', 'go', 'caution', 'rethink'] as const).map((v) => (
              <button key={v} onClick={() => setVf(v)} aria-pressed={vf === v} className={clsx('inline-flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-[13px] font-semibold transition-colors', vf === v ? 'border-indigo-deep bg-indigo-deep text-white' : 'border-line bg-white text-ink/75 hover:border-indigo/40')}>
                {v !== 'all' && <span className="size-2 rounded-full" style={{ background: VERDICT[v].color }} />}
                {label(v)}
                <span className={clsx('num text-[12px]', vf === v ? 'text-white/70' : 'text-muted')}>{count(v)}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
