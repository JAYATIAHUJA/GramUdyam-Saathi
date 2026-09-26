import { clsx } from 'clsx'
import { GraduationCap } from 'lucide-react'
import { Section } from './Section'
import type { Plan } from '../../engine/plan'
import { useT } from '../../lib/store'

/* ---------------- Risks & SWOT ---------------- */
export function RisksTab({ plan }: { plan: Plan }) {
  const t = useT()
  const q: { k: 'S' | 'W' | 'O' | 'T'; en: string; hi: string; cls: string }[] = [
    { k: 'S', en: 'Strengths', hi: 'ताक़त', cls: 'border-go/40 bg-go-soft/50' },
    { k: 'W', en: 'Weaknesses', hi: 'कमज़ोरी', cls: 'border-caution/40 bg-caution-soft/50' },
    { k: 'O', en: 'Opportunities', hi: 'मौक़े', cls: 'border-indigo/30 bg-indigo-soft/60' },
    { k: 'T', en: 'Threats', hi: 'ख़तरे', cls: 'border-risk/30 bg-risk-soft/50' },
  ]
  const fit = plan.fit
  return (
    <div className="items-start gap-x-5 gap-y-3 lg:grid lg:grid-cols-3">
      <Section className="lg:col-start-1 lg:row-start-1 lg:mb-0" title={t('Founder-Fit', 'फ़ाउंडर-फ़िट')} aside={<span className={clsx('num text-[28px] font-extrabold', fit.score >= 65 ? 'text-go' : fit.score >= 50 ? 'text-caution' : 'text-risk')}>{fit.score}<span className="text-[15px] text-muted">/100</span></span>}>
        <div className="card space-y-2 p-3.5">
          {fit.parts.map((p) => (
            <div key={p.key} className="grid grid-cols-[1fr_72px_38px] items-center gap-2 text-[13.5px]">
              <span className="leading-tight">{t(p.en, p.hi)}</span>
              <div className="h-2 rounded-full bg-khadi">
                <div className={clsx('h-2 rounded-full', p.got / p.max >= 0.7 ? 'bg-go' : p.got / p.max >= 0.4 ? 'bg-caution' : 'bg-risk')} style={{ width: `${(p.got / p.max) * 100}%` }} />
              </div>
              <span className="num text-right text-muted">
                {Math.round(p.got)}/{p.max}
              </span>
            </div>
          ))}
          <p className="border-t border-line pt-2 text-[12px] leading-snug text-muted">{t('Weights: MoSJE evaluation, lack of skill or interest was the #1 reason units struggled (61.5%).', 'वज़न: MoSJE मूल्यांकन, हुनर या रुचि की कमी सबसे बड़ा कारण (61.5%)।')}</p>
        </div>
      </Section>

        {fit.score < 50 && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border-2 border-indigo/20 bg-indigo-soft/60 p-2.5 lg:col-start-1 lg:row-start-2 lg:mb-0">
            <GraduationCap className="mt-0.5 size-6 shrink-0 text-indigo" />
            <div className="text-[13.5px] leading-snug">
              <b>{t('Train first, then borrow', 'पहले प्रशिक्षण, फिर लोन')}</b>
              <p>{t(plan.feasibility.activity.training.en, plan.feasibility.activity.training.hi)}</p>
              <p className="mt-1 text-muted">{t('Free under PM-DAKSH / RSETI for SC, OBC and Safai Karamchari families.', 'SC, OBC और सफ़ाई कर्मचारी परिवारों के लिए PM-DAKSH / RSETI में मुफ़्त।')}</p>
            </div>
          </div>
        )}

      <Section className="lg:col-span-2 lg:col-start-2 lg:row-start-1 lg:mb-0" title="SWOT">
        <div className="grid grid-cols-2 gap-2">
          {q.map((x) => (
            <div key={x.k} className={clsx('rounded-xl border px-3 py-2', x.cls)}>
              <div className="font-display text-[16px] font-bold">{t(x.en, x.hi)}</div>
              <ul className="mt-1 space-y-1 text-[13px] leading-snug">
                {plan.swot[x.k].slice(0, 4).map((item, i) => (
                  <li key={i}>
                    {t(item.en, item.hi)}
                    {item.fact && <span className="ml-1 rounded bg-white/80 px-1 text-[10.5px] font-bold text-muted">{item.fact}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-1.5 text-[12px] text-muted">{t('Every point comes from an engine fact; tags point to the evidence in the Market tab.', 'हर बात इंजन के तथ्य से; टैग बाज़ार टैब के सबूत की ओर।')}</p>
      </Section>

      <Section className={clsx('lg:row-start-2 lg:mb-0', fit.score < 50 ? 'lg:col-span-2 lg:col-start-2' : 'lg:col-span-3 lg:col-start-1')} title={t('Threats and how to handle them', 'ख़तरे और उनसे बचाव')}>
        <ul className={clsx('grid gap-1.5', fit.score < 50 ? 'lg:grid-cols-2' : 'lg:grid-cols-3')}>
          {plan.feasibility.threats.map((x) => (
            <li key={x.id} className="card flex items-start gap-2 px-2.5 py-1.5 text-[13px] leading-snug">
              <span className={clsx('mt-1 size-2.5 shrink-0 rounded-full', x.level === 'high' ? 'bg-risk' : x.level === 'medium' ? 'bg-caution' : 'bg-go')} />
              <span>
                {t(x.en, x.hi)}
                <span className="ml-1 text-[12px] font-semibold text-muted">({t(x.level, x.level === 'high' ? 'ज़्यादा' : x.level === 'medium' ? 'मध्यम' : 'कम')})</span>
              </span>
            </li>
          ))}
          {plan.feasibility.activity.risks.map((x, i) => (
            <li key={i} className="card flex items-start gap-2 px-2.5 py-1.5 text-[13px] leading-snug">
              <span className="mt-1 size-2.5 shrink-0 rounded-full bg-caution" />
              {t(x.en, x.hi)}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  )
}
