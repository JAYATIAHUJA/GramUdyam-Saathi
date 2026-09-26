import { VILLAGES, ROAD_FACTOR, type Village } from '../data/villages'
import type { Feasibility } from '../engine/feasibility'
import { competitorsIn } from '../engine/feasibility'
import { useT } from '../lib/store'

/** Stylised catchment map: 5 / 10 km road-distance rings, villages sized by population,
 *  similar units as marigold ticks, milk centres / haats as symbols. */
export function CatchmentMap({ f, height = 300 }: { f: Feasibility; height?: number }) {
  const t = useT()
  const c = f.village
  const W = 360
  const H = height
  const kmPx = (Math.min(W, H) / 2 - 12) / (10 / ROAD_FACTOR)
  const cx = W / 2
  const cy = H / 2
  const pos = (v: Village) => ({ x: cx + (v.x - c.x) * kmPx, y: cy - (v.y - c.y) * kmPx })
  const r5 = (5 / ROAD_FACTOR) * kmPx
  const r10 = (10 / ROAD_FACTOR) * kmPx
  const vis = VILLAGES.filter((v) => {
    const p = pos(v)
    return p.x > -10 && p.x < W + 10 && p.y > -10 && p.y < H + 10
  })
  return (
    <figure className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-xl bg-[#f3efe4]" role="img" aria-label={t('Catchment map', 'बाज़ार का नक्शा')}>
        <defs>
          <pattern id="fields" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(28)">
            <line x1="0" y1="0" x2="0" y2="18" stroke="#e4ddcb" strokeWidth="7" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#fields)" />
        {/* river hint: Ghaghra-side drain */}
        <path d={`M -10 ${H * 0.82} C ${W * 0.25} ${H * 0.7}, ${W * 0.45} ${H * 0.98}, ${W + 10} ${H * 0.86}`} fill="none" stroke="#b9cfe0" strokeWidth="7" strokeLinecap="round" opacity="0.8" />
        {/* roads to each village from the centre */}
        {vis.map((v) => {
          const p = pos(v)
          return v.lgd === c.lgd ? null : <line key={'r' + v.lgd} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={v.facilities.pakkaRoad ? '#cfc6b1' : '#ddd5c2'} strokeWidth={v.facilities.pakkaRoad ? 2 : 1.2} strokeDasharray={v.facilities.pakkaRoad ? undefined : '3 3'} />
        })}
        <circle cx={cx} cy={cy} r={r10} fill="rgba(46,58,140,0.04)" stroke="#2E3A8C" strokeOpacity="0.35" strokeDasharray="5 5" />
        <circle cx={cx} cy={cy} r={r5} fill="rgba(46,58,140,0.07)" stroke="#2E3A8C" strokeOpacity="0.6" />
        <text x={cx + r5 * 0.72} y={cy - r5 * 0.72} fontSize="11" fontWeight="700" fill="#2E3A8C">5 km</text>
        <text x={cx + r10 * 0.72} y={cy - r10 * 0.72} fontSize="11" fontWeight="700" fill="#2E3A8C" opacity="0.7">10 km</text>
        {vis.map((v) => {
          const p = pos(v)
          const rad = 3 + Math.sqrt(v.pop2011) / 14
          const comp = Math.round(competitorsIn(v, f.activity).mid)
          const isC = v.lgd === c.lgd
          return (
            <g key={v.lgd}>
              <circle cx={p.x} cy={p.y} r={rad} fill={isC ? '#2E3A8C' : '#fff'} stroke="#2E3A8C" strokeWidth={isC ? 0 : 1.4} />
              {Array.from({ length: Math.min(comp, 12) }).map((_, i) => {
                const a = (i / Math.min(comp, 12)) * Math.PI * 2
                return <circle key={i} cx={p.x + Math.cos(a) * (rad + 4)} cy={p.y + Math.sin(a) * (rad + 4)} r={1.9} fill="#F2A900" stroke="#8a6200" strokeWidth="0.5" />
              })}
              {f.activity.channel === 'milkCentre' && v.facilities.milkCentre && (
                <g transform={`translate(${p.x + rad + 5} ${p.y - rad - 9})`}>
                  <rect width="15" height="13" rx="3" fill="#1B873F" />
                  <text x="7.5" y="10" fontSize="9" textAnchor="middle" fill="#fff" fontWeight="700">M</text>
                </g>
              )}
              {v.facilities.haat && f.activity.channel !== 'milkCentre' && (
                <g transform={`translate(${p.x + rad + 5} ${p.y - rad - 9})`}>
                  <rect width="15" height="13" rx="3" fill="#7a4fb3" />
                  <text x="7.5" y="10" fontSize="9" textAnchor="middle" fill="#fff" fontWeight="700">H</text>
                </g>
              )}
              <text x={p.x} y={p.y + rad + 13} fontSize={isC ? 12 : 10} fontWeight={isC ? 800 : 600} textAnchor="middle" fill={isC ? '#1c2566' : '#5b5548'} style={{ paintOrder: 'stroke', stroke: '#f3efe4', strokeWidth: 3 }}>
                {t(v.name, v.nameHi)}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-indigo" />{t('Your village', 'आपका गाँव')}</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-marigold ring-1 ring-[#8a6200]" />{t('Similar units (est.)', 'ऐसी इकाइयाँ (अंदाज़ा)')}</span>
        {f.activity.channel === 'milkCentre' ? (
          <span className="inline-flex items-center gap-1.5"><span className="grid size-3.5 place-items-center rounded-sm bg-go text-[8px] font-bold text-white">M</span>{t('Milk centre', 'दूध केंद्र')}</span>
        ) : (
          <span className="inline-flex items-center gap-1.5"><span className="grid size-3.5 place-items-center rounded-sm bg-[#7a4fb3] text-[8px] font-bold text-white">H</span>{t('Weekly haat', 'साप्ताहिक हाट')}</span>
        )}
        <span className="inline-flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed border-[#cfc6b1]" />{t('Kachcha road', 'कच्ची सड़क')}</span>
      </figcaption>
    </figure>
  )
}
