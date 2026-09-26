import { Landmark } from 'lucide-react'
import { Tricolour } from '../art'
import { useT } from '../../lib/store'

/** Thin Government of India strip (GIGW-style) that sits above every page. */
export function GovBar() {
  const t = useT()
  return (
    <div className="no-print bg-indigo-deep text-white">
      <Tricolour />
      <a href="#main" className="skip-link">
        {t('Skip to main content', 'मुख्य सामग्री पर जाएँ')}
      </a>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-1.5 text-[12.5px]">
        <span className="flex min-w-0 items-center gap-2">
          <Landmark className="size-3.5 shrink-0 text-marigold" aria-hidden />
          <span className="truncate">
            <b className="font-semibold">{t('Government of India', 'भारत सरकार')}</b>
            <span className="text-white/70"> · {t('Ministry of Social Justice & Empowerment', 'सामाजिक न्याय एवं अधिकारिता मंत्रालय')}</span>
          </span>
        </span>
        <span className="hidden shrink-0 text-white/70 sm:inline">{t('Free service · No agent needed', 'मुफ़्त सेवा · कोई एजेंट नहीं')}</span>
      </div>
    </div>
  )
}
