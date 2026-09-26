import { clsx } from 'clsx'
import type { ReactNode } from 'react'

export function Section({ title, children, aside, className }: { title: ReactNode; children: ReactNode; aside?: ReactNode; className?: string }) {
  return (
    <section className={clsx('mb-4 break-inside-avoid', className)}>
      <div className="mb-2 flex items-end justify-between gap-2">
        <h2 className="font-display text-[18px] font-bold leading-tight text-indigo-deep">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  )
}
