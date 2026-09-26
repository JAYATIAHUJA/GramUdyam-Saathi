import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GovBar } from '../../components/site'
import { SEED_CASES } from '../../data/cases'
import { makePlan } from '../../engine/plan'
import type { SocialCategory } from '../../engine/rules'
import { speak, stopSpeaking, useListen } from '../../lib/speech'
import { type Draft, useApp, useT } from '../../lib/store'
import { DemoPersonas } from './DemoPersonas'
import { QuestionBubble } from './QuestionBubble'
import { SidePanel } from './SidePanel'
import { StepHeader } from './StepHeader'
import { VoiceDock } from './VoiceDock'
import { draftToInput } from './draftToInput'
import { CATEGORY, EXPERIENCE, FAMILY, HOURS, INCOME, PROMPTS, TRAINING } from './questions'
import { ActivityStep } from './steps/ActivityStep'
import { Analyzing } from './steps/Analyzing'
import { FaceScale } from './steps/FaceScale'
import { MarginStep } from './steps/MarginStep'
import { NameStep } from './steps/NameStep'
import { Options } from './steps/OptionList'
import { SizeStep } from './steps/SizeStep'
import { VillageStep } from './steps/VillageStep'
import { WelcomeStep } from './steps/WelcomeStep'
import { useSpeechAnswer } from './useSpeechAnswer'

export default function Saathi() {
  const t = useT()
  const nav = useNavigate()
  const { lang, draft, patch, resetDraft, addCase, autoRead } = useApp()
  const step = draft.step
  const go = (s: number) => patch({ step: s })
  const next = () => go(step + 1)
  const back = () => go(Math.max(0, step - 1))
  const [heard, setHeard] = useState<string | null>(null)
  const [pending, setPending] = useState<number | null>(null) // spoken amount awaiting read-back confirmation
  const [villageQ, setVillageQ] = useState('')

  const prompt = PROMPTS[step] ?? PROMPTS[0]
  const promptText = t(prompt.en, prompt.hi)

  useEffect(() => {
    setHeard(null)
    if (autoRead && step > 0 && step < 13) speak(promptText, lang)
    return () => stopSpeaking()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, lang])

  const choose = <T,>(apply: (v: T) => Partial<Draft>) => (v: T) => {
    patch({ ...apply(v), step: step + 1 })
  }
  const onSpeech = useSpeechAnswer({ draft, patch, onHeard: setHeard, onVillageText: setVillageQ, onAmount: setPending })
  const mic = useListen(lang, onSpeech)

  const loadPersona = (i: number) => {
    const c = SEED_CASES[i]
    const inp = c.input
    patch({ name: inp.name, lgd: inp.lgd, margin: inp.margin, activity: inp.activity, sizeId: inp.sizeId, fit: inp.fit, category: inp.category, familyIncome: inp.familyIncome, step: 13 })
  }

  return (
    <div className="flex min-h-dvh flex-col bg-khadi/60 md:h-dvh md:overflow-hidden">
      <GovBar />
      <div className="flex flex-1 flex-col md:grid md:min-h-0 md:grid-cols-[minmax(0,1fr)_minmax(0,540px)] lg:grid-cols-[minmax(240px,1fr)_560px_minmax(240px,1fr)]">
      <SidePanel />

      {/* The phone */}
      <main id="main" className="relative flex flex-1 flex-col bg-paper md:overflow-hidden md:my-4 md:min-h-0 md:rounded-[28px] md:border md:border-line md:shadow-[0_30px_80px_-40px_rgba(28,37,102,0.55)]">
        <StepHeader step={step} onBack={back} />

        <div className="flex flex-1 flex-col px-5 pt-3 pb-2 md:min-h-0">
          {step > 0 && step < 13 && <QuestionBubble key={step} step={step} listening={mic.listening} />}

          <div className="flex-1 md:-mx-2 md:min-h-0 md:overflow-y-auto md:px-2 md:pb-1">
            {step === 0 && <WelcomeStep onStart={() => go(1)} onResume={draft.lgd ? () => go(draft.margin ? 3 : 2) : undefined} />}

            {step === 1 && <NameStep name={draft.name} onChange={(name) => patch({ name })} onNext={next} />}

            {step === 2 && <VillageStep q={villageQ} setQ={setVillageQ} onPick={(lgd) => patch({ lgd, step: 3 })} selected={draft.lgd} />}

            {step === 3 && <MarginStep value={draft.margin} pending={pending} onConfirm={(n) => { setPending(null); patch({ margin: n, step: 4 }) }} onReject={() => setPending(null)} />}

            {step === 4 && <ActivityStep draft={draft} onPick={(a) => patch({ activity: a, sizeId: null, step: 5 })} />}

            {step === 5 && draft.activity && <SizeStep draft={draft} onPick={(id) => patch({ sizeId: id, step: 6 })} />}

            {step === 6 && <Options opts={EXPERIENCE} value={draft.fit.experience} onPick={choose((v: 0 | 1 | 2) => ({ fit: { ...draft.fit, experience: v } }))} />}
            {step === 7 && <Options opts={FAMILY} value={draft.fit.familyLabour} onPick={choose((v: 0 | 1 | 2) => ({ fit: { ...draft.fit, familyLabour: v } }))} />}
            {step === 8 && <Options opts={HOURS} value={draft.fit.hours} onPick={choose((v: 0 | 1 | 2) => ({ fit: { ...draft.fit, hours: v } }))} />}
            {step === 9 && <Options opts={TRAINING} value={draft.fit.training} onPick={choose((v: 0 | 1) => ({ fit: { ...draft.fit, training: v } }))} grid />}
            {step === 10 && <FaceScale value={draft.fit.interest} onPick={choose((v: 1 | 2 | 3 | 4 | 5) => ({ fit: { ...draft.fit, interest: v } }))} />}
            {step === 11 && <Options opts={CATEGORY} value={draft.category ?? undefined} onPick={choose((v: SocialCategory) => ({ category: v }))} />}
            {step === 12 && <Options opts={INCOME} value={draft.familyIncome ?? undefined} onPick={choose((v: number) => ({ familyIncome: v }))} />}

            {step === 13 && (
              <Analyzing
                draft={draft}
                onDone={() => {
                  const input = draftToInput(draft)
                  const plan = makePlan(input, { alternatives: false })
                  addCase({ id: plan.id, input, createdAt: plan.createdAt, status: 'draft', channel: 'self', remarks: [] })
                  resetDraft()
                  nav(`/plan/${plan.id}`)
                }}
              />
            )}
          </div>

          {step > 0 && step < 13 && <VoiceDock key={step} mic={mic} heard={heard} onText={onSpeech} canNext={!!prompt.canNext?.(draft)} onNext={next} />}
        </div>
      </main>

      <DemoPersonas onPersona={loadPersona} />
      </div>
    </div>
  )
}
