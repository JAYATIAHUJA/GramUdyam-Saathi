import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import { Didi } from './Didi'

/** A speech bubble that comes from Didi. */
export function Bubble({ children, className, tail = 'left' }: { children: ReactNode; className?: string; tail?: 'left' | 'bottom' }) {
  return (
    <div className={clsx('relative rounded-2xl border border-line bg-white px-4 py-3 shadow-[0_8px_24px_-14px_rgba(28,37,102,0.35)]', className)}>
      {children}
      <span
        aria-hidden
        className={clsx(
          'absolute size-3.5 rotate-45 border-line bg-white',
          tail === 'left' ? 'top-5 -left-[8px] border-b border-l' : '-bottom-[8px] left-8 border-r border-b',
        )}
      />
    </div>
  )
}

/* ---------------- Business illustrations ---------------- */
