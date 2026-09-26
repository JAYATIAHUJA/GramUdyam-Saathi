import { clsx } from 'clsx'
import { ChevronRight, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { ActivityArt } from '../../../components/art'
import { activityByCode, sizeCost } from '../../../data/activities'
import { lakh } from '../../../lib/format'
import { type Draft, useT } from '../../../lib/store'
import Saathi from '../Saathi'

export function SizeStep({ draft, onPick }: { draft: Draft; onPick: (id: string | null) => void }) {
  const t = useT()
  const a = activityByCode(draft.activity!)
  const [own, setOwn] = useState(draft.sizeId !== null)
  return (
    <div className="space-y-2.5">
      <button onClick={() => onPick(null)} className={clsx('flex w-full items-center gap-3 rounded-2xl border-2 border-indigo bg-indigo px-4 py-4 text-left text-white shadow-[0_4px_0_#1c2566] active:translate-y-1 active:shadow-none', draft.sizeId === null && 'ring-4 ring-marigold/50')}>
        <Sparkles className="size-7 shrink-0 text-marigold" />
        <span className="flex-1">
          <span className="block text-[19px] font-bold">{t('Let Saathi decide', 'साथी तय करे')}</span>
          <span className="text-[14px] text-white/80">{t('The size you can safely repay', 'उतना बड़ा, जितने की किस्त आराम से चुके')}</span>
        </span>
        <ChevronRight className="size-6" />
      </button>
      {!own ? (
        <button onClick={() => setOwn(true)} className="w-full rounded-xl border-2 border-dashed border-line py-3 text-[15.5px] font-semibold text-ink/75 hover:border-indigo/40">
          {t('I want to choose myself', 'मैं ख़ुद चुनूँगा / चुनूँगी')}
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {a.sizes.map((sz) => (
            <button key={sz.id} onClick={() => onPick(sz.id)} className={clsx('card flex items-center gap-2.5 px-3 py-2.5 text-left hover:border-indigo/50', draft.sizeId === sz.id && 'border-indigo ring-2 ring-indigo/30')}>
              <ActivityArt code={a.code} className="size-10" />
              <span className="flex-1">
                <span className="block text-[16.5px] leading-tight font-semibold">{t(sz.label.en, sz.label.hi)}</span>
                <span className="num text-[13px] text-muted">{t('costs', 'लागत')} {lakh(sizeCost(sz))}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
