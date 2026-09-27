import { clsx } from 'clsx'
import { IndianRupee } from 'lucide-react'
import type { ReactNode } from 'react'

/** One numbered section of the form. Every section uses the same grid so fields line up. */
export function Group({ n, title, hint, children, cols = 'xl:grid-cols-3' }: { n: number; title: string; hint?: string; children: ReactNode; cols?: string }) {
  return (
    <fieldset className="border-t border-line pt-4 first:border-t-0 first:pt-1">
      <legend className="contents">
        <span className="mb-3 flex items-baseline gap-2">
          <span className="num grid size-6 shrink-0 translate-y-0.5 place-items-center rounded-full bg-marigold text-[13px] font-bold text-indigo-deep">{n}</span>
          <span className="font-display text-[17px] font-bold text-indigo-deep">{title}</span>
          {hint && <span className="truncate text-[12.5px] text-muted">{hint}</span>}
        </span>
      </legend>
      <div className={clsx('grid gap-x-4 gap-y-3.5 sm:grid-cols-2', cols)}>{children}</div>
    </fieldset>
  )
}

/** Short label on top, optional one-line hint underneath. Labels never wrap, so rows stay aligned. */
export function F({ label, hint, children, wide }: { label: string; hint?: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={clsx('block min-w-0', wide && 'sm:col-span-2')}>
      <span className="mb-1.5 block truncate text-[13px] font-semibold text-ink/80">{label}</span>
      {children}
      {hint && <span className="mt-1 block truncate text-[12px] text-muted">{hint}</span>}
    </label>
  )
}

/** `blank` shows an empty box (with a placeholder) until the helper types an amount. */
export function Rupee({ value, onChange, step, blank, placeholder }: { value: number; onChange: (n: number) => void; step: number; blank?: boolean; placeholder?: string }) {
  return (
    <span className="flex h-11 items-center rounded-[10px] border border-line bg-white focus-within:outline-2 focus-within:outline-indigo">
      <IndianRupee className="ml-2.5 size-4 shrink-0 text-muted" />
      <input type="number" inputMode="numeric" min={0} value={blank ? '' : value} placeholder={placeholder} onChange={(e) => onChange(+e.target.value)} step={step} className="num w-full bg-transparent px-2 text-[15px] outline-none placeholder:text-muted/60" />
    </span>
  )
}

/** `value` undefined means not answered yet: no option is highlighted. */
export function Seg<V extends string | number>({ value, onChange, opts }: { value: V | undefined; onChange: (v: V) => void; opts: [V, string][] }) {
  return (
    <div className="flex h-11 rounded-[10px] border border-line bg-white p-0.5" role="radiogroup">
      {opts.map(([v, l]) => (
        <button key={String(v)} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)} className={clsx('min-w-0 flex-1 truncate rounded-lg px-2 text-[13.5px] font-semibold whitespace-nowrap transition-colors', value === v ? 'bg-indigo text-white' : 'text-muted hover:bg-khadi hover:text-ink')}>
          {l}
        </button>
      ))}
    </div>
  )
}
