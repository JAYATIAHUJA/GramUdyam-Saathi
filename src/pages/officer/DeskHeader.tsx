import type { ReactNode } from 'react'
import { VERDICT } from '../../components/ui'
import { DISTRICT } from '../../data/villages'
import { lakh } from '../../lib/format'
import { useT } from '../../lib/store'
import { Row } from './types'

// Verdict colours lifted for contrast on the indigo band.
const ON_DARK = { go: '#7fe0a0', caution: '#ffc24d', rethink: '#ff8a7a' } as const

/** A slim masthead: the desk's name and its district numbers on one line, so the queue gets the height. */
export function DeskHeader({ rows }: { rows: Row[] }) {
  const t = useT()
  const asked = rows.reduce((s, r) => s + r.p.chosen.loan, 0)
  const rec = rows.reduce((s, r) => s + r.p.recommended.loan, 0)
  const waiting = rows.filter((r) => r.c.status === 'draft').length
  const avgFit = Math.round(rows.reduce((s, r) => s + r.p.fit.score, 0) / Math.max(1, rows.length))
  const mix = (['go', 'caution', 'rethink'] as const).map((v) => ({ v, n: rows.filter((r) => r.p.verdict === v).length }))

  return (
    <header className="relative flex shrink-0 flex-wrap items-center gap-x-6 gap-y-2 overflow-hidden rounded-2xl bg-indigo-deep px-4 py-2.5 text-white">
      <div aria-hidden className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-marigold/15 blur-3xl" />
      <div className="relative min-w-0">
        <h1 className="font-display text-[17px] leading-tight font-bold">{t(`${DISTRICT.name} case desk`, `${DISTRICT.nameHi} केस डेस्क`)}</h1>
        <p className="truncate text-[11.5px] text-white/55">
          A. Srivastava · {t('District Manager', 'ज़िला प्रबंधक')}
        </p>
      </div>

      <dl className="relative ml-auto flex flex-wrap items-center gap-x-5 gap-y-1.5">
        <Stat label={t('Waiting', 'बाक़ी')} value={`${waiting}/${rows.length}`} />
        <Stat label={t('Debt avoided', 'कम क़र्ज़')} value={lakh(Math.max(0, asked - rec))} color={ON_DARK.go} />
        <Stat label={t('Verdicts', 'फ़ैसले')}>
          <span className="flex h-1.5 w-20 gap-0.5 overflow-hidden rounded-full">
            {mix.map(({ v, n }) => n > 0 && <span key={v} title={`${t(VERDICT[v].en, VERDICT[v].hi)}: ${n}`} style={{ flex: n, background: ON_DARK[v] }} />)}
          </span>
          <span className="num text-[12px] text-white/70">
            {mix.map((m) => m.n).join(' · ')}
          </span>
        </Stat>
        <Stat label={t('Avg fit', 'औसत फ़िट')} value={`${avgFit}`} />
      </dl>
    </header>
  )
}

function Stat({ label, value, color, children }: { label: string; value?: string; color?: string; children?: ReactNode }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dt className="text-[11.5px] text-white/55">{label}</dt>
      <dd className="num flex items-center gap-1.5 text-[15px] font-bold" style={color ? { color } : undefined}>
        {value}
        {children}
      </dd>
    </div>
  )
}
