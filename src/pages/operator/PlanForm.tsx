import { clsx } from 'clsx'
import { Timer } from 'lucide-react'
import { ActivityArt } from '../../components/art'
import { ACTIVITIES, activityByCode, sizeCost } from '../../data/activities'
import { VILLAGES } from '../../data/villages'
import type { PlanInput } from '../../engine/plan'
import { lakh } from '../../lib/format'
import { useT } from '../../lib/store'
import { F, Group, Rupee, Seg } from './fields'
import { SetFit, SetInput } from './types'

/** The three-part form a helper fills with the applicant. */
export function PlanForm({ inp, set, setFit, editing, elapsed }: { inp: PlanInput; set: SetInput; setFit: SetFit; editing: string | null; elapsed: number }) {
  const t = useT()
  const a = activityByCode(inp.activity)
  return (
    <main className="card flex flex-col lg:min-h-0">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-2">
        <div>
          <h1 className="font-display text-[22px] leading-tight font-bold text-indigo-deep">{editing ? t(`Editing ${inp.name}`, `${inp.name} की योजना`) : t('New plan with the applicant', 'आवेदक के साथ नई योजना')}</h1>
          <p className="text-[13px] text-muted">{t('Fill with the applicant sitting next to you. The result updates as you go.', 'आवेदक के साथ बैठकर भरें। नतीजा साथ-साथ बदलता है।')}</p>
        </div>
        <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-bold', elapsed > 600 ? 'bg-risk-soft text-risk' : 'bg-go-soft text-go')} title={t('Target: under 10 minutes', 'लक्ष्य: 10 मिनट से कम')}>
          <Timer className="size-4" />
          {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')} / 10:00
        </span>
      </div>

      <div className="flex-1 space-y-3 px-5 py-2.5 lg:min-h-0 lg:overflow-y-auto">
        <Group n={1} cols="xl:grid-cols-4" title={t('About the applicant', 'आवेदक की जानकारी')}>
          <F label={t('Full name', 'पूरा नाम')}>
            <input value={inp.name} onChange={(e) => set({ name: e.target.value })} className="inp" placeholder={t('e.g. Kamla Devi', 'जैसे कमला देवी')} autoFocus />
          </F>
          <F label={t('Village', 'गाँव')}>
            <select value={inp.lgd} onChange={(e) => set({ lgd: e.target.value })} className="inp">
              {VILLAGES.map((v) => (
                <option key={v.lgd} value={v.lgd}>
                  {t(v.name, v.nameHi)}, {t(v.block, v.blockHi)}
                </option>
              ))}
            </select>
          </F>
          <F label={t('Social group (decides the lender)', 'वर्ग (इससे लोन देने वाला निगम तय होता है)')}>
            <Seg
              value={inp.category}
              onChange={(v) => set({ category: v as PlanInput['category'] })}
              opts={[
                ['SC', 'SC'],
                ['OBC', 'OBC'],
                ['SAFAI', t('Safai K.', 'सफ़ाई क.')],
              ]}
            />
          </F>
          <F label={t('Family income per year', 'परिवार की सालाना आय')}>
            <Rupee value={inp.familyIncome} onChange={(n) => set({ familyIncome: n })} step={10000} />
          </F>
        </Group>

        <Group n={2} title={t('Business and money', 'काम और पैसा')}>
          <div className="sm:col-span-2 xl:col-span-3">
            <span className="mb-1.5 block text-[13px] font-semibold text-muted">{t('Business', 'काम')}</span>
            <div className="grid grid-cols-5 gap-1.5 xl:grid-cols-9">
              {ACTIVITIES.map((x) => (
                <button key={x.code} type="button" onClick={() => set({ activity: x.code, sizeId: null })} aria-pressed={inp.activity === x.code} className={clsx('flex flex-col items-center gap-1 rounded-xl border p-1.5 text-center transition-colors', inp.activity === x.code ? 'border-indigo bg-indigo-soft ring-1 ring-indigo/40' : 'border-line bg-white hover:border-indigo/40')}>
                  <ActivityArt code={x.code} className="aspect-square w-full max-w-[42px]" />
                  <span className="text-[11.5px] leading-tight font-semibold">{t(x.name.en, x.name.hi).split(' (')[0]}</span>
                </button>
              ))}
            </div>
          </div>
          <F label={t('Size', 'आकार')}>
            <select value={inp.sizeId ?? ''} onChange={(e) => set({ sizeId: e.target.value || null })} className="inp">
              <option value="">{t('Saathi decides (largest safe)', 'साथी तय करे (सबसे बड़ा सुरक्षित)')}</option>
              {a.sizes.map((s) => (
                <option key={s.id} value={s.id}>
                  {t(s.label.en, s.label.hi)}, {lakh(sizeCost(s))}
                </option>
              ))}
            </select>
          </F>
          <F label={t('Applicant’s own savings (margin money)', 'आवेदक की अपनी बचत (मार्जिन मनी)')}>
            <Rupee value={inp.margin} onChange={(n) => set({ margin: n })} step={1000} />
          </F>
          <F label={t('Interest in the first months', 'शुरुआती महीनों का ब्याज')}>
            <Seg
              value={inp.mode}
              onChange={(v) => set({ mode: v as PlanInput['mode'] })}
              opts={[
                ['serviced', t('Pay every quarter', 'हर तिमाही भरें')],
                ['capitalised', t('Add to the loan', 'लोन में जोड़ें')],
              ]}
            />
          </F>
        </Group>

        <Group n={3} title={t('Is this work right for them?', 'क्या यह काम इनके लिए सही है?')}>
          <F label={t('Done this work before?', 'पहले यह काम किया है?')}>
            <Seg value={inp.fit.experience} onChange={(v) => setFit({ experience: v as 0 | 1 | 2 })} opts={[[0, t('No', 'नहीं')], [1, t('< 2 years', '2 साल से कम')], [2, t('2+ years', '2+ साल')]]} />
          </F>
          <F label={t('Family members who will help', 'मदद करने वाले घर के लोग')}>
            <Seg value={inp.fit.familyLabour} onChange={(v) => setFit({ familyLabour: v as 0 | 1 | 2 })} opts={[[0, t('None', 'कोई नहीं')], [1, '1'], [2, '2+']]} />
          </F>
          <F label={t('Hours a day', 'रोज़ कितने घंटे')}>
            <Seg value={inp.fit.hours} onChange={(v) => setFit({ hours: v as 0 | 1 | 2 })} opts={[[0, t('< 4', '4 से कम')], [1, t('4 to 8', '4 से 8')], [2, t('Full day', 'पूरा दिन')]]} />
          </F>
          <F label={t('Training taken?', 'प्रशिक्षण लिया?')}>
            <Seg value={inp.fit.training} onChange={(v) => setFit({ training: v as 0 | 1 })} opts={[[0, t('No', 'नहीं')], [1, t('Yes', 'हाँ')]]} />
          </F>
          <F label={t('How much do they like this work? (1 low, 5 high)', 'यह काम कितना पसंद है? (1 कम, 5 ज़्यादा)')} wide>
            <Seg value={inp.fit.interest} onChange={(v) => setFit({ interest: v as 1 | 2 | 3 | 4 | 5 })} opts={[[1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5']]} />
          </F>
        </Group>
      </div>
    </main>
  )
}
