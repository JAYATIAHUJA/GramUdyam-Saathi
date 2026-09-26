import { Link } from 'react-router-dom'
import { ActivityArt } from '../../../components/art'
import { ACTIVITIES } from '../../../data/activities'
import { useT } from '../../../lib/store'
import { SectionHead } from '../SectionHead'
import { useSunita } from '../useSunita'

export function WorkBento() {
  const t = useT()
  const sunita = useSunita()
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
      <SectionHead title={t('Plans for work people do in villages', 'गाँव के कामों की योजना')} sub={t('Not sure which one? Saathi can suggest the best work for your village.', 'पक्का नहीं? साथी आपके गाँव के हिसाब से काम सुझा सकती है।')} />
      <div className="mt-10 grid grid-cols-2 gap-3 md:h-[520px] md:grid-cols-4 md:grid-rows-2">
        {[
          { src: '/photos/cow.webp', code: 'dairy', cls: 'col-span-2 aspect-[4/3] md:row-span-2 md:aspect-auto' },
          { src: '/photos/tailor.webp', code: 'tailoring', cls: 'aspect-[4/5] md:aspect-auto' },
          { src: '/photos/veg-seller.webp', code: 'kirana', cls: 'aspect-[4/5] md:aspect-auto' },
        ].map((x) => {
          const a = ACTIVITIES.find((y) => y.code === x.code)!
          return (
            <Link key={x.code} to="/saathi" className={`group relative overflow-hidden rounded-3xl ${x.cls}`}>
              <img src={x.src} alt={t(a.name.en, a.name.hi)} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-t from-indigo-deep/80 via-transparent to-transparent" aria-hidden />
              <span className="absolute bottom-3 left-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-full bg-white py-1 pr-3.5 pl-1 text-[14.5px] font-bold">
                <ActivityArt code={a.code} className="size-8 shrink-0 rounded-full" /> <span className="truncate">{t(a.name.en, a.name.hi)}</span>
              </span>
            </Link>
          )
        })}
        <div className="col-span-2 grid grid-cols-3 content-center gap-2 rounded-3xl bg-white p-3 shadow-sm">
          {ACTIVITIES.filter((a) => !['dairy', 'tailoring', 'kirana'].includes(a.code)).map((a) => (
            <Link key={a.code} to="/saathi" className="flex flex-col items-center gap-1 rounded-2xl p-1.5 text-center transition-colors hover:bg-khadi">
              <ActivityArt code={a.code} className="aspect-square w-full max-w-[60px]" />
              <span className="text-[12.5px] leading-tight font-semibold">{t(a.name.en, a.name.hi).split(' (')[0]}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
