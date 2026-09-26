import { Mic } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useT } from '../../../lib/store'
import { useSunita } from '../useSunita'

export function FinalCta() {
  const t = useT()
  const sunita = useSunita()
  return (
    <section className="px-4 pb-14 md:pb-20">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px]">
        <img src="/photos/women-road.webp" alt={t('Women walking together on a village road', 'गाँव की सड़क पर साथ चलती महिलाएँ')} loading="lazy" className="absolute inset-0 size-full object-cover object-[70%_30%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-deep/95 via-indigo-deep/75 to-indigo-deep/10" aria-hidden />
        <div className="relative max-w-xl px-6 py-14 text-white md:px-12 md:py-20">
          <h2 className="font-display text-[32px] leading-tight font-extrabold sm:text-[44px]">{t('Let’s make your plan together.', 'चलिए, मिलकर आपकी योजना बनाते हैं।')}</h2>
          <p className="mt-3 text-[17px] text-white/85">{t('Free. About 10 minutes. Stop and continue any time.', 'मुफ़्त। लगभग 10 मिनट। कभी भी रुकें, फिर जारी रखें।')}</p>
          <Link to="/saathi" className="btn-primary mt-7 px-7 py-4 text-[18px]">
            <Mic className="size-5" strokeWidth={2.6} aria-hidden />
            {t('Start now', 'अभी शुरू करें')}
          </Link>
        </div>
      </div>
    </section>
  )
}
