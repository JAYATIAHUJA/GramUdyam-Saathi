import { clsx } from 'clsx'
import { MapPin } from 'lucide-react'
import { useState } from 'react'
import { CatchmentMap } from '../CatchmentMap'
import { DemandVsBreakeven, SeasonBars } from '../charts'
import { Collapse } from './Collapse'
import { Section } from './Section'
import { ConfidenceBadge, FactRow } from '../ui'
import type { Plan } from '../../engine/plan'
import { MONTHS_EN, MONTHS_HI, pct } from '../../lib/format'
import { useT } from '../../lib/store'

/* ---------------- Market ---------------- */
export function MarketTab({ plan }: { plan: Plan }) {
  const t = useT()
  const f = plan.feasibility
  const p = plan.recommended.projection
  const sat = f.saturation
  const satTxt = { crowded: t('Crowded', 'भीड़'), normal: t('Normal', 'सामान्य'), gap: t('Gap, room to grow', 'कमी, जगह है') }[sat.label]
  const satCls = { crowded: 'text-risk bg-risk-soft', normal: 'text-caution bg-caution-soft', gap: 'text-go bg-go-soft' }[sat.label]
  const [showFacts, setShowFacts] = useState(false)
  return (
    <div className="gap-5 lg:columns-2 xl:columns-3">
      <Section title={t('Your market, 5 and 10 km', 'आपका बाज़ार, 5 और 10 किमी')} aside={<ConfidenceBadge c={f.confidence === 'Low' ? 'model' : 'official'} />}>
        <CatchmentMap f={f} />
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-white p-3">
            <div className="num text-[22px] font-bold">{f.catchment5.population.toLocaleString('en-IN')}</div>
            <div className="text-[12px] text-muted">{t('people in 5 km', '5 किमी में लोग')}</div>
          </div>
          <div className="rounded-xl bg-white p-3">
            <div className="num text-[22px] font-bold">
              {f.competitors.low}–{f.competitors.high}
            </div>
            <div className="text-[12px] text-muted">{t('similar units', 'ऐसी इकाइयाँ')}</div>
          </div>
          <div className={clsx('rounded-xl p-3', satCls)}>
            <div className="num text-[22px] font-bold">{sat.index.toFixed(2)}×</div>
            <div className="text-[12px] font-semibold">{satTxt}</div>
          </div>
        </div>
        {f.confidence === 'Low' && (
          <p className="mt-3 rounded-lg bg-caution-soft px-3 py-2 text-[13.5px] text-caution">{t('Thin data for this village (no pakka road in the records). Block averages used, confidence Low.', 'इस गाँव का डेटा कम है। ब्लॉक औसत लिया, भरोसा कम।')}</p>
        )}
      </Section>

      <Section title={t('Can sales cover the costs?', 'क्या बिक्री से ख़र्च निकलेगा?')}>
        <div className="card p-4">
          {p && <DemandVsBreakeven expected={p.expectedMonthlySales} breakeven={p.breakEvenMonthlySales} />}
          <p className="mt-3 border-t border-line pt-3 text-[13.5px]">{t(f.demand.channelNote.en, f.demand.channelNote.hi)}</p>
        </div>
      </Section>

      <Section title={t('Good months and lean months', 'अच्छे और कमज़ोर महीने')}>
        <div className="card p-4">
          <SeasonBars idx={f.seasonality.index} lean={f.seasonality.leanMonths} />
          <p className="mt-2 text-[13.5px]">
            {t('Lean', 'कमज़ोर')}: <b>{f.seasonality.leanMonths.map((m) => t(MONTHS_EN[m], MONTHS_HI[m])).join(', ') || '-'}</b>
            {f.seasonality.peakMonths.length > 0 && (
              <>
                {' '}
                · {t('Best', 'सबसे अच्छे')}: <b>{f.seasonality.peakMonths.map((m) => t(MONTHS_EN[m], MONTHS_HI[m])).join(', ')}</b>
              </>
            )}
          </p>
        </div>
      </Section>

      <Section title={t('Price to charge', 'कितना दाम लें')}>
        <div className="card p-4">
          <div className="text-[14px] text-muted">{t(f.price.item.en, f.price.item.hi)}</div>
          <div className="relative mt-6 mb-2 h-2 rounded-full bg-gradient-to-r from-caution-soft via-go-soft to-caution-soft">
            <span className="absolute -top-6 -translate-x-1/2 rounded bg-indigo px-1.5 text-[12px] font-bold text-white" style={{ left: `${((f.price.suggested - f.price.low) / (f.price.high - f.price.low)) * 100}%` }}>
              {f.price.unit.en === '%' ? `${f.price.suggested}%` : `₹${f.price.suggested}`}
            </span>
            <span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-indigo" style={{ left: `${((f.price.suggested - f.price.low) / (f.price.high - f.price.low)) * 100}%` }} />
          </div>
          <div className="flex justify-between text-[12.5px] text-muted">
            <span>{f.price.unit.en === '%' ? `${f.price.low}%` : `₹${f.price.low}`}</span>
            <span>
              {t('per', 'प्रति')} {t(f.price.unit.en, f.price.unit.hi)}
            </span>
            <span>{f.price.unit.en === '%' ? `${f.price.high}%` : `₹${f.price.high}`}</span>
          </div>
          <p className="mt-3 text-[14px]">
            {t('Suggested', 'सुझाया')} {f.price.unit.en === '%' ? `${f.price.suggested}%` : `₹${f.price.suggested}`} → {t('margin', 'मार्जिन')} <b>{pct(f.price.marginPct)}</b>
          </p>
        </div>
      </Section>

      <Section title={t('Where to sell', 'कहाँ बेचें')}>
        <ul className="space-y-2">
          {f.activity.channels.map((c, i) => (
            <li key={i} className="flex items-center gap-2 text-[15px]">
              <MapPin className="size-4 text-indigo" /> {t(c.en, c.hi)}
            </li>
          ))}
        </ul>
      </Section>

      <Collapse open={showFacts} toggle={() => setShowFacts((x) => !x)} title={t(`Every number, with its source (${f.facts.length})`, `हर संख्या, उसके स्रोत के साथ (${f.facts.length})`)}>
        <div className="px-1">
          {f.facts.map((x) => (
            <FactRow key={x.id} label={`${x.id} · ${t(x.label.en, x.label.hi)}`} value={x.display} source={x.source} year={x.year} c={x.confidence} />
          ))}
        </div>
      </Collapse>
    </div>
  )
}
