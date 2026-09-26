import { clsx } from 'clsx'
import { ArrowLeft, Check, ChevronRight, Keyboard, LocateFixed, Search, Sparkles, Volume2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConfidenceBadge, LangToggle, Logo, MicButton } from '../components/ui'
import { ACTIVITIES, activityByCode, sizeCost } from '../data/activities'
import { SEED_CASES } from '../data/cases'
import { searchVillages, villageByLgd } from '../data/villages'
import { assessFeasibility } from '../engine/feasibility'
import { DEFAULT_FIT, type FitAnswers } from '../engine/founderFit'
import { parseAmount } from '../engine/guard'
import { buildScenario, makePlan, type PlanInput } from '../engine/plan'
import { naiveCeiling } from '../engine/router'
import { RULESET_VERSION, type SocialCategory } from '../engine/rules'
import { inr, lakh } from '../lib/format'
import { matchActivity, speak, stopSpeaking, useListen } from '../lib/speech'
import { useApp, useT, type Draft } from '../lib/store'

type Opt<T> = { v: T; emoji: string; en: string; hi: string; keys: string[] }

const EXPERIENCE: Opt<0 | 1 | 2>[] = [
  { v: 0, emoji: '🙅', en: 'No, never', hi: 'नहीं, कभी नहीं', keys: ['nahi', 'no', 'नहीं', 'kabhi'] },
  { v: 1, emoji: '🤏', en: 'A little (under 2 years)', hi: 'थोड़ा (2 साल से कम)', keys: ['thoda', 'little', 'थोड़ा', 'kuch'] },
  { v: 2, emoji: '💪', en: 'Yes, 2+ years', hi: 'हाँ, 2 साल से ज़्यादा', keys: ['haan', 'yes', 'हाँ', 'saal', 'years'] },
]
const FAMILY: Opt<0 | 1 | 2>[] = [
  { v: 0, emoji: '🧍', en: 'Nobody, just me', hi: 'कोई नहीं, सिर्फ़ मैं', keys: ['koi nahi', 'nobody', 'कोई नहीं', 'akela', 'akeli'] },
  { v: 1, emoji: '👫', en: 'One family member', hi: 'परिवार का एक सदस्य', keys: ['ek', 'one', 'एक'] },
  { v: 2, emoji: '👨‍👩‍👧', en: 'Two or more', hi: 'दो या ज़्यादा', keys: ['do', 'two', 'दो', 'teen', 'zyada'] },
]
const HOURS: Opt<0 | 1 | 2>[] = [
  { v: 0, emoji: '🌤️', en: 'Under 4 hours', hi: '4 घंटे से कम', keys: ['kam', 'less', 'कम', 'do ghante'] },
  { v: 1, emoji: '⏱️', en: '4 to 8 hours', hi: '4 से 8 घंटे', keys: ['chaar', 'aath', 'चार', 'आठ', '4', '8'] },
  { v: 2, emoji: '🌞', en: 'The whole day', hi: 'पूरा दिन', keys: ['pura', 'poora', 'whole', 'पूरा', 'din'] },
]
const TRAINING: Opt<0 | 1>[] = [
  { v: 1, emoji: '🎓', en: 'Yes, I have', hi: 'हाँ, लिया है', keys: ['haan', 'yes', 'हाँ', 'liya'] },
  { v: 0, emoji: '➖', en: 'Not yet', hi: 'अभी नहीं', keys: ['nahi', 'no', 'नहीं'] },
]
const INTEREST: Opt<1 | 2 | 3 | 4 | 5>[] = [
  { v: 1, emoji: '😟', en: 'Not at all', hi: 'बिल्कुल नहीं', keys: ['bilkul nahi'] },
  { v: 2, emoji: '🙁', en: 'A little', hi: 'थोड़ा', keys: ['thoda'] },
  { v: 3, emoji: '😐', en: 'Okay', hi: 'ठीक है', keys: ['theek', 'okay', 'ठीक'] },
  { v: 4, emoji: '🙂', en: 'I like it', hi: 'पसंद है', keys: ['pasand', 'like', 'पसंद'] },
  { v: 5, emoji: '😍', en: 'I love it', hi: 'बहुत पसंद', keys: ['bahut', 'love', 'बहुत'] },
]
const CATEGORY: Opt<SocialCategory>[] = [
  { v: 'SC', emoji: '🪪', en: 'Scheduled Caste (SC)', hi: 'अनुसूचित जाति (SC)', keys: ['sc', 'anusuchit', 'अनुसूचित', 'scheduled'] },
  { v: 'OBC', emoji: '🪪', en: 'Other Backward Class (OBC)', hi: 'अन्य पिछड़ा वर्ग (OBC)', keys: ['obc', 'pichda', 'पिछड़ा', 'backward'] },
  { v: 'SAFAI', emoji: '🧹', en: 'Safai Karamchari family', hi: 'सफ़ाई कर्मचारी परिवार', keys: ['safai', 'सफ़ाई', 'सफाई'] },
]
const INCOME: Opt<number>[] = [
  { v: 80000, emoji: '₹', en: 'Under ₹1 lakh a year', hi: 'सालाना ₹1 लाख से कम', keys: ['ek lakh se kam', 'kam', 'under'] },
  { v: 150000, emoji: '₹₹', en: '₹1–2 lakh a year', hi: 'सालाना ₹1–2 लाख', keys: ['do lakh', 'dedh'] },
  { v: 250000, emoji: '₹₹₹', en: '₹2–3 lakh a year', hi: 'सालाना ₹2–3 लाख', keys: ['teen lakh', 'dhai'] },
  { v: 350000, emoji: '💰', en: 'Above ₹3 lakh a year', hi: 'सालाना ₹3 लाख से ज़्यादा', keys: ['zyada', 'above', 'ज़्यादा'] },
]

