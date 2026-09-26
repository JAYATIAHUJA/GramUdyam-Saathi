import { clsx } from 'clsx'
import { ArrowUpRight, CheckCircle2, FileText, Flag, MessageSquare, RotateCcw, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { TopNav } from './Landing'
import { ConfidenceBadge, VerdictPill, VerdictStamp } from '../components/ui'
import { ACTIVITIES } from '../data/activities'
import { DISTRICT, VILLAGES } from '../data/villages'
import { competitorsIn } from '../engine/feasibility'
import type { Plan, Verdict } from '../engine/plan'
import { inr, lakh, pct, dscr } from '../lib/format'
import { planFor, useAllCases } from '../lib/plans'
import { useApp, useT, type CaseStatus, type SavedCase } from '../lib/store'

const STATUS: Record<CaseStatus, { en: string; hi: string; cls: string }> = {
  draft: { en: 'New', hi: 'नया', cls: 'bg-indigo-soft text-indigo' },
  ready: { en: 'Ready for PM-SURAJ', hi: 'PM-SURAJ के लिए तैयार', cls: 'bg-go-soft text-go' },
  revision: { en: 'Needs revision', hi: 'सुधार चाहिए', cls: 'bg-caution-soft text-caution' },
}

export default function Officer() {
  const t = useT()
  const { id } = useParams()
  const nav = useNavigate()
  const cases = useAllCases()
  const [vf, setVf] = useState<Verdict | 'all'>('all')
  const [q, setQ] = useState('')
  const rows = useMemo(() => cases.map((c) => ({ c, p: planFor(c, false) })), [cases])
  const filtered = rows.filter(({ c, p }) => (vf === 'all' || p.verdict === vf) && (!q || (c.input.name + p.feasibility.village.name + p.feasibility.activity.name.en).toLowerCase().includes(q.toLowerCase())))
  const selected = rows.find((r) => r.c.id === id)

  const asked = rows.reduce((s, r) => s + r.p.chosen.loan, 0)
  const rec = rows.reduce((s, r) => s + r.p.recommended.loan, 0)
  const flagged = rows.filter((r) => r.p.verdict !== 'go').length
  const avgFit = Math.round(rows.reduce((s, r) => s + r.p.fit.score, 0) / Math.max(1, rows.length))
  const waiting = rows.filter((r) => r.c.status === 'draft').length

  return (
    <div className="min-h-dvh bg-paper">
      <TopNav dark />
      <div className="mx-auto max-w-[1400px] px-4 py-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[14px] font-semibold text-muted">{t(DISTRICT.sca.name, DISTRICT.sca.nameHi)}</p>
            <h1 className="font-display text-[32px] font-bold leading-tight text-indigo-deep">{t(`${DISTRICT.name} case desk`, `${DISTRICT.nameHi} केस डेस्क`)}</h1>
          </div>
          <div className="text-right text-[13px] text-muted">
            {t('Signed in as', 'लॉग-इन')} <b className="text-ink">A. Srivastava</b>, {t('District Manager', 'ज़िला प्रबंधक')}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
          <Kpi label={t('Waiting for review', 'समीक्षा बाक़ी')} value={String(waiting)} sub={t(`of ${rows.length} cases`, `${rows.length} केस में से`)} />
          <Kpi label={t('Loan asked', 'माँगा गया लोन')} value={lakh(asked)} sub={t('what applicants wanted', 'आवेदकों ने चाहा')} />
          <Kpi label={t('Recommended', 'सुझाया गया')} value={lakh(rec)} sub={t(`${lakh(asked - rec)} less debt`, `${lakh(asked - rec)} कम क़र्ज़`)} tone="go" />
          <Kpi label={t('Flagged', 'चिह्नित')} value={String(flagged)} sub={t('caution or rethink', 'सावधानी या दोबारा सोचें')} tone="caution" />
          <Kpi label={t('Avg Founder-Fit', 'औसत फ़ाउंडर-फ़िट')} value={`${avgFit}`} sub={t('out of 100', '100 में से')} />
        </div>

        <div className={clsx('mt-6 grid gap-5', selected ? 'xl:grid-cols-[minmax(0,1fr)_480px]' : '')}>
          <section className="card overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
              <label className="flex flex-1 items-center gap-2 rounded-lg border border-line px-3 py-2 min-w-[200px]">
                <Search className="size-4 text-muted" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Search name, village, activity', 'नाम, गाँव, काम खोजें')} className="flex-1 bg-transparent text-[14px] outline-none" />
              </label>
              {(['all', 'go', 'caution', 'rethink'] as const).map((v) => (
                <button key={v} onClick={() => setVf(v)} className={clsx('rounded-full px-3 py-1.5 text-[13px] font-semibold', vf === v ? 'bg-indigo text-white' : 'bg-khadi text-muted hover:text-ink')}>
                  {v === 'all' ? t('All', 'सभी') : v === 'go' ? t('Good', 'अच्छा') : v === 'caution' ? t('Caution', 'सावधानी') : t('Rethink', 'दोबारा सोचें')}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[14px]">
                <thead>
                  <tr className="border-b border-line text-left text-[12.5px] text-muted">
                    <th className="px-3 py-2.5 font-semibold">{t('Applicant', 'आवेदक')}</th>
                    <th className="px-3 font-semibold">{t('Activity', 'काम')}</th>
                    <th className="px-3 text-right font-semibold">{t('Asked', 'माँगा')}</th>
                    <th className="px-3 text-right font-semibold">{t('Recommended', 'सुझाया')}</th>
                    <th className="px-3 font-semibold">{t('Verdict', 'फ़ैसला')}</th>
                    <th className="px-3 text-right font-semibold">DSCR</th>
                    <th className="px-3 text-right font-semibold">{t('Risk', 'जोखिम')}</th>
                    <th className="px-3 font-semibold">{t('Status', 'स्थिति')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(({ c, p }) => (
                    <tr key={c.id} onClick={() => nav(`/officer/${c.id}`)} className={clsx('cursor-pointer border-b border-line last:border-0 hover:bg-indigo-soft/40', id === c.id && 'bg-indigo-soft/60')}>
                      <td className="px-3 py-2.5">
                        <div className="font-semibold">{c.input.name}</div>
                        <div className="text-[12px] text-muted">
                          {t(p.feasibility.village.name, p.feasibility.village.nameHi)}, {c.id}
                          {c.channel === 'vle' && <span className="ml-1 rounded bg-khadi px-1 text-[10.5px] font-bold">VLE</span>}
                        </div>
                      </td>
                      <td className="px-3">
                        <span className="mr-1">{p.feasibility.activity.emoji}</span>
                        {t(p.feasibility.activity.name.en, p.feasibility.activity.name.hi)}
                      </td>
                      <td className="num px-3 text-right text-[15px]">{lakh(p.chosen.loan)}</td>
                      <td className={clsx('num px-3 text-right text-[15px] font-bold', p.recommended.loan < p.chosen.loan && 'text-go')}>{lakh(p.recommended.loan)}</td>
                      <td className="px-3"><VerdictPill v={p.verdict} /></td>
                      <td className={clsx('num px-3 text-right', (p.recommended.projection?.minDscr ?? 0) < 1.5 ? 'text-caution' : '')}>{dscr(p.recommended.projection?.minDscr) ?? '—'}</td>
                      <td className="num px-3 text-right">{p.recommended.mc ? pct(p.recommended.mc.pDefault) : '—'}</td>
                      <td className="px-3">
                        <span className={clsx('rounded-full px-2 py-0.5 text-[12px] font-semibold whitespace-nowrap', STATUS[c.status].cls)}>{t(STATUS[c.status].en, STATUS[c.status].hi)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <p className="p-6 text-center text-muted">{t('No cases match. Clear the search or filter.', 'कोई केस नहीं मिला। खोज या फ़िल्टर हटाएँ।')}</p>}
            </div>
          </section>
          {selected && <CaseDetail c={selected.c} p={selected.p} onClose={() => nav('/officer')} />}
        </div>

        <Heatmap />
      </div>
    </div>
  )
}

function Kpi({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: 'go' | 'caution' }) {
  return (
    <div className="card p-4">
      <div className="text-[13px] font-medium text-muted">{label}</div>
      <div className={clsx('num text-[30px] font-bold leading-tight', tone === 'go' && 'text-go', tone === 'caution' && 'text-caution')}>{value}</div>
      <div className="text-[12.5px] text-muted">{sub}</div>
    </div>
  )
}

function CaseDetail({ c, p, onClose }: { c: SavedCase; p: Plan; onClose: () => void }) {
  const t = useT()
  const addCase = useApp((s) => s.addCase)
  const [note, setNote] = useState('')
  const update = (patch: Partial<SavedCase>) => addCase({ ...c, ...patch })
  const r = p.recommended
  const flags = [...p.naive.route.flags, ...r.route.flags].filter((f, i, a) => a.findIndex((x) => x.code === f.code) === i)
  return (
    <aside className="card sticky top-4 max-h-[calc(100dvh-2rem)] self-start overflow-y-auto">
      <div className="flex items-start justify-between gap-3 border-b border-line p-4">
        <div>
          <div className="text-[12.5px] font-semibold text-muted">{c.id}, {new Date(c.createdAt).toLocaleDateString('en-IN')}</div>
          <div className="font-display text-[24px] font-bold leading-tight">{c.input.name}</div>
          <div className="text-[13.5px] text-muted">
            {p.feasibility.activity.emoji} {t(p.feasibility.activity.name.en, p.feasibility.activity.name.hi)}, {t(p.feasibility.village.name, p.feasibility.village.nameHi)} · {c.input.category} · {t('income', 'आय')} {lakh(c.input.familyIncome)}
          </div>
        </div>
        <button onClick={onClose} className="grid size-9 place-items-center rounded-full hover:bg-khadi" aria-label={t('Close', 'बंद')}>
          <X className="size-5" />
        </button>
      </div>

      <div className="space-y-5 p-4">
        <div className="flex items-center justify-between">
          <div className="grid flex-1 grid-cols-2 gap-3">
            <div>
              <div className="text-[12.5px] text-muted">{t('Asked', 'माँगा')}</div>
              <div className="num text-[24px] font-bold">{inr(p.chosen.loan)}</div>
              <div className="text-[12px] text-muted">{t(p.chosen.unit.size.label.en, p.chosen.unit.size.label.hi)}</div>
            </div>
            <div>
              <div className="text-[12.5px] text-muted">{t('Recommended', 'सुझाया')}</div>
              <div className="num text-[24px] font-bold text-go">{inr(r.loan)}</div>
              <div className="text-[12px] text-muted">{t(r.unit.size.label.en, r.unit.size.label.hi)}</div>
            </div>
          </div>
          <VerdictStamp v={p.verdict} size="sm" animate={false} />
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-[11.5px] text-muted">
          <Mini v={dscr(r.projection?.minDscr) ?? '—'} l="DSCR" />
          <Mini v={r.mc ? pct(r.mc.pDefault) : '—'} l={t('P(default)', 'जोखिम')} />
          <Mini v={String(p.fit.score)} l={t('Founder-Fit', 'फ़िट')} />
          <Mini v={p.feasibility.saturation.index.toFixed(2) + '×'} l={t('Saturation', 'भीड़')} />
        </div>

        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-[14px] font-bold"><Flag className="size-4 text-caution" />{t('Why this verdict', 'यह फ़ैसला क्यों')}</h3>
          <ul className="space-y-1.5 text-[13.5px]">
            {p.reasons.map((x, i) => <li key={'r' + i} className="rounded-lg bg-khadi px-3 py-2">{t(x.en, x.hi)}</li>)}
            {p.topRisks.map((x, i) => (
              <li key={'k' + i} className={clsx('rounded-lg px-3 py-2', x.level === 'high' ? 'bg-risk-soft' : 'bg-caution-soft/70')}>{t(x.en, x.hi)}</li>
            ))}
            {flags.map((f) => (
              <li key={f.code} className="rounded-lg border border-line px-3 py-2"><b className="text-[11.5px]">{f.code}</b> {t(f.en, f.hi)}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-1 text-[14px] font-bold">{t('Evidence', 'सबूत')}</h3>
          {p.feasibility.facts.slice(0, 7).map((f) => (
            <div key={f.id} className="flex items-center justify-between gap-2 border-b border-line py-1.5 text-[13px] last:border-0">
              <span className="text-muted"><b className="text-ink">{f.id}</b> {t(f.label.en, f.label.hi)}</span>
              <span className="flex items-center gap-2"><b className="num">{f.display}</b><ConfidenceBadge c={f.confidence} /></span>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-indigo-soft/60 px-3 py-2 text-[12.5px]">
          {t('Rule', 'नियम')} <b>{r.route.rule?.id ?? '—'}</b> ({p.ruleVersion}), {t('data', 'डेटा')} <b>{p.dataVersion}</b>. {t('Re-running gives the same numbers.', 'दोबारा चलाने पर वही संख्याएँ।')}
        </div>

        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-[14px] font-bold"><MessageSquare className="size-4 text-indigo" />{t('Remarks', 'टिप्पणी')}</h3>
          <div className="space-y-2">
            {c.remarks.map((m, i) => (
              <div key={i} className="rounded-lg border border-line px-3 py-2 text-[13.5px]">
                <div className="text-[11.5px] text-muted">{m.by}, {new Date(m.at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                {m.text}
              </div>
            ))}
            {c.remarks.length === 0 && <p className="text-[13px] text-muted">{t('No remarks yet.', 'अभी कोई टिप्पणी नहीं।')}</p>}
          </div>
          <form
            className="mt-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (!note.trim()) return
              update({ remarks: [...c.remarks, { by: 'A. Srivastava (SCA)', at: new Date().toISOString(), text: note.trim() }] })
              setNote('')
            }}
          >
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('Add a remark for the applicant / VLE', 'आवेदक / VLE के लिए टिप्पणी')} className="flex-1 rounded-lg border border-line px-3 py-2 text-[14px]" />
            <button className="rounded-lg bg-indigo px-3 text-[14px] font-semibold text-white">{t('Add', 'जोड़ें')}</button>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => update({ status: 'revision' })} className={clsx('inline-flex items-center justify-center gap-1.5 rounded-lg border-2 px-3 py-2.5 text-[14px] font-bold', c.status === 'revision' ? 'border-caution bg-caution-soft text-caution' : 'border-line')}>
            <RotateCcw className="size-4" /> {t('Needs revision', 'सुधार चाहिए')}
          </button>
          <button onClick={() => update({ status: 'ready' })} className={clsx('inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-[14px] font-bold', c.status === 'ready' ? 'bg-go text-white' : 'bg-go/90 text-white hover:bg-go')}>
            <CheckCircle2 className="size-4" /> {t('Ready for PM-SURAJ', 'PM-SURAJ के लिए तैयार')}
          </button>
        </div>
        <div className="flex gap-4 text-[14px] font-semibold text-indigo">
          <Link to={`/plan/${c.id}`} className="inline-flex items-center gap-1">{t('Beneficiary view', 'लाभार्थी दृश्य')} <ArrowUpRight className="size-4" /></Link>
          <Link to={`/dpr/${c.id}`} className="inline-flex items-center gap-1"><FileText className="size-4" /> DPR</Link>
        </div>
      </div>
    </aside>
  )
}

function Mini({ v, l }: { v: string; l: string }) {
  return (
    <div className="rounded-lg bg-khadi px-1 py-2">
      <div className="num text-[17px] font-bold text-ink">{v}</div>
      {l}
    </div>
  )
}

/** District saturation heatmap: units per 1,000 people vs district median, village × activity. */
function Heatmap() {
  const t = useT()
  const [hover, setHover] = useState<{ v: string; a: string; x: number } | null>(null)
  const grid = useMemo(() => {
    const med: Record<string, number> = {}
    for (const a of ACTIVITIES) {
      const xs = VILLAGES.map((v) => competitorsIn(v, a).raw / v.pop2011).sort((x, y) => x - y)
      med[a.code] = xs[Math.floor(xs.length / 2)] || 1
    }
    return VILLAGES.map((v) => ({ v, cells: ACTIVITIES.map((a) => ({ a, x: competitorsIn(v, a).raw / v.pop2011 / med[a.code] })) }))
  }, [])
  // Diverging: gap (green) ← 1.0 neutral → crowded (red)
  const color = (x: number) => {
    if (x >= 1) {
      const k = Math.min(1, (x - 1) / 1)
      return `color-mix(in oklab, #efece6 ${Math.round((1 - k) * 100)}%, #B42318)`
    }
    const k = Math.min(1, (1 - x) / 0.8)
    return `color-mix(in oklab, #efece6 ${Math.round((1 - k) * 100)}%, #1B873F)`
  }
  return (
    <section className="card mt-6 p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-[22px] font-bold text-indigo-deep">{t('Where the district is crowded, and where it has gaps', 'ज़िले में कहाँ भीड़ है, कहाँ कमी')}</h2>
          <p className="text-[13px] text-muted">{t('Similar units per person, relative to the district median. Guides where to steer new applicants.', 'प्रति व्यक्ति ऐसी इकाइयाँ, ज़िले के औसत के मुकाबले। नए आवेदकों को सही दिशा देने के लिए।')}</p>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-muted">
          <span>{t('Gap', 'कमी')}</span>
          <span className="h-2.5 w-40 rounded-full" style={{ background: 'linear-gradient(90deg,#1B873F,#efece6,#B42318)' }} />
          <span>{t('Crowded', 'भीड़')}</span>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="border-separate border-spacing-[2px] text-[12px]">
          <thead>
            <tr>
              <th />
              {ACTIVITIES.map((a) => (
                <th key={a.code} className="px-1 pb-1 text-center font-semibold text-muted" title={t(a.name.en, a.name.hi)}>
                  <div className="text-[18px]">{a.emoji}</div>
                  <div className="w-16 truncate">{t(a.name.en, a.name.hi).split(' (')[0]}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map(({ v, cells }) => (
              <tr key={v.lgd}>
                <td className="pr-3 text-right font-semibold whitespace-nowrap">{t(v.name, v.nameHi)}</td>
                {cells.map(({ a, x }) => (
                  <td
                    key={a.code}
                    onMouseEnter={() => setHover({ v: v.name, a: a.name.en, x })}
                    onMouseLeave={() => setHover(null)}
                    className="h-7 w-16 rounded text-center font-semibold text-ink/70"
                    style={{ background: color(x) }}
                    title={`${v.name} × ${a.name.en}: ${x.toFixed(2)}×`}
                  >
                    {x.toFixed(1)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 h-5 text-[13px]">{hover && <>{hover.v} × {hover.a}: <b className="num">{hover.x.toFixed(2)}×</b> {t('the district median', 'ज़िला औसत का')}</>}</p>
    </section>
  )
}
