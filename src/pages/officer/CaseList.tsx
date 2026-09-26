import { clsx } from 'clsx'
import { useNavigate } from 'react-router-dom'
import { ActivityArt } from '../../components/art'
import { VerdictPill } from '../../components/ui'
import type { Verdict } from '../../engine/plan'
import { dscr, lakh, pct } from '../../lib/format'
import { useT } from '../../lib/store'
import { STATUS } from './status'
import { Row } from './types'

/** The queue: cards on phones, a table from md up. `compact` hides two columns when a case is open. */
export function CaseList({ rows, openId, compact }: { rows: Row[]; openId?: string; compact: boolean }) {
  const t = useT()
  const nav = useNavigate()
  return (
    <div className="flex-1 overflow-auto lg:min-h-0">
      <ul className="divide-y divide-line md:hidden">
        {rows.map(({ c, p }) => (
          <li key={c.id}>
            <button onClick={() => nav(`/officer/${c.id}`)} className={clsx('flex w-full items-center gap-3 px-3 py-3 text-left', openId === c.id && 'bg-indigo-soft/70')}>
              <ActivityArt code={p.feasibility.activity.code} className="size-11 rounded-xl" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <b className="truncate text-[15px]">{c.input.name}</b>
                  <VerdictPill v={p.verdict} />
                </span>
                <span className="block truncate text-[12.5px] text-muted">
                  {t(p.feasibility.activity.name.en, p.feasibility.activity.name.hi)}, {t(p.feasibility.village.name, p.feasibility.village.nameHi)}
                </span>
                <span className="mt-1 flex items-center justify-between gap-2 text-[13px]">
                  <span>
                    <span className="num text-ink/60 line-through">{lakh(p.chosen.loan)}</span> <b className="num text-go">{lakh(p.recommended.loan)}</b>
                  </span>
                  <span className={clsx('rounded-full px-2 py-0.5 text-[11.5px] font-semibold', STATUS[c.status].cls)}>{t(STATUS[c.status].en, STATUS[c.status].hi)}</span>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <table className="hidden w-full text-[14px] md:table">
        <thead className="sticky top-0 z-10 bg-white">
          <tr className="border-b border-line text-left text-[12.5px] text-muted">
            <th className="px-3 py-2 font-semibold">{t('Applicant', 'आवेदक')}</th>
            <th className="px-3 font-semibold">{t('Business', 'काम')}</th>
            <th className="px-3 text-right font-semibold">{t('Asked', 'माँगा')}</th>
            <th className="px-3 text-right font-semibold">{t('Advised', 'सुझाया')}</th>
            <th className="px-3 font-semibold">{t('Verdict', 'फ़ैसला')}</th>
            {!compact && <th className="px-3 text-right font-semibold">DSCR</th>}
            {!compact && <th className="px-3 text-right font-semibold">{t('Risk', 'जोखिम')}</th>}
            <th className="px-3 font-semibold">{t('Status', 'स्थिति')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ c, p }) => (
            <tr key={c.id} onClick={() => nav(`/officer/${c.id}`)} className={clsx('cursor-pointer border-b border-line last:border-0 hover:bg-indigo-soft/40', openId === c.id && 'bg-indigo-soft/70')}>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2.5">
                  <ActivityArt code={p.feasibility.activity.code} className="size-9 rounded-lg" />
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{c.input.name}</div>
                    <div className="text-[12px] text-muted">
                      {t(p.feasibility.village.name, p.feasibility.village.nameHi)}
                      {c.channel === 'vle' && <span className="ml-1.5 rounded bg-khadi px-1 text-[10.5px] font-bold">VLE</span>}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-3 text-[13.5px]">{t(p.feasibility.activity.name.en, p.feasibility.activity.name.hi)}</td>
              <td className="num px-3 text-right text-ink/70">{lakh(p.chosen.loan)}</td>
              <td className={clsx('num px-3 text-right text-[15px] font-bold', p.recommended.loan < p.chosen.loan && 'text-go')}>{lakh(p.recommended.loan)}</td>
              <td className="px-3">
                <VerdictPill v={p.verdict} />
              </td>
              {!compact && <td className={clsx('num px-3 text-right', (p.recommended.projection?.minDscr ?? 0) < 1.5 ? 'text-caution' : '')}>{dscr(p.recommended.projection?.minDscr)}</td>}
              {!compact && <td className="num px-3 text-right">{p.recommended.mc ? pct(p.recommended.mc.pDefault) : '-'}</td>}
              <td className="px-3">
                <span className={clsx('rounded-full px-2 py-0.5 text-[12px] font-semibold whitespace-nowrap', STATUS[c.status].cls)}>{t(STATUS[c.status].en, STATUS[c.status].hi)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="p-6 text-center text-muted">{t('No cases match. Clear the search or filter.', 'कोई केस नहीं मिला। खोज या फ़िल्टर हटाएँ।')}</p>}
    </div>
  )
}
