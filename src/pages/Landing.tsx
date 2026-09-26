import { ArrowRight, Building2, FileCheck2, Mic, ShieldCheck, Smartphone, UsersRound } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { LangToggle, Logo, VerdictStamp } from '../components/ui'
import { SEED_CASES } from '../data/cases'
import { GOLDEN } from '../engine/golden'
import { planFor } from '../lib/plans'
import { inr, lakh } from '../lib/format'
import { useT } from '../lib/store'

export function TopNav({ dark = false }: { dark?: boolean }) {
  const t = useT()
  const links = [
    { to: '/saathi', en: 'Beneficiary app', hi: 'लाभार्थी ऐप' },
    { to: '/operator', en: 'VLE mode', hi: 'VLE मोड' },
    { to: '/officer', en: 'SCA officer', hi: 'SCA अधिकारी' },
    { to: '/engine', en: 'How it computes', hi: 'गणना कैसे' },
  ]
  return (
    <header className={dark ? 'bg-indigo-deep text-white' : 'bg-paper/90 backdrop-blur border-b border-line'}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Logo light={dark} />
        <nav className="hidden md:flex items-center gap-1 text-[14.5px] font-semibold">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className={dark ? 'rounded-lg px-3 py-2 text-white/80 hover:text-white hover:bg-white/10' : 'rounded-lg px-3 py-2 text-muted hover:text-indigo hover:bg-indigo-soft'}>
              {t(l.en, l.hi)}
            </Link>
          ))}
        </nav>
        <LangToggle />
      </div>
    </header>
  )
}

