/** Arch (jharokha) photo frame: round top, soft bottom corners. */
export function Arch({ src, alt, className, eager }: { src: string; alt: string; className?: string; eager?: boolean }) {
  return (
    <div className={`overflow-hidden rounded-t-[999px] rounded-b-[28px] border-[5px] border-white bg-khadi shadow-[0_24px_50px_-24px_rgba(28,37,102,0.55)] ${className ?? ''}`}>
      <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} className="size-full object-cover" />
    </div>
  )
}
