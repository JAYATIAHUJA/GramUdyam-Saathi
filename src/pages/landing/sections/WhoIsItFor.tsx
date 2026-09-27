import { ArrowRight, Building2, Smartphone, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useT } from '../../../lib/store'
import { SectionHead } from '../SectionHead'

export function WhoIsItFor() {
  const t = useT()
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
      <div className="hidden md:block">
        <SectionHead title={t('One Saathi, three ways in', 'एक साथी, तीन रास्ते')} />
      </div>
      <div className="md:hidden">
        <SectionHead title={t('Start your plan', 'अपनी योजना शुरू करें')} />
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {[
          { to: '/saathi', icon: Smartphone, en: 'I want to start a business', hi: 'मुझे काम शुरू करना है', den: 'Speak in Hindi, one question per screen. Get your answer and application file.', dhi: 'हिंदी में बोलिए, हर स्क्रीन पर एक सवाल। जवाब और आवेदन की फ़ाइल पाइए।', cta: t('Make my plan', 'मेरी योजना बनाएँ'), tone: 'bg-marigold text-indigo-deep', desktop: false },
          { to: '/operator', icon: UsersRound, en: 'I help people apply (VLE)', hi: 'मैं आवेदन में मदद करता/करती हूँ (VLE)', den: 'A quick form for the CSC or panchayat. Full plan in under 10 minutes.', dhi: 'CSC या पंचायत के लिए तेज़ फ़ॉर्म। 10 मिनट में पूरी योजना।', cta: t('Open helper mode', 'सहायक मोड खोलें'), tone: 'bg-indigo text-white', desktop: true },
          { to: '/officer', icon: Building2, en: 'I am a district officer (SCA)', hi: 'मैं ज़िला अधिकारी (SCA) हूँ', den: 'Every case arrives pre-checked. Approve or send back in one click.', dhi: 'हर केस पहले से जाँचा हुआ। एक क्लिक में मंज़ूर करें या लौटाएँ।', cta: t('Open officer desk', 'अधिकारी डेस्क खोलें'), tone: 'bg-indigo-deep text-white', desktop: true },
        ].map((d) => (
          <Link key={d.to} to={d.to} className={`group flex-col ${d.desktop ? 'hidden md:flex' : 'flex'} rounded-3xl border border-line bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-24px_rgba(28,37,102,0.4)]`}>
            <span className={`grid size-14 place-items-center rounded-2xl ${d.tone}`}>
              <d.icon className="size-7" aria-hidden />
            </span>
            <h3 className="mt-5 font-display text-[21px] leading-tight font-bold text-indigo-deep">{t(d.en, d.hi)}</h3>
            <p className="mt-2 flex-1 text-[15px] leading-relaxed text-ink/75">{t(d.den, d.dhi)}</p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-[15.5px] font-bold text-indigo">
              {d.cta} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
