import { clsx } from 'clsx'
import { Check } from 'lucide-react'
import { useT } from '../../../lib/store'
import { Opt } from '../questions'

const TINTS = ['bg-marigold-soft text-[#7a5500]', 'bg-indigo-soft text-indigo', 'bg-go-soft text-go', 'bg-saffron-soft text-saffron']

export function Options<T>({ opts, value, onPick, grid }: { opts: Opt<T>[]; value?: T; onPick: (v: T) => void; grid?: boolean }) {
  const t = useT()
  return (
    <div className={grid ? 'grid grid-cols-2 gap-3' : 'space-y-2.5'}>
      {opts.map((o, i) => (
        <button
          key={String(o.v)}
          onClick={() => onPick(o.v)}
          className={clsx(
            'card flex w-full items-center gap-4 px-3.5 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-indigo/50 hover:shadow-md active:scale-[0.99]',
            grid && 'flex-col items-start',
            value === o.v && 'border-indigo bg-indigo-soft/40 ring-2 ring-indigo/30',
          )}
        >
          <span className={clsx('grid size-12 shrink-0 place-items-center rounded-xl', TINTS[i % TINTS.length])} aria-hidden>
            <o.icon className="size-6" />
          </span>
          <span className="flex-1 text-[18px] font-semibold">{t(o.en, o.hi)}</span>
          <span className={clsx('grid size-6 shrink-0 place-items-center rounded-full border-2', value === o.v ? 'border-indigo bg-indigo text-white' : 'border-line')}>{value === o.v && <Check className="size-4" strokeWidth={3} />}</span>
        </button>
      ))}
    </div>
  )
}