const LANGS = [
  { code: 'hi', label: 'हिंदी', sample: 'नमस्ते' },
  { code: 'en', label: 'English', sample: 'Hello' },
  { code: 'bho', label: 'भोजपुरी', sample: 'प्रणाम' },
  { code: 'or', label: 'ଓଡ଼ିଆ', sample: 'ନମସ୍କାର' },
  { code: 'bn', label: 'বাংলা', sample: 'নমস্কার' },
  { code: 'mr', label: 'मराठी', sample: 'नमस्कार' },
  { code: 'ta', label: 'தமிழ்', sample: 'வணக்கம்' },
  { code: 'te', label: 'తెలుగు', sample: 'నమస్కారం' },
]

const STAGES = [
  { en: 'Place', hi: 'जगह', steps: [1, 2] },
  { en: 'Money', hi: 'पैसा', steps: [3] },
  { en: 'Work', hi: 'काम', steps: [4, 5] },
  { en: 'You', hi: 'आप', steps: [6, 7, 8, 9, 10, 11, 12] },
  { en: 'Report', hi: 'रिपोर्ट', steps: [13] },
]

function matchOpt<T>(text: string, opts: Opt<T>[]): Opt<T> | null {
  const t = text.toLowerCase()
  return opts.find((o) => o.keys.some((k) => t.includes(k.toLowerCase())) || t.includes(o.hi.toLowerCase()) || t.includes(o.en.toLowerCase())) ?? null
}

function draftToInput(d: Draft): PlanInput {
  return {
    name: d.name || 'Saathi user',
    lgd: d.lgd!,
    activity: d.activity!,
    sizeId: d.sizeId,
    margin: d.margin!,
    category: d.category ?? 'SC',
    familyIncome: d.familyIncome ?? 150000,
    fit: { ...DEFAULT_FIT, ...d.fit } as FitAnswers,
    mode: d.mode,
  }
}

