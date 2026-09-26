import { clsx } from 'clsx'
import { Check, Download, ExternalLink, MessageCircle, Phone, Send } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Section } from './Section'
import { docsFor } from './documents'
import { DISTRICT } from '../../data/villages'
import { project } from '../../engine/business'
import type { Plan } from '../../engine/plan'
import { inr } from '../../lib/format'
import { useT } from '../../lib/store'

export function NextTab({ plan }: { plan: Plan }) {
  const t = useT()
  const docs = docsFor(plan)
  const [ticks, setTicks] = useState<boolean[]>(docs.map((d) => !!(d as { done?: boolean }).done))
  const r = plan.recommended
  const share = encodeURIComponent(
    t(
      `My GramUdyam Saathi plan ${plan.id}: ${plan.feasibility.activity.name.en}, ${r.unit.size.label.en}. Loan ${inr(r.loan)}, ${inr(r.schedule?.instalment ?? 0)} every 3 months.`,
      `मेरी ग्रामउद्यम साथी योजना ${plan.id}: ${plan.feasibility.activity.name.hi}, ${r.unit.size.label.hi}। लोन ${inr(r.loan)}, हर 3 महीने ${inr(r.schedule?.instalment ?? 0)}।`,
    ),
  )
  return (
    <div className="items-start gap-x-5 lg:grid lg:grid-cols-3">
      <div className="mb-4 grid gap-2.5">
        <Link to={`/dpr/${plan.id}`} className="flex items-center gap-3 rounded-xl bg-indigo px-4 py-3 text-white">
          <Download className="size-6 text-marigold" />
          <span className="flex-1">
            <b className="block text-[17px]">{t('Download project report (DPR)', 'प्रोजेक्ट रिपोर्ट (DPR) डाउनलोड करें')}</b>
            <span className="text-[13px] text-white/75">{t('Hindi + English, bank format, with schedule', 'हिंदी + अंग्रेज़ी, बैंक फ़ॉर्मेट, किस्त तालिका सहित')}</span>
          </span>
        </Link>
        <a href="https://pmsuraj.dosje.gov.in" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border-2 border-indigo/25 bg-white px-4 py-3">
          <ExternalLink className="size-6 text-indigo" />
          <span className="flex-1">
            <b className="block text-[17px]">{t('Apply on PM-SURAJ', 'PM-SURAJ पर आवेदन करें')}</b>
            <span className="text-[13px] text-muted">{t('Your plan ID fills the summary; attach the DPR', 'योजना ID से सारांश भरें; DPR लगाएँ')}</span>
          </span>
        </a>
        <a href={`https://wa.me/?text=${share}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border-2 border-go/25 bg-white px-4 py-3">
          <MessageCircle className="size-6 text-go" />
          <span className="flex-1">
            <b className="block text-[17px]">{t('Share on WhatsApp', 'WhatsApp पर भेजें')}</b>
            <span className="text-[13px] text-muted">{t('Send the summary to family or your VLE', 'परिवार या VLE को सारांश भेजें')}</span>
          </span>
        </a>
      </div>

      <Section className="lg:col-span-2" title={t('Documents to carry', 'साथ ले जाने वाले काग़ज़')} aside={<span className="num text-[14px] font-bold text-muted">{ticks.filter(Boolean).length}/{docs.length}</span>}>
        <ul className="card grid divide-y divide-line lg:grid-cols-2 lg:gap-x-4 lg:divide-y-0 lg:px-1">
          {docs.map((d, i) => (
            <li key={i}>
              <button onClick={() => setTicks((x) => x.map((v, j) => (j === i ? !v : v)))} className="flex w-full items-center gap-3 px-3 py-2.5 text-left">
                <span className={clsx('grid size-6 shrink-0 place-items-center rounded-md border-2', ticks[i] ? 'border-go bg-go text-white' : 'border-line')}>{ticks[i] && <Check className="size-4" strokeWidth={3} />}</span>
                <span className={clsx('flex-1 text-[14.5px] leading-snug', ticks[i] && 'text-muted line-through')}>{t(d.en, d.hi)}</span>
                {d.dl && <span className="rounded bg-indigo-soft px-1.5 py-0.5 text-[10.5px] font-bold text-indigo">DigiLocker</span>}
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[12.5px] text-muted">{t('DigiLocker pull replaces photocopies in Phase 2.', 'चरण 2 में DigiLocker से सीधे मिलेंगे, फ़ोटोकॉपी नहीं।')}</p>
      </Section>

      <Section className="lg:col-span-2" title={t('Your SCA office', 'आपका SCA कार्यालय')}>
        <div className="card p-4 text-[14.5px]">
          <b>{t(DISTRICT.sca.name, DISTRICT.sca.nameHi)}</b>
          <p className="text-muted">{DISTRICT.sca.address}</p>
          <p className="mt-2 inline-flex items-center gap-2 font-semibold text-indigo">
            <Phone className="size-4" /> {DISTRICT.sca.phone}
          </p>
          <p className="mt-3 flex items-center gap-2 rounded-lg bg-go-soft px-3 py-2 text-go">
            <Send className="size-4" />
            {t(`Plan ${plan.id} is already in the SCA officer’s queue.`, `योजना ${plan.id} SCA अधिकारी की कतार में पहुँच गई है।`)}
          </p>
        </div>
      </Section>

      <Section title={t('After the loan', 'लोन के बाद')}>
        <ul className="space-y-2 text-[14.5px]">
          <li className="flex gap-2"><Check className="mt-0.5 size-4 text-go" />{t('Reminder 7 days before each quarterly instalment (SMS / WhatsApp).', 'हर तिमाही किस्त से 7 दिन पहले याद दिलाना (SMS / WhatsApp)।')}</li>
          <li className="flex gap-2"><Check className="mt-0.5 size-4 text-go" />{t('Lean-month nudge: “set aside money now”.', 'कमज़ोर महीनों से पहले: “अभी पैसा बचाएँ”।')}</li>
          <li className="flex gap-2"><Check className="mt-0.5 size-4 text-go" />{t('Register on Udyam after sanction.', 'मंज़ूरी के बाद उद्यम पोर्टल पर पंजीकरण।')}</li>
        </ul>
      </Section>
    </div>
  )
}
