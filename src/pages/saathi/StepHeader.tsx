import { clsx } from 'clsx'
import { ArrowLeft, Check } from 'lucide-react'
import { LangToggle, Logo } from '../../components/ui'
import { useT } from '../../lib/store'
import { STAGES } from './questions'

/** Back button, question count and the five-stage progress bar. */
export function StepHeader({ step, onBack }: { step: number; onBack: () => void }) {
  const t = useT()
  const stageIdx = STAGES.findIndex((s) => s.steps.includes(step))
  return (
    <>
    <header className="flex shrink-0 items-center justify-between gap-2 px-4 pt-3">
      {step > 0 ? (
        <button onClick={onBack} className="inline-flex h-10 items-center gap-1 rounded-full pr-3 pl-2 text-[14px] font-semibold text-ink/80 hover:bg-khadi" aria-label={t('Back', 'पीछे')}>
          <ArrowLeft className="size-5" />
          <span className="hidden sm:inline">{t('Back', 'पीछे')}</span>
        </button>
      ) : (
        <Logo compact />
      )}
      {step > 0 && step < 13 && (
        <span className="text-[13px] font-bold text-muted">
          {t(`Question ${step} of 12`, `सवाल ${step} / 12`)}
        </span>
      )}
      <LangToggle className="scale-90" />
    </header>
    {step > 0 && step < 13 && (
      <ol className="grid shrink-0 grid-cols-5 gap-1.5 px-4 pt-2" aria-label={t('Progress', 'प्रगति')}>
        {STAGES.map((s, i) => (
          <li key={s.en} className="flex flex-col gap-1">
            <span className={clsx('h-1.5 rounded-full transition-colors duration-500', i < stageIdx ? 'bg-leaf' : i === stageIdx ? 'bg-marigold' : 'bg-line')} />
            <span className={clsx('flex items-center gap-0.5 text-[11px] font-semibold', i === stageIdx ? 'text-ink' : i < stageIdx ? 'text-leaf' : 'text-muted')}>
              {i < stageIdx && <Check className="size-3" strokeWidth={3} />}
              {t(s.en, s.hi)}
            </span>
          </li>
        ))}
      </ol>
    )}
    </>
  )
}
