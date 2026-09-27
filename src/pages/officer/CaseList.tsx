import { clsx } from 'clsx'
import { useNavigate } from 'react-router-dom'
import { ActivityArt } from '../../components/art'
import { VerdictPill, VerdictTag } from '../../components/ui'
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
          <tr className="border-b border-line text-left text-[11px] tracking-wider text-muted uppercase">
            <th className="py-2 pr-3 pl-4 font-semibold">{t('Applicant', 'आवेदक')}</th>
            {!compact && <th className="px-3 font-semibold">{t('Business', 'काम')}</th>}
            <th className="px-3 text-right font-semibold">{t('Loan (advised)', 'लोन (सुझाया)')}</th>
            <th className="px-3 font-semibold">{t('Verdict', 'फ़ैसला')}</th>
            {!compact && <th className="px-3 text-right font-semibold">DSCR</th>}
            {!compact && <th className="px-3 font-semibold">{t('Risk', 'जोखिम')}</th>}
            <th className="pr-4 pl-3 font-semibold">{t('Status', 'स्थिति')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ c, p }) => {
            const risk = p.recommended.mc?.pDefault
            const cut = p.recommended.loan < p.chosen.loan
            return (
              <tr key={c.id} onClick={() => nav(`/officer/${c.id}`)} className={clsx('group cursor-pointer border-b border-line/70 transition-colors last:border-0 hover:bg-khadi/60', openId === c.id && 'bg-indigo-soft/70 shadow-[inset_3px_0_0_var(--color-indigo)] hover:bg-indigo-soft/70')}>
                <td className="py-2 pr-3 pl-4">
                  <div className="flex items-center gap-2.5">
                    <ActivityArt code={p.feasibility.activity.code} className="size-8 rounded-lg" />
                    <div className="min-w-0">
                      <div className="truncate text-[14px] font-semibold">{c.input.name}</div>
                      <div className="truncate text-[12px] text-muted">
                        {t(p.feasibility.village.name, p.feasibility.village.nameHi)}
                        {compact && <> · {t(p.feasibility.activity.name.en, p.feasibility.activity.name.hi)}</>}
                        {c.channel === 'vle' && <span className="ml-1.5 rounded bg-khadi px-1 text-[10px] font-bold tracking-wide text-ink/60">VLE</span>}
                      </div>
                    </div>
                  </div>
                </td>
                {!compact && <td className="max-w-[180px] truncate px-3 text-[13px] text-ink/80">{t(p.feasibility.activity.name.en, p.feasibility.activity.name.hi)}</td>}
                <td className="px-3 text-right whitespace-nowrap">
                  <div className={clsx('num text-[14.5px] font-bold', cut ? 'text-go' : 'text-ink')}>{lakh(p.recommended.loan)}</div>
                  {cut && <div className="num text-[11.5px] text-muted line-through">{lakh(p.chosen.loan)}</div>}
                </td>
                <td className="px-3">
                  <VerdictTag v={p.verdict} />
                </td>
                {!compact && <td className={clsx('num px-3 text-right text-[13.5px]', (p.recommended.projection?.minDscr ?? 0) < 1.5 ? 'font-bold text-caution' : 'text-ink/80')}>{dscr(p.recommended.projection?.minDscr)}</td>}
                {!compact && (
                  <td className="px-3">
                    {risk == null ? (
                      <span className="text-muted">-</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-khadi">
                          <div className="h-full rounded-full" style={{ width: `${Math.min(100, risk * 250)}%`, background: risk < 0.15 ? 'var(--color-go)' : risk < 0.3 ? 'var(--color-caution)' : 'var(--color-risk)' }} />
                        </div>
                        <span className="num text-[12.5px] text-ink/80">{pct(risk)}</span>
                      </div>
                    )}
                  </td>
                )}
                <td className="pr-4 pl-3">
                  <span className={clsx('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[12px] font-semibold', compact ? 'max-w-[110px] leading-tight' : 'whitespace-nowrap', STATUS[c.status].cls)}>{t(STATUS[c.status].en, STATUS[c.status].hi)}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {rows.length === 0 && <p className="p-6 text-center text-muted">{t('No cases match. Clear the search or filter.', 'कोई केस नहीं मिला। खोज या फ़िल्टर हटाएँ।')}</p>}
    </div>
  )
}
