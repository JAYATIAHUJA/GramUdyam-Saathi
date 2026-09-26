import { CalendarClock, Hand, Mic, ShieldCheck, Timer, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ActivityArt } from '../../../components/art'
import { VerdictStamp } from '../../../components/ui'
import { inr, lakh } from '../../../lib/format'
import { useT } from '../../../lib/store'
import { Arch } from '../Arch'
import { useSunita } from '../useSunita'

export function Hero() {
  const t = useT()
  const sunita = useSunita()
  const r = sunita.recommended
  return (
    <section className="relative overflow-hidden">
      <div className="grain pointer-events-none absolute inset-0 opacity-70" aria-hidden />
      <div className="pointer-events-none absolute -top-40 -right-40 size-[620px] rounded-full bg-marigold/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-48 -left-32 size-[480px] rounded-full bg-saffron/10 blur-3xl" aria-hidden />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pt-8 pb-14 md:pt-14 md:pb-20 lg:grid-cols-[1fr_1.05fr] lg:gap-6">
        <div className="rise">
          <span className="inline-flex items-center gap-2 rounded-full border border-saffron/25 bg-white px-3 py-1.5 text-[13px] font-bold text-saffron shadow-sm">
            <ShieldCheck className="size-4" aria-hidden />
            {t('Government scheme helper · Free', 'सरकारी योजना सहायक · मुफ़्त')}
          </span>
          <h1 className="mt-5 font-display text-[42px] leading-[1.05] font-extrabold tracking-tight text-indigo-deep sm:text-[60px]">
            {t('Start your own work,', 'अपना काम शुरू करें,')}
            <br />
            <span className="brush text-saffron">{t('with the right loan.', 'सही लोन के साथ।')}</span>
          </h1>
          <p className="mt-5 max-w-[44ch] text-[18px] leading-relaxed text-ink/80">
            {t('Tell us about your village and your savings. Saathi finds the work that fits, a loan you can repay, and an easy instalment.', 'अपने गाँव और अपनी बचत के बारे में बताइए। साथी बताएगी कौन-सा काम चलेगा, कितना लोन सुरक्षित है, और किस्त कितनी होगी।')}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link to="/saathi" className="btn-primary px-7 py-4 text-[18px] whitespace-nowrap">
              <Mic className="size-5" strokeWidth={2.6} aria-hidden />
              {t('Start by speaking', 'बोलकर शुरू करें')}
            </Link>
            <Link to="/saathi" className="btn-secondary px-6 py-3.5 text-[16.5px] whitespace-nowrap">
              <Hand className="size-5" aria-hidden />
              {t('Start by tapping', 'छूकर शुरू करें')}
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-3" aria-hidden>
              {['/photos/women-trio.webp', '/photos/field-smile.webp', '/photos/tailor.webp'].map((s) => (
                <img key={s} src={s} alt="" className="size-11 rounded-full border-[3px] border-paper object-cover" />
              ))}
            </div>
            <p className="text-[14.5px] leading-snug text-ink/75">
              <b className="text-ink">{t('Made for families like yours', 'आपके जैसे परिवारों के लिए')}</b>
              <br />
              {t('SC, OBC and Safai Karamchari', 'SC, OBC और सफ़ाई कर्मचारी')}
            </p>
          </div>
          <ul className="mt-6 flex flex-wrap gap-2 text-[13.5px] font-semibold text-ink/80">
            {[
              [Timer, t('About 10 minutes', 'लगभग 10 मिनट')],
              [Wallet, t('No fee, no agent', 'कोई फ़ीस नहीं, कोई एजेंट नहीं')],
              [ShieldCheck, t('Safe on your phone', 'फ़ोन में सुरक्षित')],
            ].map(([Icon, label], i) => {
              const I = Icon as typeof Timer
              return (
                <li key={i} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm">
                  <I className="size-4 text-leaf" aria-hidden /> {label as string}
                </li>
              )
            })}
          </ul>
        </div>

        {/* Photo collage in jharokha arches, with a real result floating on top */}
        <div className="relative mx-auto h-[440px] w-full max-w-[540px] sm:h-[560px]">
          <svg viewBox="0 0 200 200" className="absolute top-[4%] left-[12%] w-[74%] text-marigold/60 motion-safe:animate-[spin_60s_linear_infinite]" aria-hidden>
            <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 6" strokeLinecap="round" />
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1 4" />
          </svg>
          <div className="absolute top-[10%] right-[6%] size-[46%] rounded-full bg-marigold/70" aria-hidden />

          <Arch src="/photos/hero-smile.webp" alt={t('A smiling woman in a village', 'गाँव की एक मुस्कुराती महिला')} eager className="absolute top-[4%] right-[4%] h-[74%] w-[52%]" />
          <Arch src="/photos/women-trio.webp" alt={t('Three women from a village', 'गाँव की तीन महिलाएँ')} eager className="absolute bottom-[3%] left-[4%] h-[56%] w-[40%]" />
          <div className="absolute top-[6%] left-[8%] size-[24%] overflow-hidden rounded-full border-[5px] border-white shadow-lg">
            <img src="/photos/cow.webp" alt={t('A dairy cow', 'डेयरी की गाय')} className="size-full object-cover" />
          </div>

          <div className="float-slow absolute right-[2%] bottom-[4%] w-[58%] min-w-[210px] max-w-[280px] rounded-2xl border border-white/70 bg-white/95 p-3.5 shadow-[0_20px_40px_-20px_rgba(28,37,102,0.55)] backdrop-blur">
            <div className="flex items-center gap-2.5">
              <ActivityArt code="dairy" className="size-10" />
              <div className="min-w-0 leading-tight">
                <div className="truncate text-[13.5px] font-bold">Sunita Devi</div>
                <div className="truncate text-[12px] text-muted">{t(`Sirauli · ${r.unit.size.label.en}`, `सिरौली · ${r.unit.size.label.hi}`)}</div>
              </div>
            </div>
            <div className="mt-2 flex items-end justify-between gap-2">
              <div>
                <div className="text-[11.5px] font-bold text-muted">{t('Safe loan', 'सुरक्षित लोन')}</div>
                <div className="num text-[28px] leading-none font-extrabold whitespace-nowrap text-indigo-deep">{lakh(r.loan)}</div>
              </div>
              <div className="shrink-0 origin-bottom-right scale-[0.8]">
                <VerdictStamp v={sunita.verdict} size="sm" />
              </div>
            </div>
          </div>

          <div className="float-slower absolute top-[44%] left-[30%] hidden items-center gap-2 rounded-2xl bg-indigo-deep px-3 py-2 text-white shadow-lg sm:flex">
            <CalendarClock className="size-5 text-marigold" aria-hidden />
            <span className="leading-tight">
              <span className="block text-[11px] text-white/70">{t('Every 3 months', 'हर 3 महीने')}</span>
              <b className="num text-[16px]">{inr(r.schedule!.instalment)}</b>
            </span>
          </div>

          <div className="float-slow absolute top-[2%] right-[2%] flex -space-x-2 rounded-2xl bg-white/95 p-1.5 shadow-md" aria-hidden>
            {['tailoring', 'kirana', 'goat'].map((c) => (
              <ActivityArt key={c} code={c} className="size-9 rounded-xl ring-2 ring-white" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
