import { useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Didi } from '../../components/art'
import { narrate } from '../../engine/narrate'
import { planFor, useCase } from '../../lib/plans'
import { useApp, useT } from '../../lib/store'
import { useWide } from '../../lib/useWide'
import { FullReport } from './FullReport'
import { SimpleReport } from './SimpleReport'

export default function PlanPage() {
  const { id } = useParams()
  const t = useT()
  const lang = useApp((s) => s.lang)
  const c = useCase(id)
  const [params, setParams] = useSearchParams()
  // The full calculation is for helpers and officers at a computer; phones always get the simple view.
  const full = useWide() && params.get('view') === 'full'
  const setFull = (on: boolean) => setParams(on ? { view: 'full' } : {}, { replace: true })
  const plan = useMemo(() => (c ? planFor(c, false) : null), [c])
  const narration = useMemo(() => (plan ? narrate(plan, lang).text : ''), [plan, lang])
  if (!c || !plan) {
    return (
      <div className="grid min-h-dvh place-items-center p-6 text-center">
        <div>
          <Didi mood="think" className="mx-auto mb-4 w-32" />
          <p className="font-display text-[26px] font-bold">{t('This plan is not on this phone.', 'यह योजना इस फ़ोन में नहीं है।')}</p>
          <Link to="/saathi" className="mt-4 inline-block rounded-full bg-indigo px-5 py-3 font-bold text-white">{t('Make a new plan', 'नई योजना बनाएँ')}</Link>
        </div>
      </div>
    )
  }
  return full ? <FullReport plan={plan} c={c} narration={narration} onSimple={() => setFull(false)} /> : <SimpleReport plan={plan} onFull={() => setFull(true)} narration={narration} />
}
