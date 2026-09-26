import { Sparkles, TriangleAlert } from 'lucide-react'
import { inr, lakh } from '../../../lib/format'
import { useT } from '../../../lib/store'
import { Arch } from '../Arch'
import { SectionHead } from '../SectionHead'
import { useSunita } from '../useSunita'

export function StoryExample() {
  const t = useT()
  const sunita = useSunita()
  const r = sunita.recommended
  const n = sunita.naive
  const litres = Math.round(sunita.localUnits)
  const naiveRisk = Math.round((n.mc?.pDefault ?? 0) * 100)
  return (
    <section className="bg-sky/70">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-[0.8fr_1.2fr] md:py-20">
        <div className="relative mx-auto w-full max-w-[320px]">
          <Arch src="/photos/field-smile.webp" alt={t('A woman smiling in her field', 'अपने खेत में मुस्कुराती महिला')} className="aspect-[3/4] w-full" />
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-2 text-[14px] font-bold whitespace-nowrap shadow-lg">{t('Sunita Devi, Sirauli', 'सुनीता देवी, सिरौली')}</div>
        </div>
        <div className="min-w-0">
          <SectionHead align="left" title={t('A bigger loan is not always better', 'बड़ा लोन हमेशा अच्छा नहीं')} sub={t(`Sunita has ${inr(sunita.input.margin)} saved and wants to start a dairy.`, `सुनीता के पास ${inr(sunita.input.margin)} की बचत है और वे डेयरी शुरू करना चाहती हैं।`)} />
          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="min-w-0 rounded-3xl border-2 border-dashed border-risk/35 bg-white p-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-risk-soft px-2.5 py-1 text-[12.5px] font-bold text-risk">
                <TriangleAlert className="size-3.5" aria-hidden /> {t('Take as much as you can', 'जितना मिले, उतना लो')}
              </span>
              <div className="num mt-3 text-[40px] leading-none font-extrabold text-ink/45 line-through decoration-risk decoration-[3px]">{lakh(n.loan)}</div>
              <p className="mt-3 text-[15px] font-semibold text-risk">{t(`${naiveRisk} in 100 chance the instalment breaks some year.`, `100 में से ${naiveRisk} बार किसी साल किस्त टूट सकती है।`)}</p>
            </div>
            <div className="min-w-0 rounded-3xl border-2 border-go/30 bg-white p-5 shadow-[0_20px_40px_-28px_rgba(27,135,63,0.6)]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-go-soft px-2.5 py-1 text-[12.5px] font-bold text-go">
                <Sparkles className="size-3.5" aria-hidden /> {t('Saathi’s advice', 'साथी की सलाह')}
              </span>
              <div className="num mt-3 text-[40px] leading-none font-extrabold text-indigo-deep">{lakh(r.loan)}</div>
              <p className="mt-3 text-[15px]">
                {t(`${r.unit.size.label.en}. `, `${r.unit.size.label.hi}। `)}
                <b className="text-go">{t(`Instalment = ~${litres} litres of milk a day.`, `किस्त = रोज़ ~${litres} लीटर दूध।`)}</b>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
