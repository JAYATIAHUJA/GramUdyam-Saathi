export function SectionHead({ title, sub, align = 'center' }: { title: string; sub?: string; align?: 'center' | 'left' }) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : ''}>
      <h2 className="font-display text-[30px] leading-tight font-bold text-indigo-deep sm:text-[40px]">{title}</h2>
      {sub && <p className="mt-3 text-[16.5px] leading-relaxed text-ink/70">{sub}</p>}
    </div>
  )
}
