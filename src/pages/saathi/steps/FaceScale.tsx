import { clsx } from 'clsx'
import { useState } from 'react'
import { Face } from '../../../components/art'
import { useT } from '../../../lib/store'
import { INTEREST } from '../questions'

export function FaceScale({ value, onPick }: { value?: number; onPick: (v: 1 | 2 | 3 | 4 | 5) => void }) {
  const t = useT()
  const [hover, setHover] = useState<number | null>(null)
  const cur = hover ?? value
  return (
    <div>
      <div className="flex justify-between gap-1">
        {INTEREST.map((o) => (
          <button
            key={o.v}
            onClick={() => onPick(o.v)}
            onMouseEnter={() => setHover(o.v)}
            onMouseLeave={() => setHover(null)}
            aria-label={t(o.en, o.hi)}
            className={clsx('grid aspect-square flex-1 place-items-center rounded-2xl border-2 p-1.5 transition-transform', cur === o.v ? 'scale-110 border-indigo bg-indigo-soft' : 'border-transparent bg-white')}
          >
            <Face v={o.v} className="size-full" />
          </button>
        ))}
      </div>
      <p className="mt-4 text-center font-display text-[22px] font-bold text-indigo">{cur ? t(INTEREST[cur - 1].en, INTEREST[cur - 1].hi) : t('Tap a face', 'एक चेहरा चुनें')}</p>
    </div>
  )
}
