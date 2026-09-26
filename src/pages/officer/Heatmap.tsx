import { useMemo, useState } from 'react'
import { ActivityArt } from '../../components/art'
import { ACTIVITIES } from '../../data/activities'
import { VILLAGES } from '../../data/villages'
import { competitorsIn } from '../../engine/feasibility'
import { useT } from '../../lib/store'

/** District saturation heatmap: units per 1,000 people vs district median, village × activity. */
export function Heatmap() {
  const t = useT()
  const [hover, setHover] = useState<{ v: string; a: string; x: number } | null>(null)
  const grid = useMemo(() => {
    const med: Record<string, number> = {}
    for (const a of ACTIVITIES) {
      const xs = VILLAGES.map((v) => competitorsIn(v, a).raw / v.pop2011).sort((x, y) => x - y)
      med[a.code] = xs[Math.floor(xs.length / 2)] || 1
    }
    return VILLAGES.map((v) => ({ v, cells: ACTIVITIES.map((a) => ({ a, x: competitorsIn(v, a).raw / v.pop2011 / med[a.code] })) }))
  }, [])
  // Diverging: gap (green) ← 1.0 neutral → crowded (red)
  const color = (x: number) => {
    if (x >= 1) {
      const k = Math.min(1, (x - 1) / 1)
      return `color-mix(in oklab, #efece6 ${Math.round((1 - k) * 100)}%, #B42318)`
    }
    const k = Math.min(1, (1 - x) / 0.8)
    return `color-mix(in oklab, #efece6 ${Math.round((1 - k) * 100)}%, #1B873F)`
  }
  return (
    <div className="flex flex-1 flex-col p-4 lg:min-h-0">
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-3">
        <p className="max-w-[70ch] text-[13.5px] text-muted">{t('Green = few such businesses here (a gap, steer new applicants here). Red = already crowded.', 'हरा = यहाँ ऐसे काम कम हैं (नए आवेदकों को यहाँ भेजें)। लाल = पहले से भीड़।')}</p>
        <div className="flex items-center gap-2 text-[12px] font-semibold text-muted">
          <span>{t('Gap', 'कमी')}</span>
          <span className="h-2.5 w-40 rounded-full" style={{ background: 'linear-gradient(90deg,#1B873F,#efece6,#B42318)' }} />
          <span>{t('Crowded', 'भीड़')}</span>
        </div>
      </div>
      <div className="mt-3 flex-1 overflow-auto lg:min-h-0">
        <table className="border-separate border-spacing-[2px] text-[12px]">
          <thead className="sticky top-0 z-10 bg-white">
            <tr>
              <th />
              {ACTIVITIES.map((a) => (
                <th key={a.code} className="px-1 pb-1 text-center font-semibold text-muted" title={t(a.name.en, a.name.hi)}>
                  <ActivityArt code={a.code} className="mx-auto mb-1 size-8 rounded-lg" />
                  <div className="w-16 truncate">{t(a.name.en, a.name.hi).split(' (')[0]}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map(({ v, cells }) => (
              <tr key={v.lgd}>
                <td className="pr-3 text-right font-semibold whitespace-nowrap">{t(v.name, v.nameHi)}</td>
                {cells.map(({ a, x }) => (
                  <td
                    key={a.code}
                    onMouseEnter={() => setHover({ v: t(v.name, v.nameHi), a: t(a.name.en, a.name.hi), x })}
                    onMouseLeave={() => setHover(null)}
                    className="h-7 w-16 rounded text-center font-semibold text-ink/70"
                    style={{ background: color(x) }}
                    title={`${v.name} × ${a.name.en}: ${x.toFixed(2)}×`}
                  >
                    {x.toFixed(1)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 h-5 shrink-0 text-[13px]">
        {hover && (
          <>
            {hover.v} × {hover.a}: <b className="num">{hover.x.toFixed(2)}×</b> {t('the district median', 'ज़िला औसत का')}
          </>
        )}
      </p>
    </div>
  )
}
