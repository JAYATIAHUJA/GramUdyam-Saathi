import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../../components/site'
import { makePlan, type PlanInput } from '../../engine/plan'
import { useApp } from '../../lib/store'
import { MobileResultBar } from './MobileResultBar'
import { PlanForm } from './PlanForm'
import { QueuePanel } from './QueuePanel'
import { ResultPanel } from './ResultPanel'
import { BLANK } from './blank'
import { ALL_FILLED, type FieldKey, REQUIRED } from './types'

export default function Operator() {
  const nav = useNavigate()
  const addCase = useApp((s) => s.addCase)
  const [inp, setInp] = useState<PlanInput>(BLANK)
  // Which answers the helper has actually given. A new applicant starts with none, so nothing is guessed.
  const [filled, setFilled] = useState<Set<FieldKey>>(() => new Set())
  const [editing, setEditing] = useState<string | null>(null)
  const [started, setStarted] = useState(Date.now())
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  // A cleared name counts as unanswered again; every other field stays answered once touched.
  const mark = (p: Record<string, unknown>) =>
    setFilled((f) => {
      const n = new Set(f)
      for (const k of Object.keys(p) as FieldKey[]) {
        if (!ALL_FILLED.has(k)) continue
        if (k === 'name' && !String(p.name).trim()) n.delete(k)
        else n.add(k)
      }
      return n
    })
  const set = (p: Partial<PlanInput>) => {
    setInp((x) => ({ ...x, ...p }))
    mark(p)
  }
  const setFit = (p: Partial<PlanInput['fit']>) => {
    setInp((x) => ({ ...x, fit: { ...x.fit, ...p } }))
    mark(p)
  }
  const missing = REQUIRED.filter((r) => !filled.has(r.key))
  const ready = missing.length === 0
  const plan = useMemo(() => makePlan({ ...inp, name: inp.name || 'Applicant' }, { alternatives: false, id: editing ?? 'DRAFT' }), [inp, editing])
  const elapsed = Math.floor((now - started) / 1000)

  const save = () => {
    const id = editing ?? 'GUS-' + Math.floor(Math.random() * 90000 + 10000)
    addCase({ id, input: { ...inp, name: inp.name || 'Applicant' }, createdAt: new Date().toISOString(), status: 'draft', channel: 'vle', remarks: [] })
    return id
  }
  const open = (input: PlanInput, id: string | null) => {
    setInp(input)
    setFilled(id ? new Set(ALL_FILLED) : new Set())
    setEditing(id)
    setStarted(Date.now())
  }

  return (
    // From lg up this is a single-screen workspace; each column scrolls on its own if it must.
    <div className="flex min-h-dvh flex-col bg-khadi/60 lg:h-dvh lg:overflow-hidden">
      <TopNav />
      <div id="main" className="mx-auto grid w-full max-w-[1500px] flex-1 grid-cols-1 gap-3 p-3 lg:min-h-0 lg:grid-cols-[250px_minmax(0,1fr)_340px] [&>*]:min-w-0">
        <QueuePanel editing={editing} onOpen={open} />
        <PlanForm inp={inp} filled={filled} set={set} setFit={setFit} editing={editing} elapsed={elapsed} />
        <ResultPanel plan={plan} activity={inp.activity} missing={missing} onPrint={() => nav(`/dpr/${save()}`)} onSend={() => nav(`/officer/${save()}`)} />
      </div>
      {ready && <MobileResultBar plan={plan} onSend={() => nav(`/officer/${save()}`)} />}
    </div>
  )
}