export default function Saathi() {
  const t = useT()
  const nav = useNavigate()
  const { lang, setLang, draft, patch, resetDraft, addCase, autoRead, setAutoRead } = useApp()
  const step = draft.step
  const go = (s: number) => patch({ step: s })
  const next = () => go(step + 1)
  const back = () => go(Math.max(0, step - 1))
  const [heard, setHeard] = useState<string | null>(null)
  const [pending, setPending] = useState<number | null>(null) // spoken amount awaiting read-back confirmation
  const [villageQ, setVillageQ] = useState('')
  const [typing, setTyping] = useState(false)

  const prompt = PROMPTS[step] ?? PROMPTS[0]
  const promptText = t(prompt.en, prompt.hi)

  useEffect(() => {
    setHeard(null)
    setTyping(false)
    if (autoRead && step > 0 && step < 13) speak(promptText, lang)
    return () => stopSpeaking()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, lang])

  const choose = <T,>(apply: (v: T) => Partial<Draft>) => (v: T) => {
    patch({ ...apply(v), step: step + 1 })
  }

  const onSpeech = (text: string) => {
    setHeard(text)
    if (step === 1) patch({ name: text.replace(/(mera|meri|naam|name|is|my|मेरा|नाम|है)/gi, '').trim() || text })
    else if (step === 2) setVillageQ(text)
    else if (step === 3) {
      const n = parseAmount(text)
      if (n) setPending(n)
    } else if (step === 4) {
      const a = matchActivity(text)
      if (a) patch({ activity: a, sizeId: null, step: 5 })
    } else if (step === 6) {
      const o = matchOpt(text, EXPERIENCE)
      if (o) choose<0 | 1 | 2>((v) => ({ fit: { ...draft.fit, experience: v } }))(o.v)
    } else if (step === 7) {
      const o = matchOpt(text, FAMILY)
      if (o) choose<0 | 1 | 2>((v) => ({ fit: { ...draft.fit, familyLabour: v } }))(o.v)
    } else if (step === 8) {
      const o = matchOpt(text, HOURS)
      if (o) choose<0 | 1 | 2>((v) => ({ fit: { ...draft.fit, hours: v } }))(o.v)
    } else if (step === 9) {
      const o = matchOpt(text, TRAINING)
      if (o) choose<0 | 1>((v) => ({ fit: { ...draft.fit, training: v } }))(o.v)
    } else if (step === 10) {
      const o = matchOpt(text, INTEREST)
      if (o) choose<1 | 2 | 3 | 4 | 5>((v) => ({ fit: { ...draft.fit, interest: v } }))(o.v)
    } else if (step === 11) {
      const o = matchOpt(text, CATEGORY)
      if (o) choose<SocialCategory>((v) => ({ category: v }))(o.v)
    } else if (step === 12) {
      const n = parseAmount(text)
      if (n) patch({ familyIncome: n, step: 13 })
    }
  }
  const mic = useListen(lang, onSpeech)

  const loadPersona = (i: number) => {
    const c = SEED_CASES[i]
    const inp = c.input
    patch({ name: inp.name, lgd: inp.lgd, margin: inp.margin, activity: inp.activity, sizeId: inp.sizeId, fit: inp.fit, category: inp.category, familyIncome: inp.familyIncome, step: 13 })
  }

  const stageIdx = STAGES.findIndex((s) => s.steps.includes(step))

  return (
    <div className="min-h-dvh bg-khadi/60 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,440px)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_440px_minmax(360px,1fr)]">
      <aside className="hidden md:flex flex-col justify-between p-8">
        <Logo />
        <div className="max-w-xs text-[14px] text-muted">
          <p className="font-display text-[22px] font-bold leading-tight text-indigo-deep">{t('One question at a time. Speak or tap.', 'एक बार में एक सवाल। बोलिए या छुइए।')}</p>
          <p className="mt-3">{t('Designed for entry-level Android phones. Answers are saved on the phone if the network drops.', 'सस्ते Android फ़ोन के लिए बना। नेटवर्क जाए तो भी जवाब फ़ोन में सुरक्षित।')}</p>
          <label className="mt-5 flex items-center gap-2 font-semibold text-ink">
            <input type="checkbox" checked={autoRead} onChange={(e) => setAutoRead(e.target.checked)} className="size-4 accent-indigo" />
            {t('Read every question aloud', 'हर सवाल बोलकर सुनाएँ')}
          </label>
        </div>
        <div />
      </aside>

      {/* The phone */}
      <main className="relative flex min-h-dvh flex-col bg-paper md:my-6 md:min-h-[calc(100dvh-3rem)] md:rounded-[28px] md:border md:border-line md:shadow-[0_30px_80px_-40px_rgba(28,37,102,0.55)] overflow-hidden">
        <header className="flex items-center justify-between gap-2 px-4 pt-4">
          {step > 0 ? (
            <button onClick={back} className="grid size-10 place-items-center rounded-full hover:bg-khadi" aria-label={t('Back', 'पीछे')}>
              <ArrowLeft className="size-5" />
            </button>
          ) : (
            <Logo compact />
          )}
          {step > 0 && step < 13 && (
            <ol className="flex flex-1 items-center justify-center gap-1.5" aria-label={t('Progress', 'प्रगति')}>
              {STAGES.map((s, i) => (
                <li key={s.en} className="flex flex-col items-center gap-1">
                  <span className={clsx('h-1.5 rounded-full transition-all', i < stageIdx ? 'w-8 bg-indigo' : i === stageIdx ? 'w-10 bg-marigold' : 'w-8 bg-line')} />
                  <span className={clsx('text-[10.5px] font-semibold', i === stageIdx ? 'text-ink' : 'text-muted')}>{t(s.en, s.hi)}</span>
                </li>
              ))}
            </ol>
          )}
          <LangToggle className="scale-90" />
        </header>

        <div className="flex flex-1 flex-col px-5 pt-6 pb-4">
          {step > 0 && step < 13 && (
            <div className="mb-5">
              <div className="flex items-start gap-3">
                <h1 className="flex-1 font-display text-[28px] font-bold leading-[1.15] text-indigo-deep">{promptText}</h1>
                <button onClick={() => speak(promptText, lang)} className="mt-1 grid size-10 shrink-0 place-items-center rounded-full bg-indigo-soft text-indigo" aria-label={t('Hear the question', 'सवाल सुनें')}>
                  <Volume2 className="size-5" />
                </button>
              </div>
              {prompt.subEn && <p className="mt-1.5 text-[15px] text-muted">{t(prompt.subEn, prompt.subHi!)}</p>}
            </div>
          )}

          <div className="flex-1">
            {step === 0 && (
              <div>
                <div className="mt-2 mb-6">
                  <p className="font-display text-[34px] font-extrabold leading-[1.05] text-indigo-deep">लोन लेने से पहले, सही फ़ैसला।</p>
                  <p className="mt-2 text-[16px] text-muted">{t('Choose your language. You can speak or tap.', 'अपनी भाषा चुनें। आप बोल भी सकते हैं, छू भी सकते हैं।')}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {LANGS.map((l) => {
                    const live = l.code === 'hi' || l.code === 'en'
                    return (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLang(l.code === 'en' ? 'en' : 'hi')
                          go(1)
                        }}
                        className={clsx('card flex flex-col items-start p-4 text-left transition-colors hover:border-indigo/50', lang === l.code && 'ring-2 ring-indigo')}
                      >
                        <span className="font-display text-[24px] font-bold leading-tight">{l.label}</span>
                        <span className="text-[13px] text-muted">{l.sample}</span>
                        {!live && <span className="mt-1.5 rounded bg-khadi px-1.5 text-[10.5px] font-semibold text-muted">{t('Bhashini, Phase 2 → Hindi now', 'भाषिणी, चरण 2 → अभी हिंदी')}</span>}
                      </button>
                    )
                  })}
                </div>
                {draft.lgd && (
                  <button onClick={() => go(draft.margin ? 3 : 2)} className="mt-5 w-full rounded-xl border border-indigo/30 bg-indigo-soft px-4 py-3 text-[15px] font-semibold text-indigo">
                    {t('Continue where you left off', 'जहाँ छोड़ा था वहीं से जारी रखें')}
                  </button>
                )}
              </div>
            )}

            {step === 1 && (
              <div>
                <input
                  autoFocus
                  value={draft.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && draft.name && next()}
                  placeholder={t('e.g. Sunita Devi', 'जैसे सुनीता देवी')}
                  className="w-full rounded-xl border-2 border-line bg-white px-4 py-4 font-display text-[24px] font-semibold outline-none focus:border-indigo"
                />
                <p className="mt-3 text-[13px] text-muted">{t('Only used on your report. Not shared with the AI.', 'सिर्फ़ आपकी रिपोर्ट पर। AI को नहीं भेजा जाता।')}</p>
              </div>
            )}

            {step === 2 && <VillageStep q={villageQ} setQ={setVillageQ} onPick={(lgd) => patch({ lgd, step: 3 })} selected={draft.lgd} />}

            {step === 3 && <MarginStep value={pending ?? draft.margin} pending={pending} onConfirm={(n) => { setPending(null); patch({ margin: n, step: 4 }) }} onReject={() => setPending(null)} onSet={(n) => patch({ margin: n })} />}

            {step === 4 && <ActivityStep draft={draft} onPick={(a) => patch({ activity: a, sizeId: null, step: 5 })} />}

            {step === 5 && draft.activity && <SizeStep draft={draft} onPick={(id) => patch({ sizeId: id, step: 6 })} />}

            {step === 6 && <Options opts={EXPERIENCE} value={draft.fit.experience} onPick={choose((v: 0 | 1 | 2) => ({ fit: { ...draft.fit, experience: v } }))} />}
            {step === 7 && <Options opts={FAMILY} value={draft.fit.familyLabour} onPick={choose((v: 0 | 1 | 2) => ({ fit: { ...draft.fit, familyLabour: v } }))} />}
            {step === 8 && <Options opts={HOURS} value={draft.fit.hours} onPick={choose((v: 0 | 1 | 2) => ({ fit: { ...draft.fit, hours: v } }))} />}
            {step === 9 && <Options opts={TRAINING} value={draft.fit.training} onPick={choose((v: 0 | 1) => ({ fit: { ...draft.fit, training: v } }))} grid />}
            {step === 10 && <EmojiScale value={draft.fit.interest} onPick={choose((v: 1 | 2 | 3 | 4 | 5) => ({ fit: { ...draft.fit, interest: v } }))} />}
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

          {/* Voice dock */}
          {step > 0 && step < 13 && (
            <div className="sticky bottom-0 -mx-5 mt-6 border-t border-line bg-paper/95 px-5 pt-4 pb-5 backdrop-blur">
              {(mic.interim || heard) && (
                <p className="mb-3 rounded-lg bg-white px-3 py-2 text-[15px] shadow-sm">
                  <span className="text-muted">{t('Heard', 'सुना')}: </span>“{mic.listening ? mic.interim : heard}”
                </p>
              )}
              {mic.error && (
                <p className="mb-3 text-[13px] text-caution">
                  {mic.error === 'unsupported' ? t('Voice needs Chrome on Android or desktop. You can tap instead.', 'आवाज़ के लिए Chrome चाहिए। आप छूकर भी चुन सकते हैं।') : t('Could not hear. Tap the mic and try again.', 'सुनाई नहीं दिया। माइक दबाकर फिर बोलें।')}
                </p>
              )}
              <div className="flex items-center justify-between gap-3">
                <button onClick={() => setTyping((x) => !x)} className="grid size-12 place-items-center rounded-full border border-line bg-white text-muted" aria-label={t('Type instead', 'टाइप करें')}>
                  <Keyboard className="size-5" />
                </button>
                <div className="flex flex-col items-center gap-1.5">
                  <MicButton listening={mic.listening} onClick={mic.listening ? mic.stop : mic.start} />
                  <span className="text-[13px] font-bold text-indigo">{mic.listening ? t('Listening…', 'सुन रहे हैं…') : t('Tap and speak', 'दबाइए और बोलिए')}</span>
                </div>
                {prompt.canNext?.(draft) ? (
                  <button onClick={next} className="grid size-12 place-items-center rounded-full bg-indigo text-white" aria-label={t('Next', 'आगे')}>
                    <ChevronRight className="size-6" />
                  </button>
                ) : (
                  <span className="size-12" />
                )}
              </div>
              {typing && (
                <form
                  className="mt-3 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const v = new FormData(e.currentTarget).get('q') as string
                    if (v) onSpeech(v)
                    e.currentTarget.reset()
                  }}
                >
                  <input name="q" autoFocus placeholder={t('Type your answer', 'जवाब लिखें')} className="flex-1 rounded-lg border border-line bg-white px-3 py-2" />
                  <button className="rounded-lg bg-indigo px-4 font-semibold text-white">{t('Send', 'भेजें')}</button>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      <EngineTrace draft={draft} pending={pending} onPersona={loadPersona} />
    </div>
  )
}

