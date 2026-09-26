import { clsx } from 'clsx'
import type { ReactNode } from 'react'

/** Phones: one compact row (icon, words, number). Wider screens: a tall card. */
export function NumCard({ icon, label, value, sub, strong, warm }: { icon: ReactNode; label: string; value: string; sub: string; strong?: boolean; warm?: boolean }) {
  return (
    <div className={clsx('card grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3.5 py-2.5 sm:flex sm:flex-col sm:items-stretch sm:gap-0 sm:p-4', warm && 'bg-marigold-soft')}>
      <div className="sm:flex sm:items-center sm:gap-2">
        {icon}
        <span className="hidden text-[14px] font-semibold text-muted sm:inline">{label}</span>
      </div>
      <div className="min-w-0 sm:hidden">
        <div className="text-[14px] leading-tight font-semibold text-ink/80">{label}</div>
        <div className="truncate text-[12.5px] text-muted">{sub}</div>
      </div>
      <div className={clsx('num text-right text-[24px] leading-none font-extrabold sm:mt-2 sm:text-left sm:text-[32px]', strong ? 'text-indigo-deep' : 'text-ink')}>{value}</div>
      <div className={clsx('mt-1.5 hidden text-[14px] sm:block', warm ? 'text-[#7a5500]' : 'text-ink/75')}>{sub}</div>
    </div>
  )
}
