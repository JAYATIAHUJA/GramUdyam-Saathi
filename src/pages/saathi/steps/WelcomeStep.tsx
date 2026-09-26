import { clsx } from 'clsx'
import { Bubble, Didi } from '../../../components/art'
import { useApp, useT } from '../../../lib/store'
import Saathi from '../Saathi'
import { LANGS } from '../questions'

export function WelcomeStep({ onStart, onResume }: { onStart: () => void; onResume?: () => void }) {
  const t = useT()
  const { lang, setLang } = useApp()
  return (
    <div className="rise">
      <div className="mb-5 flex items-end gap-2">
        <Didi mood="namaste" className="w-24 shrink-0" />
        <Bubble className="mb-4 flex-1">
          <p className="font-display text-[22px] leading-tight font-bold text-indigo-deep">{t('Namaste! I am Saathi Didi.', 'नमस्ते! मैं साथी दीदी हूँ।')}</p>
          <p className="mt-1 text-[14.5px] text-ink/70">{t('I will ask a few easy questions and find the right loan for you.', 'मैं कुछ आसान सवाल पूछूँगी और आपके लिए सही लोन निकालूँगी।')}</p>
        </Bubble>
      </div>
      <p className="mb-3 font-display text-[20px] font-bold text-ink">{t('Choose your language', 'अपनी भाषा चुनें')}</p>
      <div className="grid grid-cols-2 gap-3">
        {LANGS.map((l) => {
          return (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code === 'en' ? 'en' : 'hi')
                onStart()
              }}
              className={clsx('card flex flex-col items-center px-4 py-6 text-center transition-all hover:-translate-y-0.5 hover:border-indigo/50 hover:shadow-md', lang === l.code && 'ring-2 ring-indigo')}
            >
              <span className="font-display text-[30px] leading-tight font-bold">{l.label}</span>
              <span className="text-[15px] text-muted">{l.sample}</span>
            </button>
          )
        })}
      </div>
      {onResume && (
        <button onClick={onResume} className="mt-5 w-full rounded-xl border border-indigo/30 bg-indigo-soft px-4 py-3 text-[15px] font-semibold text-indigo">
          {t('Continue where you left off', 'जहाँ छोड़ा था वहीं से जारी रखें')}
        </button>
      )}
    </div>
  
  )
}
