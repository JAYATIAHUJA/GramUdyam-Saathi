import { Volume2 } from 'lucide-react'
import { Bubble, Didi } from '../../components/art'
import { speak } from '../../lib/speech'
import { useApp, useT } from '../../lib/store'
import { PROMPTS } from './questions'

/** Didi asks the current question; tap the speaker to hear it. */
export function QuestionBubble({ step, listening }: { step: number; listening: boolean }) {
  const t = useT()
  const lang = useApp((s) => s.lang)
  const prompt = PROMPTS[step] ?? PROMPTS[0]
  const promptText = t(prompt.en, prompt.hi)
  const didiMood = listening ? 'listen' : 'namaste'
  return (
    <div className="rise mb-3 flex shrink-0 items-end gap-2">
      <Didi mood={didiMood} className="-mb-1 w-[64px] shrink-0" />
      <Bubble className="flex-1 !py-2.5">
        <div className="flex items-start gap-2">
          <h1 className="flex-1 font-display text-[22px] leading-[1.2] font-bold text-indigo-deep">{promptText}</h1>
          <button onClick={() => speak(promptText, lang)} className="grid size-9 shrink-0 place-items-center rounded-full bg-indigo-soft text-indigo hover:bg-indigo hover:text-white" aria-label={t('Hear the question', 'सवाल सुनें')}>
            <Volume2 className="size-4.5" />
          </button>
        </div>
        {prompt.subEn && <p className="mt-1 text-[14.5px] leading-snug text-ink/65">{t(prompt.subEn, prompt.subHi!)}</p>}
      </Bubble>
    </div>
  
  )
}
