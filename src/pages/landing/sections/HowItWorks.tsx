import { ClipboardList, FileText, Mic } from 'lucide-react'
import { useT } from '../../../lib/store'
import { SectionHead } from '../SectionHead'
import { useSunita } from '../useSunita'

export function HowItWorks() {
  const t = useT()
  const sunita = useSunita()
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
      <SectionHead title={t('Three easy steps', 'तीन आसान कदम')} sub={t('No forms, no English needed. One question at a time.', 'कोई फ़ॉर्म नहीं, अंग्रेज़ी की ज़रूरत नहीं। एक बार में एक सवाल।')} />
      <ol className="relative mt-12 grid gap-8 md:grid-cols-3 md:gap-5">
        <span className="absolute top-9 right-[16%] left-[16%] hidden border-t-2 border-dashed border-marigold md:block" aria-hidden />
        {[
          { icon: Mic, en: 'Answer simple questions', hi: 'आसान सवालों के जवाब दें', den: 'Your village, your savings, the work you want. Speak or tap a picture.', dhi: 'आपका गाँव, आपकी बचत, कौन-सा काम। बोलिए या तस्वीर छुइए।' },
          { icon: FileText, en: 'See your plan', hi: 'अपनी योजना देखें', den: 'The right loan, the instalment every 3 months, and what to watch out for.', dhi: 'सही लोन, हर 3 महीने की किस्त, और किन बातों का ध्यान रखें।' },
          { icon: ClipboardList, en: 'Apply with confidence', hi: 'भरोसे से आवेदन करें', den: 'A ready project report, a list of papers, and the link to apply.', dhi: 'तैयार प्रोजेक्ट रिपोर्ट, काग़ज़ों की सूची, और आवेदन का लिंक।' },
        ].map((s, i) => (
          <li key={i} className="relative flex flex-col items-center text-center">
            <span className="relative grid size-[72px] place-items-center rounded-full bg-indigo-deep text-white shadow-[0_10px_24px_-10px_rgba(28,37,102,0.7)]">
              <s.icon className="size-8" aria-hidden />
              <span className="num absolute -top-1 -right-1 grid size-7 place-items-center rounded-full bg-marigold text-[14px] font-extrabold text-indigo-deep">{i + 1}</span>
            </span>
            <h3 className="mt-5 font-display text-[22px] font-bold text-indigo-deep">{t(s.en, s.hi)}</h3>
            <p className="mt-2 max-w-[30ch] text-[15.5px] leading-relaxed text-ink/75">{t(s.den, s.dhi)}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
