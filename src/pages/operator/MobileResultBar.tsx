import { Send } from 'lucide-react'
import { VerdictPill } from '../../components/ui'
import type { Plan } from '../../engine/plan'
import { inr } from '../../lib/format'
import { useT } from '../../lib/store'

/** Phones: the loan and the send button stay pinned under the form. */
export function MobileResultBar({ plan, onSend }: { plan: Plan; onSend: () => void }) {
  const t = useT()
  const r = plan.recommended
  return (
    <div className="no-print sticky bottom-0 z-30 flex items-center gap-3 border-t border-line bg-paper/95 px-3 py-2.5 backdrop-blur lg:hidden">
      <div className="min-w-0 flex-1 leading-tight">
        <div className="text-[12px] font-semibold text-muted">{t('Recommended loan', 'सुझाया गया लोन')}</div>
        <div className="flex items-center gap-2">
          <b className="num text-[20px] text-indigo-deep">{r.route.eligible ? inr(r.loan) : '-'}</b>
          <VerdictPill v={plan.verdict} />
        </div>
      </div>
      <button
        onClick={onSend}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-go px-3.5 py-2.5 text-[14px] font-bold text-white"
      >
        <Send className="size-4" /> {t('Send to SCA', 'SCA को भेजें')}
      </button>
    </div>
  )
}
