import { clsx } from 'clsx'
import { useState } from 'react'
import { LoanDetails } from './LoanDetails'
import { LoanKeyPoints } from './LoanKeyPoints'
import type { Plan } from '../../engine/plan'
import { useT } from '../../lib/store'

/* ---------------- Money ---------------- */
export function MoneyTab({ plan, caseId }: { plan: Plan; caseId: string }) {
  const t = useT()
  const [view, setView] = useState<'main' | 'detail'>('main')
  const r = plan.recommended
  if (!r.route.eligible || !r.schedule || !r.projection) {
    return <p className="text-[15px]">{t('No NSFDC-family loan applies. See “Next steps” for PMEGP / Mudra.', 'NSFDC परिवार का लोन लागू नहीं। “आगे क्या” में PMEGP / मुद्रा देखें।')}</p>
  }
  return (
    <div>
      <div className="mb-4 inline-flex rounded-full bg-khadi p-1 text-[14px] font-bold" role="group" aria-label={t('Money view', 'पैसे का हिस्सा')}>
        {(['main', 'detail'] as const).map((v) => (
          <button key={v} onClick={() => setView(v)} aria-pressed={view === v} className={clsx('rounded-full px-4 py-1.5 transition-colors', view === v ? 'bg-indigo text-white' : 'text-muted hover:text-ink')}>
            {v === 'main' ? t('Key points', 'मुख्य बातें') : t('Full calculation', 'पूरा हिसाब')}
          </button>
        ))}
      </div>
      {view === 'main' ? <LoanKeyPoints plan={plan} caseId={caseId} /> : <LoanDetails plan={plan} />}
    </div>
  )
}
