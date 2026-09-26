import { ActivityArt } from '../../../components/art'
import { ACTIVITIES } from '../../../data/activities'
import { useT } from '../../../lib/store'

export function TradesMarquee() {
  const t = useT()
  return (
    <section className="overflow-hidden border-y border-indigo-deep bg-indigo-deep py-3 text-white" aria-label={t('Kinds of work', 'कामों के प्रकार')}>
      <div className="marquee flex w-max gap-3">
        {[...ACTIVITIES, ...ACTIVITIES].map((a, i) => (
          <span key={i} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white/10 py-1 pr-4 pl-1 text-[15px] font-semibold" aria-hidden={i >= ACTIVITIES.length}>
            <ActivityArt code={a.code} className="size-8 rounded-full" />
            {t(a.name.en, a.name.hi)}
          </span>
        ))}
      </div>
    </section>
  )
}
