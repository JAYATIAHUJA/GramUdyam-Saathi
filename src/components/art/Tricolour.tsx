import { clsx } from 'clsx'

/** Small tricolour ribbon used on the government strip and in dividers. */
export function Tricolour({ className }: { className?: string }) {
  return (
    <div className={clsx('flex h-1 w-full', className)} aria-hidden>
      <span className="flex-1 bg-[#FF9933]" />
      <span className="flex-1 bg-white" />
      <span className="flex-1 bg-[#138808]" />
    </div>
  )
}
