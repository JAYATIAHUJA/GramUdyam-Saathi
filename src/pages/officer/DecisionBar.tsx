import { clsx } from 'clsx'
import { ArrowUpRight, CheckCircle2, FileText, Hourglass, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { type CaseStatus, type SavedCase, useT } from '../../lib/store'
import { STATUS } from './status'

/** Always-visible decision buttons at the foot of an open case. */
export function DecisionBar({ c, onStatus }: { c: SavedCase; onStatus: (s: CaseStatus) => void }) {
  const t = useT()
  return (
    <div className="shrink-0 space-y-2 border-t border-line bg-paper p-3">
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => onStatus('revision')} className={clsx('inline-flex items-center justify-center gap-1.5 rounded-xl border-2 px-3 py-2.5 text-[14px] font-bold', c.status === 'revision' ? 'border-caution bg-caution-soft text-caution' : 'border-line bg-white hover:border-caution/50')}>
          <RotateCcw className="size-4" /> {t('Send back', 'सुधार के लिए लौटाएँ')}
        </button>
        <button onClick={() => onStatus('ready')} className={clsx('inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[14px] font-bold text-white', c.status === 'ready' ? 'bg-go ring-2 ring-go/30' : 'bg-go/90 hover:bg-go')}>
          <CheckCircle2 className="size-4" /> {t('Ready for PM-SURAJ', 'PM-SURAJ के लिए तैयार')}
        </button>
      </div>
      <div className="flex items-center justify-between text-[13.5px] font-semibold text-indigo">
        <span className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px]', STATUS[c.status].cls)}>
          <Hourglass className="size-3" /> {t(STATUS[c.status].en, STATUS[c.status].hi)}
        </span>
        <span className="flex gap-4">
          <Link to={`/plan/${c.id}`} className="inline-flex items-center gap-1 hover:underline">
            {t('Applicant’s view', 'आवेदक का दृश्य')} <ArrowUpRight className="size-4" />
          </Link>
          <Link to={`/dpr/${c.id}`} className="inline-flex items-center gap-1 hover:underline">
            <FileText className="size-4" /> DPR
          </Link>
        </span>
      </div>
    </div>
  )
}
