import { clsx } from 'clsx'
import { IndianRupee } from 'lucide-react'
import type { ReactNode } from 'react'

export function Group({ n, title, children, cols = 'xl:grid-cols-3' }: { n: number; title: string; children: ReactNode; cols?: string }) {
  return (
    <fieldset>
      <legend className="mb-2 flex items-center gap-2 font-display text-[17px] font-bold text-indigo-deep">
        <span className="num grid size-6 place-items-center rounded-full bg-marigold text-[13px] text-indigo-deep">{n}</span>
        {title}
      </legend>
      <div className={clsx('grid gap-x-4 gap-y-2.5 sm:grid-cols-2', cols)}>{children}</div>
    </fieldset>
  )
}

export function F({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={clsx('block', wide && 'sm:col-span-2')}>
      <span className="mb-1 block text-[13px] font-semibold text-muted">{label}</span>
      {children}
    </label>
  )
}

export function Rupee({ value, onChange, step }: { value: number; onChange: (n: number) => void; step: number }) {
  return (
    <span className="flex items-center rounded-[10px] border border-line bg-white focus-within:outline-2 focus-within:outline-indigo">
      <IndianRupee className="ml-2.5 size-4 text-muted" />
      <input type="number" value={value} onChange={(e) => onChange(+e.target.value)} step={step} className="num w-full bg-transparent px-2 py-2 text-[15px] outline-none" />
    </span>
  )
}

export function Seg<V extends string | number>({ value, onChange, opts }: { value: V; onChange: (v: V) => void; opts: [V, string][] }) {
  return (
    <div className="flex rounded-[10px] border border-line bg-white p-0.5" role="radiogroup">
      {opts.map(([v, l]) => (
        <button key={String(v)} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)} className={clsx('flex-1 rounded-lg px-2 py-1.5 text-[13.5px] font-semibold transition-colors', value === v ? 'bg-indigo text-white' : 'text-muted hover:text-ink')}>
          {l}
        </button>
      ))}
    </div>
  )
}