const PROMPTS: Record<number, { en: string; hi: string; subEn?: string; subHi?: string; canNext?: (d: Draft) => boolean }> = {
  0: { en: '', hi: '' },
  1: { en: 'What is your name?', hi: 'आपका नाम क्या है?', canNext: (d) => !!d.name },
  2: { en: 'Which village do you live in?', hi: 'आप किस गाँव में रहते हैं?', subEn: 'Say the village or gram panchayat name.', subHi: 'गाँव या ग्राम पंचायत का नाम बोलिए।', canNext: (d) => !!d.lgd },
  3: { en: 'How much money can you put in yourself?', hi: 'आप अपनी तरफ़ से कितना पैसा लगा सकते हैं?', subEn: 'Your own savings — the margin money.', subHi: 'आपकी अपनी बचत — मार्जिन मनी।', canNext: (d) => !!d.margin },
  4: { en: 'What work do you want to start?', hi: 'आप कौन-सा काम शुरू करना चाहते हैं?', canNext: (d) => !!d.activity },
  5: { en: 'How big do you want to start?', hi: 'कितना बड़ा शुरू करना चाहते हैं?', subEn: 'Not sure? Let Saathi pick the size your repayment can carry.', subHi: 'पक्का नहीं? साथी वह आकार चुनेगा जिसकी किस्त आप चुका सकें।', canNext: () => true },
  6: { en: 'Have you done this work before?', hi: 'क्या आपने यह काम पहले किया है?' },
  7: { en: 'Who at home will help you?', hi: 'घर से कौन मदद करेगा?' },
  8: { en: 'How many hours a day can you give?', hi: 'रोज़ कितने घंटे दे पाएँगे?' },
  9: { en: 'Have you taken any training for it?', hi: 'क्या इसका कोई प्रशिक्षण लिया है?' },
  10: { en: 'How much do you like this work?', hi: 'यह काम आपको कितना पसंद है?' },
  11: { en: 'Which group does your family belong to?', hi: 'आपका परिवार किस वर्ग में आता है?', subEn: 'This decides which corporation lends to you.', subHi: 'इससे तय होता है कि कौन-सा निगम लोन देगा।' },
  12: { en: 'What is your family’s yearly income?', hi: 'परिवार की सालाना आमदनी कितनी है?', subEn: 'NSFDC and NBCFDC lend up to ₹3 lakh family income.', subHi: 'NSFDC और NBCFDC ₹3 लाख तक की आय पर लोन देते हैं।' },
}

