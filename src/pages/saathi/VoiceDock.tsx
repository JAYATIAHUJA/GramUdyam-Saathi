import { ChevronRight, Keyboard } from 'lucide-react'
import { useState } from 'react'
import { MicButton } from '../../components/ui'
import { speak, useListen } from '../../lib/speech'
import { useT } from '../../lib/store'

/** Keyboard, mic and next: the controls under every question. */
export function VoiceDock({ mic, heard, onText, canNext, onNext }: { mic: ReturnType<typeof useListen>; heard: string | null; onText: (text: string) => void; canNext: boolean; onNext: () => void }) {
  const t = useT()
  const [typing, setTyping] = useState(false)
  return (
    <div className="sticky bottom-0 -mx-5 mt-3 shrink-0 border-t border-line bg-paper/95 px-5 pt-2.5 pb-2.5 backdrop-blur md:static">
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
          <MicButton listening={mic.listening} onClick={mic.listening ? mic.stop : mic.start} size={56} />
          <span className="text-[13px] font-bold text-indigo">{mic.listening ? t('Listening…', 'सुन रहे हैं…') : t('Tap and speak', 'दबाइए और बोलिए')}</span>
        </div>
        {canNext ? (
          <button onClick={onNext} className="grid size-12 place-items-center rounded-full bg-indigo text-white" aria-label={t('Next', 'आगे')}>
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
            if (v) onText(v)
            e.currentTarget.reset()
          }}
        >
          <input name="q" autoFocus placeholder={t('Type your answer', 'जवाब लिखें')} className="flex-1 rounded-lg border border-line bg-white px-3 py-2" />
          <button className="rounded-lg bg-indigo px-4 font-semibold text-white">{t('Send', 'भेजें')}</button>
        </form>
      )}
    </div>
  
  )
}
