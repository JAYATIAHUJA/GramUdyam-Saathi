import { clsx } from 'clsx'
import { ClipboardList, Map as MapIcon, Search } from 'lucide-react'
import { useT } from '../../lib/store'
import { DeskView, VerdictFilter } from './types'

export function DeskToolbar({ view, setView, q, setQ, vf, setVf, count }: { view: DeskView; setView: (v: DeskView) => void; q: string; setQ: (s: string) => void; vf: VerdictFilter; setVf: (v: VerdictFilter) => void; count: (v: VerdictFilter) => number }) {
  const t = useT()
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-line px-3 py-2">
      <div className="inline-flex rounded-full bg-khadi p-1 text-[14px] font-bold" role="tablist">
        <button role="tab" aria-selected={view === 'queue'} onClick={() => setView('queue')} className={clsx('inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5', view === 'queue' ? 'bg-indigo text-white' : 'text-muted hover:text-ink')}>
          <ClipboardList className="size-4" /> {t('Case queue', 'केस कतार')}
        </button>
        <button role="tab" aria-selected={view === 'map'} onClick={() => setView('map')} className={clsx('inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5', view === 'map' ? 'bg-indigo text-white' : 'text-muted hover:text-ink')}>
          <MapIcon className="size-4" /> {t('District gaps', 'ज़िले में कमी / भीड़')}
        </button>
      </div>
      {view === 'queue' && (
        <>
          <label className="flex w-full min-w-[180px] flex-1 items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 sm:w-auto">
            <Search className="size-4 text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Search name, village, business', 'नाम, गाँव, काम खोजें')} className="flex-1 bg-transparent text-[14px] outline-none" />
          </label>
          {(['all', 'go', 'caution', 'rethink'] as const).map((v) => (
            <button key={v} onClick={() => setVf(v)} className={clsx('inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold', vf === v ? 'bg-indigo-deep text-white' : 'bg-khadi text-muted hover:text-ink')}>
              {v === 'all' ? t('All', 'सभी') : v === 'go' ? t('Good', 'अच्छा') : v === 'caution' ? t('Careful', 'सोच के') : t('Rethink', 'दोबारा सोचें')}
              <span className={clsx('rounded-full px-1.5 text-[11.5px]', vf === v ? 'bg-white/20' : 'bg-white')}>{count(v)}</span>
            </button>
          ))}
        </>
      )}
    </div>
  )
}