function Options<T>({ opts, value, onPick, grid }: { opts: Opt<T>[]; value?: T; onPick: (v: T) => void; grid?: boolean }) {
  const t = useT()
  return (
    <div className={grid ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
      {opts.map((o) => (
        <button
          key={String(o.v)}
          onClick={() => onPick(o.v)}
          className={clsx(
            'card flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:border-indigo/50',
            grid && 'flex-col items-start',
            value === o.v && 'border-indigo ring-2 ring-indigo/30',
          )}
        >
          <span className="text-[30px] leading-none" aria-hidden>{o.emoji}</span>
          <span className="flex-1 text-[18px] font-semibold">{t(o.en, o.hi)}</span>
          {value === o.v && <Check className="size-5 text-indigo" />}
        </button>
      ))}
    </div>
  )
}

function EmojiScale({ value, onPick }: { value?: number; onPick: (v: 1 | 2 | 3 | 4 | 5) => void }) {
  const t = useT()
  const [hover, setHover] = useState<number | null>(null)
  const cur = hover ?? value
  return (
    <div>
      <div className="flex justify-between gap-1">
        {INTEREST.map((o) => (
          <button
            key={o.v}
            onClick={() => onPick(o.v)}
            onMouseEnter={() => setHover(o.v)}
            onMouseLeave={() => setHover(null)}
            aria-label={t(o.en, o.hi)}
            className={clsx('grid aspect-square flex-1 place-items-center rounded-2xl border-2 text-[36px] transition-transform', cur === o.v ? 'scale-110 border-indigo bg-indigo-soft' : 'border-transparent bg-white')}
          >
            {o.emoji}
          </button>
        ))}
      </div>
      <p className="mt-4 text-center font-display text-[22px] font-bold text-indigo">{cur ? t(INTEREST[cur - 1].en, INTEREST[cur - 1].hi) : t('Tap a face', 'एक चेहरा चुनें')}</p>
    </div>
  )
}

function VillageStep({ q, setQ, onPick, selected }: { q: string; setQ: (s: string) => void; onPick: (lgd: string) => void; selected: string | null }) {
  const t = useT()
  const results = useMemo(() => searchVillages(q, 3), [q])
  const [gps, setGps] = useState(false)
  return (
    <div>
      <label className="flex items-center gap-2 rounded-xl border-2 border-line bg-white px-3 py-3 focus-within:border-indigo">
        <Search className="size-5 text-muted" />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Type or say: Sirauli', 'लिखें या बोलें: सिरौली')} className="flex-1 bg-transparent text-[18px] outline-none" />
        {q && (
          <button onClick={() => setQ('')} aria-label={t('Clear', 'मिटाएँ')}>
            <X className="size-4 text-muted" />
          </button>
        )}
      </label>
      <p className="mt-4 mb-2 text-[13px] font-semibold text-muted">{q ? t('Closest matches', 'सबसे मिलते-जुलते') : t('Villages near you', 'आपके पास के गाँव')}</p>
      <div className="space-y-2.5">
        {results.map(({ village: v, score }) => (
          <button key={v.lgd} onClick={() => onPick(v.lgd)} className={clsx('card flex w-full items-center gap-3 px-4 py-3 text-left hover:border-indigo/50', selected === v.lgd && 'border-indigo ring-2 ring-indigo/30')}>
            <span className="grid size-10 place-items-center rounded-full bg-indigo-soft font-display text-[18px] font-bold text-indigo">{v.nameHi[0]}</span>
            <span className="flex-1">
              <span className="block text-[18px] font-semibold">{t(v.name, v.nameHi)}</span>
              <span className="text-[13px] text-muted">
                {t(`${v.block} block, Barabanki`, `${v.blockHi} ब्लॉक, बाराबंकी`)} · LGD {v.lgd}
              </span>
            </span>
            {q && <span className="text-[12px] font-semibold text-muted">{Math.round(score * 100)}%</span>}
          </button>
        ))}
      </div>
      <button
        onClick={() => {
          setGps(true)
          setTimeout(() => onPick('146021'), 700)
        }}
        className="mt-4 inline-flex items-center gap-2 text-[15px] font-semibold text-indigo"
      >
        <LocateFixed className={clsx('size-4', gps && 'animate-spin')} />
        {gps ? t('Finding you…', 'आपकी जगह ढूँढ रहे हैं…') : t('Use my location', 'मेरी लोकेशन लें')}
      </button>
      <p className="mt-2 text-[13px] text-muted">{t('Village not listed? Your VLE can add it; the plan will use block averages marked “Low confidence”.', 'गाँव नहीं मिला? आपके VLE जोड़ सकते हैं; योजना ब्लॉक औसत से बनेगी, “कम भरोसा” के साथ।')}</p>
    </div>
  )
}

function MarginStep({ value, pending, onConfirm, onReject, onSet }: { value: number | null; pending: number | null; onConfirm: (n: number) => void; onReject: () => void; onSet: (n: number) => void }) {
  const t = useT()
  const v = value ?? 0
  const chips = [10000, 25000, 50000, 100000, 200000]
  const toSlider = (n: number) => Math.round((Math.log10(Math.max(n, 5000)) - Math.log10(5000)) / (Math.log10(1000000) - Math.log10(5000)) * 100)
  const fromSlider = (s: number) => {
    const n = Math.pow(10, Math.log10(5000) + (s / 100) * (Math.log10(1000000) - Math.log10(5000)))
    const step = n < 50000 ? 1000 : n < 200000 ? 5000 : 10000
    return Math.round(n / step) * step
  }
  if (pending) {
    return (
      <div className="card p-5 text-center">
        <p className="text-[15px] text-muted">{t('You said', 'आपने कहा')}</p>
        <p className="num my-2 text-[48px] font-extrabold text-indigo-deep">{inr(pending)}</p>
        <p className="text-[17px] font-semibold">{t('Is that right?', 'क्या यह सही है?')}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button onClick={onReject} className="rounded-xl border-2 border-line py-3 text-[17px] font-bold">{t('No', 'नहीं')}</button>
          <button onClick={() => onConfirm(pending)} className="rounded-xl bg-go py-3 text-[17px] font-bold text-white">{t('Yes, correct', 'हाँ, सही है')}</button>
        </div>
      </div>
    )
  }
  return (
    <div>
      <div className="text-center">
        <span className="num text-[52px] font-extrabold leading-none text-indigo-deep">{v ? inr(v) : '₹ —'}</span>
      </div>
      <input type="range" min={0} max={100} value={v ? toSlider(v) : 0} onChange={(e) => onSet(fromSlider(+e.target.value))} className="mt-6 w-full accent-indigo" aria-label={t('Amount', 'रकम')} />
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {chips.map((c) => (
          <button key={c} onClick={() => onSet(c)} className={clsx('rounded-lg border-2 px-3 py-2 num text-[17px] font-bold', v === c ? 'border-go bg-go-soft text-go' : 'border-[#d8ceb6] bg-[#fbf6e8] text-ink')}>
            {lakh(c)}
          </button>
        ))}
      </div>
      {v > 0 && (
        <button onClick={() => onConfirm(v)} className="mt-6 w-full rounded-xl bg-indigo py-3.5 text-[17px] font-bold text-white">
          {t(`Yes, ${inr(v)}`, `हाँ, ${inr(v)}`)}
        </button>
      )}
    </div>
  )
}

function ActivityStep({ draft, onPick }: { draft: Draft; onPick: (a: string) => void }) {
  const t = useT()
  const [thinking, setThinking] = useState(false)
  const suggest = () => {
    if (!draft.lgd || !draft.margin) return
    setThinking(true)
    setTimeout(() => {
      const v = villageByLgd(draft.lgd!)!
      let best = { code: 'dairy', score: -1 }
      for (const a of ACTIVITIES) {
        const f = assessFeasibility(v, a)
        const cap = f.demand.uncapped ? null : (f.demand.monthlyLow + f.demand.monthlyHigh) / 2
        for (const s of a.sizes) {
          const sc = buildScenario({ activity: a, size: s, scale: 1 }, draft.margin!, { category: draft.category ?? 'SC', familyIncome: draft.familyIncome ?? 150000, mode: 'serviced' }, { familyLabour: 2, marketCap: cap, needBased: true })
          if (!sc.passes) continue
          const score = (sc.projection!.years[1].ebitda / 12) * (f.saturation.label === 'crowded' ? 0.5 : 1)
          if (score > best.score) best = { code: a.code, score }
        }
      }
      setThinking(false)
      onPick(best.code)
    }, 50)
  }
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {ACTIVITIES.map((a) => (
        <button key={a.code} onClick={() => onPick(a.code)} className={clsx('card flex aspect-[0.95] flex-col items-center justify-center gap-1.5 p-2 text-center hover:border-indigo/50', draft.activity === a.code && 'border-indigo ring-2 ring-indigo/30')}>
          <span className="text-[38px] leading-none" aria-hidden>{a.emoji}</span>
          <span className="text-[14px] font-semibold leading-tight">{t(a.name.en, a.name.hi)}</span>
        </button>
      ))}
      <button onClick={suggest} className="col-span-3 mt-1 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo/40 bg-indigo-soft/60 py-3.5 text-[16px] font-bold text-indigo">
        <Sparkles className={clsx('size-5', thinking && 'animate-spin')} />
        {thinking ? t('Checking your village…', 'आपका गाँव जाँच रहे हैं…') : t('Suggest a business for my village', 'मेरे गाँव के लिए काम सुझाइए')}
      </button>
    </div>
  )
}