export default function Landing() {
  const t = useT()
  const sunita = useMemo(() => planFor(SEED_CASES[0], false), [])
  const passed = useMemo(() => GOLDEN.filter((g) => g.run().pass).length, [])
  const r = sunita.recommended
  const n = sunita.naive
  const litres = Math.round(sunita.localUnits)

  return (
    <div className="min-h-dvh">
      <TopNav />

      {/* Hero: the contrast the whole product exists for */}
      <section className="mx-auto grid max-w-6xl gap-10 px-4 pt-10 pb-16 md:grid-cols-[1.05fr_1fr] md:pt-16">
        <div className="flex flex-col justify-center">
          <p className="mb-4 text-[14px] font-semibold text-muted">
            SIH 2026 · PS 26091 · {t('Ministry of Social Justice & Empowerment', 'सामाजिक न्याय एवं अधिकारिता मंत्रालय')}
          </p>
          <h1 className="font-display text-[44px] leading-[1.02] font-extrabold tracking-tight text-indigo-deep sm:text-[64px]">
            लोन लेने से पहले,
            <br />
            सही फ़ैसला।
          </h1>
          <p className="mt-5 max-w-[34ch] text-[19px] leading-relaxed text-ink/80">
            {t(
              'Other tools tell a first-time entrepreneur how much they can borrow. Saathi tells them how much they should — for which business, in their own village.',
              'दूसरे टूल बताते हैं कि आप कितना लोन ले सकते हैं। साथी बताता है कि कितना लेना चाहिए — किस काम के लिए, आपके अपने गाँव में।',
            )}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/saathi" className="inline-flex items-center gap-2.5 rounded-full bg-marigold px-6 py-3.5 text-[17px] font-bold text-indigo-deep shadow-[0_4px_0_#b98200] transition-transform active:translate-y-1 active:shadow-none">
              <Mic className="size-5" strokeWidth={2.6} />
              {t('Start by speaking', 'बोलकर शुरू करें')}
            </Link>
            <Link to="/officer" className="inline-flex items-center gap-2 rounded-full border-2 border-indigo/20 px-5 py-3 text-[16px] font-bold text-indigo hover:border-indigo/50">
              {t('Open SCA dashboard', 'SCA डैशबोर्ड खोलें')}
            </Link>
          </div>
        </div>

        {/* Sunita's two answers, computed live by the engine */}
        <div className="relative">
          <div className="card grain relative overflow-hidden p-6 shadow-[0_24px_60px_-30px_rgba(28,37,102,0.45)]">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="font-display text-[22px] font-bold">Sunita Devi, {t('Sirauli', 'सिरौली')}</div>
                <div className="text-[14px] text-muted">
                  {t('Has', 'पास में')} {inr(sunita.input.margin)} · {t('wants a dairy', 'डेयरी शुरू करनी है')}
                </div>
              </div>
              <span className="text-[34px]" aria-hidden>🐄</span>
            </div>

            <div className="mt-5 rounded-xl border border-dashed border-risk/40 bg-risk-soft/60 p-4">
              <div className="text-[13px] font-bold text-risk">{t('The 10% formula says', '10% वाला फ़ॉर्मूला कहता है')}</div>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
                <span className="num text-[30px] font-bold text-ink/70 line-through decoration-risk decoration-2">{lakh(n.loan)}</span>
                <span className="text-[14px] text-muted">{t(`loan for a ${lakh(n.projectCost)} unit`, `${lakh(n.projectCost)} की इकाई के लिए लोन`)}</span>
              </div>
              <div className="mt-1 text-[14px] text-risk">
                {t(`${Math.round((n.mc?.pDefault ?? 0) * 100)}% chance repayment breaks in some year`, `${Math.round((n.mc?.pDefault ?? 0) * 100)}% संभावना कि किसी साल किस्त टूटे`)}
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-go/30 bg-go-soft/70 p-4">
              <div className="text-[13px] font-bold text-go">{t('Saathi says', 'साथी कहता है')}</div>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
                <span className="num text-[40px] font-extrabold leading-none text-indigo-deep">{lakh(r.loan)}</span>
                <span className="text-[14px] text-muted">{t(`for ${r.unit.size.label.en}`, `${r.unit.size.label.hi} के लिए`)}</span>
              </div>
              <div className="mt-2 text-[15px]">
                <b className="num text-[18px]">{inr(r.schedule!.instalment)}</b> {t('every 3 months', 'हर 3 महीने')} ={' '}
                <b>
                  {t(`~${litres} litres of milk a day`, `रोज़ ~${litres} लीटर दूध`)}
                </b>
              </div>
            </div>
            <div className="absolute right-5 bottom-24 sm:right-8">
              <VerdictStamp v={sunita.verdict} />
            </div>
            <p className="mt-4 text-[12px] text-muted">
              {t('Live engine output. Rule set', 'लाइव इंजन गणना। नियम')} {sunita.ruleVersion}, {t('1,000-run Monte Carlo.', '1,000 बार जाँच (मोंटे कार्लो)।')}
            </p>
          </div>
        </div>
      </section>

      {/* Evidence → feature */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="font-display text-[30px] font-bold leading-tight text-indigo-deep sm:text-[36px]">
            {t('Loans reach people. Right-sized plans don’t.', 'लोन पहुँचता है। सही योजना नहीं।')}
          </h2>
          <p className="mt-2 max-w-[60ch] text-[16px] text-muted">
            {t('From MoSJE’s own evaluation of 3,300 NSFDC borrowers. Each finding became a feature.', 'MoSJE के 3,300 NSFDC लाभार्थियों के मूल्यांकन से। हर तथ्य एक फ़ीचर बना।')}
          </p>
          <div className="mt-8 divide-y divide-line">
            {[
              { n: '61.5%', en: 'said the business didn’t fit their skill or interest', hi: 'ने कहा काम उनके हुनर या रुचि का नहीं था', fen: 'Founder-Fit comes first: five questions before any rupee is discussed.', fhi: 'फ़ाउंडर-फ़िट सबसे पहले: पैसे से पहले पाँच सवाल।' },
              { n: '46.3%', en: 'ran short of money after the loan; 34% of them went to a moneylender', hi: 'के पास लोन के बाद पैसा कम पड़ा; उनमें से 34% साहूकार के पास गए', fen: 'Working capital is inside every plan, with the month cash would run out.', fhi: 'हर योजना में कार्यशील पूंजी, और वह महीना जब पैसा ख़त्म होगा।' },
              { n: '12%', en: 'was the average rise in household income', hi: 'ही बढ़ी घर की औसत आय', fen: 'The loan is sized by what the unit can repay, not by the 10% formula.', fhi: 'लोन इकाई की चुकाने की क्षमता से तय, 10% फ़ॉर्मूले से नहीं।' },
              { n: '57.2%', en: 'applied through the gram panchayat, not alone', hi: 'ने ग्राम पंचायत से आवेदन किया, अकेले नहीं', fen: 'VLE / CRP-EP assisted mode is a first-class path.', fhi: 'VLE / CRP-EP सहायक मोड पूरा रास्ता है।' },
            ].map((x) => (
              <div key={x.n} className="grid gap-2 py-5 md:grid-cols-[150px_1fr_1fr] md:items-baseline md:gap-8">
                <div className="num text-[40px] font-extrabold leading-none text-risk">{x.n}</div>
                <div className="text-[17px]">{t(x.en, x.hi)}</div>
                <div className="flex items-start gap-2 text-[16px] font-semibold text-indigo">
                  <ArrowRight className="mt-1 size-4 shrink-0" />
                  {t(x.fen, x.fhi)}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[12.5px] text-muted">{t('Source: MoSJE / CMSD Evaluation of NSFDC schemes, field survey Feb 2020, 5 states.', 'स्रोत: MoSJE / CMSD, NSFDC योजनाओं का मूल्यांकन, फ़रवरी 2020, 5 राज्य।')}</p>
        </div>
      </section>

      {/* Three doors */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="font-display text-[30px] font-bold text-indigo-deep sm:text-[36px]">{t('One engine, three doors', 'एक इंजन, तीन दरवाज़े')}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { to: '/saathi', icon: Smartphone, en: 'Beneficiary', hi: 'लाभार्थी', den: 'Voice-first in Hindi. One question per screen, answers by tap or speech. Ends with a verdict, a quarterly schedule and a PM-SURAJ-ready file.', dhi: 'हिंदी में बोलकर। हर स्क्रीन पर एक सवाल। अंत में फ़ैसला, तिमाही किस्त और PM-SURAJ के लिए तैयार फ़ाइल।' },
            { to: '/operator', icon: UsersRound, en: 'VLE / CRP-EP', hi: 'VLE / CRP-EP', den: 'Dense, keyboard-first form for the helper at the CSC or panchayat. Full plan in under 10 minutes. Print the DPR on the spot.', dhi: 'CSC या पंचायत पर सहायक के लिए तेज़ फ़ॉर्म। 10 मिनट में पूरी योजना। वहीं DPR प्रिंट।' },
            { to: '/officer', icon: Building2, en: 'SCA district officer', hi: 'SCA ज़िला अधिकारी', den: 'Every case arrives pre-appraised: loan asked vs recommended, DSCR, default risk, evidence and rule version. Mark ready or send back.', dhi: 'हर केस पहले से जाँचा हुआ: माँगा बनाम सुझाया लोन, DSCR, जोखिम, सबूत और नियम संस्करण।' },
          ].map((d) => (
            <Link key={d.to} to={d.to} className="group card flex flex-col p-6 transition-colors hover:border-indigo/40">
              <d.icon className="size-7 text-indigo" />
              <div className="mt-4 font-display text-[22px] font-bold">{t(d.en, d.hi)}</div>
              <p className="mt-2 flex-1 text-[15px] text-ink/75">{t(d.den, d.dhi)}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-[15px] font-bold text-indigo">
                {t('Open', 'खोलें')} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Numbers from code */}
      <section className="bg-indigo-deep text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2">
          <div>
            <h2 className="font-display text-[30px] font-bold leading-tight sm:text-[36px]">{t('Numbers from tested code. Words from AI. Never the reverse.', 'संख्याएँ जाँचे हुए कोड से। शब्द AI से। कभी उल्टा नहीं।')}</h2>
            <p className="mt-4 text-[16px] text-white/75">
              {t(
                'Scheme rules are versioned data for NSFDC, NBCFDC and NSKFDC. The narrator only writes sentences around the engine’s numbers, and a numeric guard blocks any number that isn’t in the facts.',
                'NSFDC, NBCFDC और NSKFDC के नियम संस्करण वाले डेटा हैं। AI सिर्फ़ इंजन की संख्याओं के आसपास वाक्य लिखता है; जो संख्या तथ्यों में नहीं, उसे गार्ड रोक देता है।',
              )}
            </p>
            <Link to="/engine" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-indigo-deep">
              <ShieldCheck className="size-5 text-go" />
              {passed}/{GOLDEN.length} {t('golden tests passing — see them run', 'गोल्डन टेस्ट पास — चलते देखें')}
            </Link>
          </div>
          <ol className="space-y-3 text-[15px]">
            {[
              [t('Voice in', 'आवाज़'), t('Bhashini ASR, read-back of every number', 'भाषिणी ASR, हर संख्या दोहराकर पुष्टि')],
              [t('Feasibility engine', 'बाज़ार इंजन'), t('5/10 km catchment, Huff capture, saturation vs district', '5/10 किमी क्षेत्र, हफ़ मॉडल, ज़िले से तुलना')],
              [t('Finance engine', 'वित्त इंजन'), t('Scheme router, quarterly EMI + moratorium, DSCR, 1,000-run Monte Carlo', 'योजना राउटर, तिमाही किस्त + मोहलत, DSCR, 1,000 बार जाँच')],
              [t('Narrator + guard', 'वाचक + गार्ड'), t('Sarvam-30B writes words; guard checks every number', 'Sarvam-30B शब्द लिखता है; गार्ड हर संख्या जाँचता है')],
              [t('Handoff', 'सौंपना'), t('Bilingual DPR, document checklist, PM-SURAJ link, SCA queue', 'द्विभाषी DPR, दस्तावेज़ सूची, PM-SURAJ लिंक, SCA कतार')],
            ].map(([a, b], i) => (
              <li key={i} className="flex gap-4 rounded-xl bg-white/5 p-4">
                <span className="num grid size-8 shrink-0 place-items-center rounded-full bg-marigold text-[15px] font-bold text-indigo-deep">{i + 1}</span>
                <span>
                  <b className="block">{a}</b>
                  <span className="text-white/70">{b}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 py-10 text-[13px] text-muted">
        <div className="flex items-center gap-2 font-semibold text-ink">
          <FileCheck2 className="size-4" /> {t('Prototype on demo data', 'डेमो डेटा पर प्रोटोटाइप')}
        </div>
        <p className="mt-2 max-w-[80ch]">
          {t(
            'Village, market and price figures for Barabanki are synthetic, shaped like Census 2011 PCA, Mission Antyodaya 2020, Economic Census 6, HCES 2023-24, Agmarknet and NABARD PLP. Scheme terms follow NSFDC / NBCFDC / NSKFDC pages; conflicting terms are marked “SCA to confirm”.',
            'बाराबंकी के गाँव, बाज़ार और दाम के आंकड़े काल्पनिक हैं, जनगणना 2011, मिशन अंत्योदय 2020, आर्थिक जनगणना 6, HCES 2023-24, एगमार्कनेट और NABARD PLP के ढाँचे पर। योजना की शर्तें NSFDC / NBCFDC / NSKFDC से; जहाँ शर्तें अलग हैं, “SCA से पुष्टि करें” लिखा है।',
          )}
        </p>
      </footer>
    </div>
  )
}
