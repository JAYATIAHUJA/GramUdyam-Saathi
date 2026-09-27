import { Phone } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Tricolour } from '../art'
import { LINKS } from './links'
import { Logo } from '../ui'
import { DISTRICT } from '../../data/villages'
import { useT } from '../../lib/store'

export function SiteFooter() {
  const t = useT()
  const updated = new Date(2026, 8, 27).toLocaleDateString(t('en-IN', 'hi-IN'), { day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <footer className="no-print bg-indigo-deep text-white">
      <Tricolour />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-[42ch] text-[14.5px] leading-relaxed text-white/75">
            {t(
              'A free planning helper for first-time entrepreneurs from SC, OBC and Safai Karamchari families, before they apply for an NSFDC, NBCFDC or NSKFDC loan.',
              'SC, OBC और सफ़ाई कर्मचारी परिवारों के पहली बार काम शुरू करने वालों के लिए मुफ़्त योजना-सहायक, NSFDC, NBCFDC या NSKFDC लोन के आवेदन से पहले।',
            )}
          </p>
        </div>
        <div>
          <h2 className="font-display text-[17px] font-bold">{t('Use Saathi', 'साथी का उपयोग')}</h2>
          <ul className="mt-3 space-y-2 text-[14.5px] text-white/80">
            {LINKS.map((l) => (
              <li key={l.to} className={l.desktop ? 'hidden md:list-item' : undefined}>
                <NavLink to={l.to} className="hover:text-white hover:underline">
                  {t(l.en, l.hi)}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-[17px] font-bold">{t('Need help?', 'मदद चाहिए?')}</h2>
          <p className="mt-3 text-[14.5px] text-white/80">{t(DISTRICT.sca.name, DISTRICT.sca.nameHi)}</p>
          <p className="text-[13.5px] text-white/60">{DISTRICT.sca.address}</p>
          <p className="mt-2 inline-flex items-center gap-2 text-[15px] font-bold text-marigold">
            <Phone className="size-4" aria-hidden /> {DISTRICT.sca.phone}
          </p>
          <p className="mt-3 text-[13.5px] text-white/60">{t('Or visit your nearest CSC / gram panchayat.', 'या अपने पास के CSC / ग्राम पंचायत जाएँ।')}</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-[12.5px] text-white/55 md:flex-row md:items-center md:justify-between">
          <p className="max-w-[90ch]">
            {t(
              'Prototype on demo data. Barabanki village, market and price figures are synthetic, modelled on Census 2011, Mission Antyodaya, Economic Census 6, HCES and NABARD PLP. Scheme terms that sources disagree on are marked “SCA to confirm”.',
              'डेमो डेटा पर प्रोटोटाइप। बाराबंकी के गाँव, बाज़ार और दाम के आंकड़े काल्पनिक हैं, जनगणना 2011, मिशन अंत्योदय, आर्थिक जनगणना 6, HCES और NABARD PLP के ढाँचे पर। जिन शर्तों पर स्रोत अलग हैं, वहाँ “SCA से पुष्टि करें” लिखा है।',
            )}
          </p>
          <p className="shrink-0">
            {t('Photos: Unsplash', 'तस्वीरें: Unsplash')} · {t('Last updated', 'अंतिम अपडेट')}: {updated}
          </p>
        </div>
      </div>
    </footer>
  )
}