function SizeStep({ draft, onPick }: { draft: Draft; onPick: (id: string | null) => void }) {
  const t = useT()
  const a = activityByCode(draft.activity!)
  return (
    <div className="space-y-2.5">
      <button onClick={() => onPick(null)} className={clsx('flex w-full items-center gap-3 rounded-xl border-2 border-indigo bg-indigo px-4 py-4 text-left text-white', draft.sizeId === null && 'ring-4 ring-marigold/50')}>
        <Sparkles className="size-6 text-marigold" />
        <span className="flex-1">
          <span className="block text-[17px] font-bold">{t('Let Saathi decide', 'साथी तय करे')}</span>
          <span className="text-[13px] text-white/75">{t('The biggest unit your repayment can safely carry', 'सबसे बड़ी इकाई जिसकी किस्त आराम से चुके')}</span>
        </span>
      </button>
      {a.sizes.map((s) => (
        <button key={s.id} onClick={() => onPick(s.id)} className={clsx('card flex w-full items-center gap-3 px-4 py-3.5 text-left hover:border-indigo/50', draft.sizeId === s.id && 'border-indigo ring-2 ring-indigo/30')}>
          <span className="text-[28px]" aria-hidden>{a.emoji}</span>
          <span className="flex-1 text-[17px] font-semibold">{t(s.label.en, s.label.hi)}</span>
          <span className="text-right">
            <span className="num block text-[18px] font-bold">{lakh(sizeCost(s))}</span>
            <span className="text-[11.5px] text-muted">{t('unit cost', 'इकाई लागत')}</span>
          </span>
        </button>
      ))}
      <p className="pt-1 text-[12.5px] text-muted">{t('Unit costs: NABARD PLP-style norms for Barabanki (demo).', 'इकाई लागत: बाराबंकी के लिए NABARD PLP जैसे मानक (डेमो)।')}</p>
    </div>
  )
}

