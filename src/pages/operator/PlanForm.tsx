import { clsx } from 'clsx'
import { Timer } from 'lucide-react'
import { ActivityArt } from '../../components/art'
import { ACTIVITIES, activityByCode, sizeCost } from '../../data/activities'
import { VILLAGES } from '../../data/villages'
import type { PlanInput } from '../../engine/plan'
import { lakh } from '../../lib/format'
import { useT } from '../../lib/store'
import { F, Group, Rupee, Seg } from './fields'
import { type FieldKey, SetFit, SetInput } from './types'

/** The three-part form a helper fills with the applicant. */
export function PlanForm({ inp, filled, set, setFit, editing, elapsed }: { inp: PlanInput; filled: Set<FieldKey>; set: SetInput; setFit: SetFit; editing: string | null; elapsed: number }) {
  const t = useT()
  const a = activityByCode(inp.activity)
  const has = (k: FieldKey) => filled.has(k)
  const fit = <K extends keyof PlanInput['fit']>(k: K & FieldKey) => (has(k) ? inp.fit[k] : undefined)
  return (
    <main className="card flex flex-col lg:min-h-0">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-5 py-3">
        <div className="min-w-0">
          <h1 className="truncate font-display text-[20px] leading-tight font-bold text-indigo-deep">{editing ? inp.name : t('New plan', 'नई योजना')}</h1>
          <p className="truncate text-[12.5px] text-muted">{t('Fill with the applicant. Result updates on the right.', 'आवेदक के साथ भरें। नतीजा दाईं ओर बदलता है।')}</p>
        </div>
        <span className={clsx('inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[12.5px] font-bold', elapsed > 600 ? 'bg-risk-soft text-risk' : 'bg-khadi text-muted')} title={t('Target: under 10 minutes', 'लक्ष्य: 10 मिनट से कम')}>
          <Timer className="size-3.5" />
          <span className="num">
            {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}
          </span>
        </span>
      </div>

      <div className="flex-1 space-y-5 px-5 py-4 lg:min-h-0 lg:overflow-y-auto">
        <Group n={1} cols="xl:grid-cols-2" title={t('Applicant', 'आवेदक')}>
          <F label={t('Full name', 'पूरा नाम')}>
            <input value={inp.name} onChange={(e) => set({ name: e.target.value })} className="inp h-11" placeholder={t('e.g. Kamla Devi', 'जैसे कमला देवी')} autoFocus />
          </F>
          <F label={t('Village', 'गाँव')}>
            <select value={has('lgd') ? inp.lgd : ''} onChange={(e) => set({ lgd: e.target.value })} className={clsx('inp h-11', !has('lgd') && 'text-muted/70')}>
              <option value="" disabled>
                {t('Pick village', 'गाँव चुनें')}
              </option>
              {VILLAGES.map((v) => (
                <option key={v.lgd} value={v.lgd}>
                  {t(v.name, v.nameHi)}, {t(v.block, v.blockHi)}
                </option>
              ))}
            </select>
          </F>
          <F label={t('Social group', 'वर्ग')} hint={t('Decides which lender', 'इससे लोन देने वाला निगम तय होता है')}>
            <Seg
              value={has('category') ? inp.category : undefined}
              onChange={(v) => set({ category: v as PlanInput['category'] })}
              opts={[
                ['SC', 'SC'],
                ['OBC', 'OBC'],
                ['SAFAI', t('Safai Karamchari', 'सफ़ाई कर्मचारी')],
              ]}
            />
          </F>
          <F label={t('Family income / year', 'परिवार की सालाना आय')}>
            <Rupee value={inp.familyIncome} blank={!has('familyIncome')} placeholder={t('e.g. 150000', 'जैसे 150000')} onChange={(n) => set({ familyIncome: n })} step={10000} />
          </F>
        </Group>

        <Group n={2} title={t('Business', 'काम')} hint={t('Pick one', 'एक चुनें')}>
          <div className="grid grid-cols-3 gap-2 sm:col-span-2 sm:grid-cols-5 xl:col-span-3 xl:grid-cols-9">
            {ACTIVITIES.map((x) => (
              <button key={x.code} type="button" onClick={() => set({ activity: x.code, sizeId: null })} aria-pressed={has('activity') && inp.activity === x.code} className={clsx('flex flex-col items-center gap-1 rounded-xl border px-1 py-2 text-center transition-colors', has('activity') && inp.activity === x.code ? 'border-indigo bg-indigo-soft ring-1 ring-indigo/40' : 'border-line bg-white hover:border-indigo/40')}>
                <ActivityArt code={x.code} className="size-9" />
                <span className="line-clamp-1 text-[11.5px] leading-tight font-semibold">{t(x.name.en, x.name.hi).split(' (')[0]}</span>
              </button>
            ))}
          </div>
          <F label={t('Size', 'आकार')}>
            <select value={inp.sizeId ?? ''} onChange={(e) => set({ sizeId: e.target.value || null })} disabled={!has('activity')} className="inp h-11 disabled:cursor-not-allowed disabled:bg-khadi/50 disabled:text-muted">
              <option value="">{t('Let Saathi pick', 'साथी तय करे')}</option>
              {a.sizes.map((s) => (
                <option key={s.id} value={s.id}>
                  {t(s.label.en, s.label.hi)}, {lakh(sizeCost(s))}
                </option>
              ))}
            </select>
          </F>
          <F label={t('Own savings', 'अपनी बचत')} hint={t('Margin money they put in', 'आवेदक की तरफ़ से लगाई रकम')}>
            <Rupee value={inp.margin} blank={!has('margin')} placeholder={t('e.g. 50000', 'जैसे 50000')} onChange={(n) => set({ margin: n })} step={1000} />
          </F>
          <F label={t('Early interest', 'शुरुआती ब्याज')} hint={t('During the first months', 'शुरू के महीनों में')}>
            <Seg
              value={inp.mode}
              onChange={(v) => set({ mode: v as PlanInput['mode'] })}
              opts={[
                ['serviced', t('Pay quarterly', 'हर तिमाही')],
                ['capitalised', t('Add to loan', 'लोन में जोड़ें')],
              ]}
            />
          </F>
        </Group>

        <Group n={3} title={t('Right fit?', 'सही काम?')} hint={t('Is this work right for them', 'क्या यह काम इनके लिए सही है')}>
          <F label={t('Experience', 'अनुभव')}>
            <Seg value={fit('experience')} onChange={(v) => setFit({ experience: v as 0 | 1 | 2 })} opts={[[0, t('None', 'नहीं')], [1, t('< 2 yrs', '< 2 साल')], [2, t('2+ yrs', '2+ साल')]]} />
          </F>
          <F label={t('Family help', 'घर से मदद')}>
            <Seg value={fit('familyLabour')} onChange={(v) => setFit({ familyLabour: v as 0 | 1 | 2 })} opts={[[0, t('None', 'कोई नहीं')], [1, '1'], [2, '2+']]} />
          </F>
          <F label={t('Hours a day', 'रोज़ घंटे')}>
            <Seg value={fit('hours')} onChange={(v) => setFit({ hours: v as 0 | 1 | 2 })} opts={[[0, '< 4'], [1, '4–8'], [2, t('Full day', 'पूरा दिन')]]} />
          </F>
          <F label={t('Training', 'प्रशिक्षण')}>
            <Seg value={fit('training')} onChange={(v) => setFit({ training: v as 0 | 1 })} opts={[[0, t('No', 'नहीं')], [1, t('Yes', 'हाँ')]]} />
          </F>
          <F label={t('Interest in this work', 'काम में रुचि')} hint={t('1 = low, 5 = high', '1 = कम, 5 = ज़्यादा')} wide>
            <Seg value={fit('interest')} onChange={(v) => setFit({ interest: v as 1 | 2 | 3 | 4 | 5 })} opts={[[1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5']]} />
          </F>
        </Group>
      </div>
    </main>
  )
}
