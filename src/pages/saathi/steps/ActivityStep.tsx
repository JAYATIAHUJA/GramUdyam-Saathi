import { clsx } from 'clsx'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import { ActivityArt } from '../../../components/art'
import { ACTIVITIES } from '../../../data/activities'
import { villageByLgd } from '../../../data/villages'
import { assessFeasibility } from '../../../engine/feasibility'
import { buildScenario } from '../../../engine/plan'
import { type Draft, useT } from '../../../lib/store'

export function ActivityStep({ draft, onPick }: { draft: Draft; onPick: (a: string) => void }) {
  const t = useT()
  const [thinking, setThinking] = useState(false)
  const suggest = () => {
    if (!draft.lgd || !draft.margin) return
    setThinking(true)
    setTimeout(() => {
      const v = villageByLgd(draft.lgd!)!
      let best = { code: 'dairy', score: -1 }
      for (const a of ACTIVITIES) {
        const f = assessFeasibility(v, a)
        const cap = f.demand.uncapped ? null : (f.demand.monthlyLow + f.demand.monthlyHigh) / 2
        for (const s of a.sizes) {
          const sc = buildScenario({ activity: a, size: s, scale: 1 }, draft.margin!, { category: draft.category ?? 'SC', familyIncome: draft.familyIncome ?? 150000, mode: 'serviced' }, { familyLabour: 2, marketCap: cap, needBased: true })
          if (!sc.passes) continue
          const score = (sc.projection!.years[1].ebitda / 12) * (f.saturation.label === 'crowded' ? 0.5 : 1)
          if (score > best.score) best = { code: a.code, score }
        }
      }
      setThinking(false)
      onPick(best.code)
    }, 50)
  }
  return (
    <div className="grid grid-cols-3 gap-2.5 md:grid-cols-5 md:gap-2">
      {ACTIVITIES.map((a) => (
        <button key={a.code} onClick={() => onPick(a.code)} className={clsx('card flex flex-col items-center gap-1.5 p-2 pb-2.5 text-center transition-all hover:-translate-y-0.5 hover:border-indigo/50 hover:shadow-md', draft.activity === a.code && 'border-indigo ring-2 ring-indigo/30')}>
          <ActivityArt code={a.code} className="aspect-square w-full max-w-[56px] sm:max-w-[84px]" />
          <span className="text-[13.5px] leading-tight font-semibold">{t(a.name.en, a.name.hi)}</span>
        </button>
      ))}
      <button onClick={suggest} className="col-span-full mt-1 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo/40 bg-indigo-soft/60 py-2.5 sm:py-3 text-[16px] font-bold text-indigo">
        <Sparkles className={clsx('size-5', thinking && 'animate-spin')} />
        {thinking ? t('Checking your village…', 'आपका गाँव जाँच रहे हैं…') : t('Suggest a business for my village', 'मेरे गाँव के लिए काम सुझाइए')}
      </button>
    </div>
  )
}