function Analyzing({ draft, onDone }: { draft: Draft; onDone: () => void }) {
  const t = useT()
  const [i, setI] = useState(0)
  const done = useRef(false)
  const v = draft.lgd ? villageByLgd(draft.lgd) : null
  const steps = [
    t(`Mapping 5 and 10 km around ${v?.name ?? 'your village'}`, `${v?.nameHi ?? 'आपके गाँव'} के आसपास 5 और 10 किमी का नक्शा`),
    t('Counting similar units, checking demand', 'ऐसी इकाइयाँ गिन रहे हैं, माँग जाँच रहे हैं'),
    t(`Applying scheme rules ${RULESET_VERSION}`, `योजना नियम ${RULESET_VERSION} लगा रहे हैं`),
    t('Testing 1,000 possible futures', '1,000 संभावित हालात जाँच रहे हैं'),
    t('Writing your report', 'आपकी रिपोर्ट लिख रहे हैं'),
  ]
  useEffect(() => {
    const id = setInterval(() => setI((x) => Math.min(x + 1, steps.length)), 520)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    if (i >= steps.length && !done.current) {
      done.current = true
      onDone()
    }
  }, [i, steps.length, onDone])
  return (
    <div className="flex h-full flex-col justify-center py-10">
      <p className="font-display text-[30px] font-bold leading-tight text-indigo-deep">{t(`${draft.name ? draft.name + '’s' : 'Your'} plan is being checked`, `${draft.name ? draft.name + ' जी की' : 'आपकी'} योजना की जाँच हो रही है`)}</p>
      <ol className="mt-8 space-y-4">
        {steps.map((s, k) => (
          <li key={k} className={clsx('flex items-center gap-3 text-[17px] transition-opacity', k > i && 'opacity-30')}>
            <span className={clsx('grid size-7 place-items-center rounded-full', k < i ? 'bg-go text-white' : k === i ? 'border-2 border-marigold' : 'border-2 border-line')}>
              {k < i ? <Check className="size-4" strokeWidth={3} /> : k === i ? <span className="size-2.5 animate-ping rounded-full bg-marigold" /> : null}
            </span>
            {s}
          </li>
        ))}
      </ol>
    </div>
  )
}

