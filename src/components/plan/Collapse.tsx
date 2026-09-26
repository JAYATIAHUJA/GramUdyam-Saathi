import { clsx } from 'clsx'
import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

export function Collapse({ open, toggle, title, children }: { open: boolean; toggle: () => void; title: string; children: ReactNode }) {
  return (
    <div className="card mb-3 break-inside-avoid">
      <button onClick={toggle} className="flex w-full items-center justify-between px-4 py-3 text-left text-[15px] font-bold" aria-expanded={open}>
        {title}
        <ChevronDown className={clsx('size-5 transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="border-t border-line px-3 py-3">{children}</div>}
    </div>
  )
}
