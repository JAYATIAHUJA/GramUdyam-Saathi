import { clsx } from 'clsx'
import { Search, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { ActivityArt } from '../../components/art'
import { VerdictPill } from '../../components/ui'
import { VILLAGES } from '../../data/villages'
import type { PlanInput } from '../../engine/plan'
import { planFor, useAllCases } from '../../lib/plans'
import { useT } from '../../lib/store'
import { BLANK } from './blank'

/** Today's VLE queue: a searchable list on laptops, a sideways strip on phones. */
export function QueuePanel({ editing, onOpen }: { editing: string | null; onOpen: (input: PlanInput, id: string | null) => void }) {
  const t = useT()
  const queue = useAllCases().filter((c) => c.channel === 'vle')
  const [qq, setQq] = useState('')
  const shown = queue.filter((c) => !qq || (c.input.name + (VILLAGES.find((v) => v.lgd === c.input.lgd)?.name ?? '')).toLowerCase().includes(qq.toLowerCase()))
  return (
    <aside className="card flex flex-col p-3 lg:min-h-0">
      <button onClick={() => onOpen(BLANK, null)} className="btn-primary w-full rounded-xl! px-3 py-2.5 text-[15px]">
        <UserPlus className="size-4.5" /> {t('New applicant', 'नया आवेदक')}
      </button>
      <div className="mt-3 flex items-center justify-between px-1">
        <span className="text-[13px] font-bold text-ink">{t('Today’s queue', 'आज की कतार')}</span>
        <span className="rounded-full bg-khadi px-2 text-[12px] font-bold text-muted">{queue.length}</span>
      </div>
      <label className="mt-2 flex items-center gap-2 rounded-lg border border-line bg-paper px-2.5 py-1.5">
        <Search className="size-4 text-muted" />
        <input value={qq} onChange={(e) => setQq(e.target.value)} placeholder={t('Find by name or village', 'नाम या गाँव से खोजें')} className="w-full bg-transparent text-[13.5px] outline-none" />
      </label>
      <ul className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] lg:mx-0 lg:block lg:flex-1 lg:space-y-1 lg:overflow-x-visible lg:overflow-y-auto lg:px-0 lg:pb-0 lg:min-h-0">
        {shown.map((c) => (
          <li key={c.id} className="w-[260px] shrink-0 rounded-xl border border-line lg:w-auto lg:border-0">
            <button onClick={() => onOpen(c.input, c.id)} className={clsx('flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-khadi', editing === c.id && 'bg-indigo-soft ring-1 ring-indigo/30')}>
              <ActivityArt code={c.input.activity} className="size-9 rounded-lg" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold">{c.input.name}</span>
                <span className="block truncate text-[12px] text-muted">{t(VILLAGES.find((v) => v.lgd === c.input.lgd)?.name ?? '', VILLAGES.find((v) => v.lgd === c.input.lgd)?.nameHi ?? '')}</span>
              </span>
              <VerdictPill v={planFor(c, false).verdict} />
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
