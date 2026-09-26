import { CalendarClock, FileText, MessageCircle, ShieldCheck } from 'lucide-react'
import { useT } from '../../../lib/store'
import { SectionHead } from '../SectionHead'

export function WhatYouGet() {
  const t = useT()
  return (
    <section className="border-y border-line bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <SectionHead title={t('What you will get', 'आपको क्या मिलेगा')} />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, en: 'A clear answer', hi: 'साफ़ जवाब', den: 'Good opportunity, go carefully, or rethink.', dhi: 'अच्छा मौका, सोच के, या दोबारा सोचिए।', tint: 'bg-go-soft text-go' },
            { icon: CalendarClock, en: 'Your instalment', hi: 'आपकी किस्त', den: 'What to pay every 3 months, and save each day.', dhi: 'हर 3 महीने कितना भरना है, रोज़ कितना बचाना है।', tint: 'bg-indigo-soft text-indigo' },
            { icon: FileText, en: 'Project report', hi: 'प्रोजेक्ट रिपोर्ट', den: 'Ready to print, in Hindi and English.', dhi: 'प्रिंट के लिए तैयार, हिंदी और अंग्रेज़ी में।', tint: 'bg-marigold-soft text-[#7a5500]' },
            { icon: MessageCircle, en: 'Share and apply', hi: 'भेजें और आवेदन करें', den: 'WhatsApp it to family; apply on PM-SURAJ.', dhi: 'परिवार को WhatsApp करें; PM-SURAJ पर आवेदन करें।', tint: 'bg-saffron-soft text-saffron' },
          ].map((x) => (
            <li key={x.en} className="rounded-3xl border border-line bg-paper p-5">
              <span className={`grid size-12 place-items-center rounded-2xl ${x.tint}`}>
                <x.icon className="size-6" aria-hidden />
              </span>
              <b className="mt-4 block font-display text-[19px] text-indigo-deep">{t(x.en, x.hi)}</b>
              <span className="mt-1 block text-[15px] text-ink/70">{t(x.den, x.dhi)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
