import { clsx } from 'clsx'
import { Printer, Send, Timer, UserPlus } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from './Landing'
import { VerdictPill } from '../components/ui'
import { ACTIVITIES, activityByCode, sizeCost } from '../data/activities'
import { VILLAGES } from '../data/villages'
import { DEFAULT_FIT } from '../engine/founderFit'
import { makePlan, type PlanInput } from '../engine/plan'
import { inr, lakh, pct, dscr } from '../lib/format'
import { useAllCases } from '../lib/plans'
import { useApp, useT } from '../lib/store'

const BLANK: PlanInput = { name: '', lgd: '146021', activity: 'dairy', sizeId: null, margin: 50000, category: 'SC', familyIncome: 150000, fit: { ...DEFAULT_FIT }, mode: 'serviced' }

export default function Operator() {
  const t = useT()
  const nav = useNavigate()
  const addCase = useApp((s) => s.addCase)
  const queue = useAllCases().filter((c) => c.channel === 'vle')
  const [inp, setInp] = useState<PlanInput>(BLANK)
  const [editing, setEditing] = useState<string | null>(null)
  const [started, setStarted] = useState(Date.now())
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const set = (p: Partial<PlanInput>) => setInp((x) => ({ ...x, ...p }))
  const setFit = (p: Partial<PlanInput['fit']>) => setInp((x) => ({ ...x, fit: { ...x.fit, ...p } }))
  const plan = useMemo(() => makePlan({ ...inp, name: inp.name || 'Applicant' }, { alternatives: false, id: editing ?? 'DRAFT' }), [inp, editing])
  const r = plan.recommended
  const a = activityByCode(inp.activity)
  const elapsed = Math.floor((now - started) / 1000)

  const save = () => {
    const id = editing ?? 'GUS-' + Math.floor(Math.random() * 90000 + 10000)
    addCase({ id, input: { ...inp, name: inp.name || 'Applicant' }, createdAt: new Date().toISOString(), status: 'draft', channel: 'vle', remarks: [] })
    return id
  }

  return (
    <div className="min-h-dvh bg-paper">
      <TopNav />
      <div className="mx-auto grid max-w-[1400px] gap-5 px-4 py-6 lg:grid-cols-[260px_minmax(0,1fr)_380px]">
        <aside className="card self-start p-3">
          <button
            onClick={() => {
              setInp(BLANK)
              setEditing(null)
              setStarted(Date.now())
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo px-3 py-2.5 text-[14px] font-bold text-white"
          >
            <UserPlus className="size-4" /> {t('New applicant', 'नया आवेदक')}
          </button>
          <div className="mt-4 mb-1 px-1 text-[12.5px] font-semibold text-muted">{t('Today’s queue', 'आज की कतार')} ({queue.length})</div>
          <ul className="max-h-[70dvh] overflow-y-auto">
            {queue.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => {
                    setInp(c.input)
                    setEditing(c.id)
                    setStarted(Date.now())
                  }}
                  className={clsx('w-full rounded-lg px-2 py-2 text-left hover:bg-khadi', editing === c.id && 'bg-indigo-soft')}
                >
                  <div className="text-[14px] font-semibold">{activityByCode(c.input.activity).emoji} {c.input.name}</div>
                  <div className="text-[12px] text-muted">{c.id}, {VILLAGES.find((v) => v.lgd === c.input.lgd)?.name}</div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-[26px] font-bold text-indigo-deep">{t('Assisted plan — VLE / CRP-EP', 'सहायक योजना — VLE / CRP-EP')}</h1>
              <p className="text-[13px] text-muted">{t('Tab through the fields. Results update as you type.', 'Tab से आगे बढ़ें। नतीजे साथ-साथ बदलते हैं।')}</p>
            </div>
            <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-bold', elapsed > 600 ? 'bg-risk-soft text-risk' : 'bg-go-soft text-go')}>
              <Timer className="size-4" />
              {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')} / 10:00
            </span>
          </div>

          <Group title={t('Applicant', 'आवेदक')}>
            <F label={t('Full name', 'पूरा नाम')}>
              <input value={inp.name} onChange={(e) => set({ name: e.target.value })} className="inp" placeholder="e.g. Kamla Devi" autoFocus />
            </F>
            <F label={t('Village (LGD)', 'गाँव (LGD)')}>
              <select value={inp.lgd} onChange={(e) => set({ lgd: e.target.value })} className="inp">
                {VILLAGES.map((v) => (
                  <option key={v.lgd} value={v.lgd}>{v.name} — {v.block} ({v.lgd})</option>
                ))}
              </select>
            </F>
            <F label={t('Social category', 'वर्ग')}>
              <select value={inp.category} onChange={(e) => set({ category: e.target.value as PlanInput['category'] })} className="inp">
                <option value="SC">SC → NSFDC</option>
                <option value="OBC">OBC → NBCFDC</option>
                <option value="SAFAI">Safai Karamchari → NSKFDC</option>
              </select>
            </F>
            <F label={t('Family income / year (₹)', 'पारिवारिक आय / वर्ष (₹)')}>
              <input type="number" value={inp.familyIncome} onChange={(e) => set({ familyIncome: +e.target.value })} className="inp num" step={10000} />
            </F>
          </Group>

          <Group title={t('Business and money', 'काम और पैसा')}>
            <F label={t('Activity', 'काम')}>
              <select value={inp.activity} onChange={(e) => set({ activity: e.target.value, sizeId: null })} className="inp">
                {ACTIVITIES.map((x) => (
                  <option key={x.code} value={x.code}>{x.emoji} {x.name.en}</option>
                ))}
              </select>
            </F>
            <F label={t('Unit size', 'इकाई का आकार')}>
              <select value={inp.sizeId ?? ''} onChange={(e) => set({ sizeId: e.target.value || null })} className="inp">
                <option value="">{t('Auto (largest safe)', 'स्वतः (सबसे बड़ा सुरक्षित)')}</option>
                {a.sizes.map((s) => (
                  <option key={s.id} value={s.id}>{s.label.en} — {lakh(sizeCost(s))}</option>
                ))}
              </select>
            </F>
            <F label={t('Margin money (₹)', 'मार्जिन मनी (₹)')}>
              <input type="number" value={inp.margin} onChange={(e) => set({ margin: +e.target.value })} className="inp num" step={1000} />
            </F>
            <F label={t('Moratorium interest', 'मोहलत का ब्याज')}>
              <select value={inp.mode} onChange={(e) => set({ mode: e.target.value as PlanInput['mode'] })} className="inp">
                <option value="serviced">{t('Serviced (paid quarterly)', 'हर तिमाही भरा')}</option>
                <option value="capitalised">{t('Capitalised (added to loan)', 'लोन में जोड़ा')}</option>
              </select>
            </F>
          </Group>

          <Group title={t('Founder-Fit', 'फ़ाउंडर-फ़िट')}>
            <F label={t('Experience in this work', 'इस काम का अनुभव')}>
              <Seg value={inp.fit.experience} onChange={(v) => setFit({ experience: v as 0 | 1 | 2 })} opts={[[0, t('None', 'नहीं')], [1, '<2 yr'], [2, '2+ yr']]} />
            </F>
            <F label={t('Family members helping', 'मदद करने वाले सदस्य')}>
              <Seg value={inp.fit.familyLabour} onChange={(v) => setFit({ familyLabour: v as 0 | 1 | 2 })} opts={[[0, '0'], [1, '1'], [2, '2+']]} />
            </F>
            <F label={t('Hours per day', 'रोज़ के घंटे')}>
              <Seg value={inp.fit.hours} onChange={(v) => setFit({ hours: v as 0 | 1 | 2 })} opts={[[0, '<4'], [1, '4–8'], [2, t('Full', 'पूरा')]]} />
            </F>
            <F label={t('Training done', 'प्रशिक्षण')}>
              <Seg value={inp.fit.training} onChange={(v) => setFit({ training: v as 0 | 1 })} opts={[[0, t('No', 'नहीं')], [1, t('Yes', 'हाँ')]]} />
            </F>
            <F label={t('Interest (1–5)', 'रुचि (1–5)')}>
              <Seg value={inp.fit.interest} onChange={(v) => setFit({ interest: v as 1 | 2 | 3 | 4 | 5 })} opts={[[1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5']]} />
            </F>
          </Group>
        </main>

        <aside className="card self-start p-5 lg:sticky lg:top-4">
          <div className="flex items-center justify-between">
            <span className="font-display text-[19px] font-bold">{t('Live result', 'तुरंत नतीजा')}</span>
            <VerdictPill v={plan.verdict} />
          </div>
          {r.route.eligible && r.schedule ? (
            <>
              <div className="mt-4 text-[13px] text-muted">{t('Recommended loan', 'सुझाया लोन')}</div>
              <div className="num text-[40px] font-extrabold leading-none text-indigo-deep">{inr(r.loan)}</div>
              <div className="mt-1 text-[13px] text-muted">
                {t(r.unit.size.label.en, r.unit.size.label.hi)} · {r.route.rule!.corporation} {r.route.rule!.product} @ {(r.route.rule!.ratePa * 100).toFixed(1)}%
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
                <Kv k={t('Per quarter', 'प्रति तिमाही')} v={inr(r.schedule.instalment)} />
                <Kv k={t('Asked / naive', 'माँगा / सीधा')} v={`${lakh(plan.chosen.loan)} / ${lakh(plan.naive.loan)}`} />
                <Kv k="DSCR (min)" v={dscr(r.projection!.minDscr)} />
                <Kv k="P(default)" v={pct(r.mc?.pDefault ?? 0)} />
                <Kv k="Founder-Fit" v={`${plan.fit.score}/100`} />
                <Kv k={t('Saturation', 'भीड़')} v={`${plan.feasibility.saturation.index.toFixed(2)}×`} />
              </dl>
            </>
          ) : (
            <p className="mt-4 rounded-lg bg-risk-soft p-3 text-[14px]">{t(r.route.flags[0]?.en ?? '', r.route.flags[0]?.hi ?? '')}</p>
          )}
          <ul className="mt-4 space-y-1.5 text-[13px]">
            {[...plan.reasons, ...[...plan.naive.route.flags, ...r.route.flags].filter((f, i, arr) => arr.findIndex((x) => x.code === f.code) === i)].slice(0, 5).map((x, i) => (
              <li key={i} className="rounded-md bg-khadi px-2.5 py-1.5">{t(x.en, x.hi)}</li>
            ))}
          </ul>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                const id = save()
                nav(`/dpr/${id}`)
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border-2 border-line px-3 py-2.5 text-[14px] font-bold"
            >
              <Printer className="size-4" /> {t('Print DPR', 'DPR प्रिंट')}
            </button>
            <button
              onClick={() => {
                const id = save()
                nav(`/officer/${id}`)
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-go px-3 py-2.5 text-[14px] font-bold text-white"
            >
              <Send className="size-4" /> {t('Send to SCA', 'SCA को भेजें')}
            </button>
          </div>
        </aside>
      </div>
      <style>{`.inp{width:100%;border:1px solid var(--color-line);background:#fff;border-radius:8px;padding:8px 10px;font-size:15px}.inp:focus{outline:2px solid var(--color-indigo);outline-offset:0}`}</style>
    </div>
  )
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="mt-6">
      <legend className="mb-3 font-display text-[17px] font-bold text-indigo">{title}</legend>
      <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">{children}</div>
    </fieldset>
  )
}

function F({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] font-semibold text-muted">{label}</span>
      {children}
    </label>
  )
}

function Seg({ value, onChange, opts }: { value: number; onChange: (v: number) => void; opts: [number, string][] }) {
  return (
    <div className="flex rounded-lg border border-line bg-white p-0.5" role="radiogroup">
      {opts.map(([v, l]) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)} className={clsx('flex-1 rounded-md px-2 py-1.5 text-[14px] font-semibold', value === v ? 'bg-indigo text-white' : 'text-muted hover:text-ink')}>
          {l}
        </button>
      ))}
    </div>
  )
}

function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg bg-khadi px-2.5 py-2">
      <dt className="text-muted">{k}</dt>
      <dd className="num text-[17px] font-bold">{v}</dd>
    </div>
  )
}