/** Right-hand audit trail: what the engine knows, where each number comes from. */
function EngineTrace({ draft, pending, onPersona }: { draft: Draft; pending: number | null; onPersona: (i: number) => void }) {
  const t = useT()
  const margin = pending ?? draft.margin
  const naive = margin ? naiveCeiling(margin, draft.category ?? 'SC', draft.familyIncome ?? 150000) : null
  const feas = useMemo(() => (draft.lgd && draft.activity ? assessFeasibility(villageByLgd(draft.lgd)!, activityByCode(draft.activity)) : null), [draft.lgd, draft.activity])
  const slots = { lgd: draft.lgd, margin: margin, activity: draft.activity, size: draft.sizeId ?? (draft.activity ? 'auto' : null), fit: draft.fit, category: draft.category, income: draft.familyIncome }
  return (
    <aside className="hidden lg:flex flex-col gap-4 overflow-y-auto p-6 text-[13px]" aria-label={t('Engine trace', 'इंजन ट्रेस')}>
      <div className="rounded-2xl bg-indigo-deep p-5 text-white">
        <div className="flex items-center justify-between">
          <span className="font-display text-[18px] font-bold">{t('Engine trace', 'इंजन ट्रेस')}</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold">{RULESET_VERSION}</span>
        </div>
        <p className="mt-1 text-white/60">{t('What the judges see; the beneficiary does not.', 'जजों के लिए; लाभार्थी को नहीं दिखता।')}</p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-black/25 p-3 font-mono text-[11.5px] leading-relaxed text-[#cfe0ff]">{JSON.stringify(slots, null, 1).replace(/[{}"]/g, '').replace(/^\s*\n/gm, '').trim()}</pre>
        {naive && naive.rule && (
          <div className="mt-3 rounded-lg bg-white/5 p-3">
            <div className="font-semibold text-marigold">{t('Naive formula (what the PS says)', 'सीधा फ़ॉर्मूला (PS वाला)')}</div>
            <div className="mt-1">
              {inr(margin!)} ÷ 10% = {inr(naive.rawProject)} → {naive.rule.corporation} {naive.rule.product}, {t('loan', 'लोन')} {inr(naive.loan)} @ {(naive.rule.ratePa * 100).toFixed(1)}%
            </div>
            {naive.flags.map((f) => (
              <div key={f.code} className="mt-2 rounded bg-marigold/15 px-2 py-1.5 text-[12px] text-[#ffe3a3]">
                <b>{f.code}</b> {t(f.en, f.hi)}
              </div>
            ))}
          </div>
        )}
        <div className="mt-3 flex items-center gap-2 text-white/70">
          <span className="size-2 rounded-full bg-go" /> {t('Narrator LLM: not called. No number has come from AI.', 'वाचक LLM: अभी नहीं बुलाया। कोई संख्या AI से नहीं आई।')}
        </div>
      </div>

      {feas && (
        <div className="card p-4">
          <div className="mb-1 font-display text-[16px] font-bold">{t('Evidence so far', 'अब तक के सबूत')}</div>
          {feas.facts.slice(0, 6).map((f) => (
            <div key={f.id} className="flex items-center justify-between gap-2 border-b border-line py-2 last:border-0">
              <span className="text-muted">
                <b className="text-ink">{f.id}</b> {t(f.label.en, f.label.hi)}
              </span>
              <span className="flex items-center gap-2 text-right">
                <b className="num text-[14px]">{f.display}</b>
                <ConfidenceBadge c={f.confidence} />
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="card p-4">
        <div className="font-display text-[16px] font-bold">{t('Demo personas', 'डेमो व्यक्ति')}</div>
        <p className="text-muted">{t('Jump straight to a report.', 'सीधे रिपोर्ट पर जाएँ।')}</p>
        <div className="mt-3 flex flex-col gap-2">
          <PersonaBtn onClick={() => onPersona(0)} emoji="🐄">Sunita · {t('dairy, ₹1 L, Sirauli', 'डेयरी, ₹1 लाख, सिरौली')}</PersonaBtn>
          <PersonaBtn onClick={() => onPersona(1)} emoji="🧵">Rekha · {t('tailoring, ₹10k, low fit', 'सिलाई, ₹10 हज़ार, कम फ़िट')}</PersonaBtn>
          <PersonaBtn onClick={() => onPersona(10)} emoji="🏪">Rajesh · {t('kirana, ₹14k edge case', 'किराना, ₹14 हज़ार सीमा केस')}</PersonaBtn>
        </div>
      </div>
    </aside>
  )
}

function PersonaBtn({ children, onClick, emoji }: { children: ReactNode; onClick: () => void; emoji: string }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-2 text-left font-semibold hover:border-indigo/40">
      <span className="text-[18px]">{emoji}</span>
      {children}
    </button>
  )
}
