import { clsx } from 'clsx'
import { Check } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Didi } from '../../../components/art'
import { villageByLgd } from '../../../data/villages'
import { type Draft, useT } from '../../../lib/store'

export function Analyzing({ draft, onDone }: { draft: Draft; onDone: () => void }) {
  const t = useT()
  const [i, setI] = useState(0)
  const done = useRef(false)
  const v = draft.lgd ? villageByLgd(draft.lgd) : null
  const steps = [
    t(`Mapping 5 and 10 km around ${v?.name ?? 'your village'}`, `${v?.nameHi ?? 'आपके गाँव'} के आसपास 5 और 10 किमी का नक्शा`),
    t('Counting similar units, checking demand', 'ऐसी इकाइयाँ गिन रहे हैं, माँग जाँच रहे हैं'),
    t('Applying the government scheme rules', 'सरकारी योजना के नियम लगा रहे हैं'),
    t('Testing 1,000 good and bad years', '1,000 अच्छे-बुरे सालों पर जाँच रहे हैं'),
    t('Writing your report', 'आपकी रिपोर्ट लिख रहे हैं'),
  ]
  useEffect(() => {
    const id = setInterval(() => setI((x) => Math.min(x + 1, steps.length)), 520)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    if (i >= steps.length && !done.current) {
      done.current = true
      onDone()
    }
  }, [i, steps.length, onDone])
  return (
    <div className="flex h-full flex-col justify-center py-4">
      <Didi mood="think" className="mb-3 w-28" />
      <p className="font-display text-[28px] font-bold leading-tight text-indigo-deep">{t(`${draft.name ? draft.name + '’s' : 'Your'} plan is being checked`, `${draft.name ? draft.name + ' जी की' : 'आपकी'} योजना की जाँच हो रही है`)}</p>
      <ol className="mt-8 space-y-4">
        {steps.map((s, k) => (
          <li key={k} className={clsx('flex items-center gap-3 text-[17px] transition-opacity', k > i && 'opacity-30')}>
            <span className={clsx('grid size-7 place-items-center rounded-full', k < i ? 'bg-go text-white' : k === i ? 'border-2 border-marigold' : 'border-2 border-line')}>
              {k < i ? <Check className="size-4" strokeWidth={3} /> : k === i ? <span className="size-2.5 animate-ping rounded-full bg-marigold" /> : null}
            </span>
            {s}
          </li>
        ))}
      </ol>
    </div>
  )
}
