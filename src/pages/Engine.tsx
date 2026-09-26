import { clsx } from 'clsx'
import { CheckCircle2, Play, ShieldAlert, ShieldCheck, XCircle } from 'lucide-react'
import { useState } from 'react'
import { TopNav } from '../components/site'
import { GOLDEN } from '../engine/golden'
import { numericGuard } from '../engine/guard'
import { naiveCeiling } from '../engine/router'
import { RULES, RULESET_VERSION, type SocialCategory } from '../engine/rules'
import { buildSchedule } from '../engine/amortise'
import { inr } from '../lib/format'
import { useT } from '../lib/store'

export default function Engine() {
  const t = useT()
  const [results, setResults] = useState<{ id: string; actual: string; pass: boolean; ms: number }[] | null>(null)
  const run = () => {
    setResults(
      GOLDEN.map((g) => {
        const t0 = performance.now()
        const r = g.run()
        return { id: g.id, ...r, ms: performance.now() - t0 }
      }),
    )
  }
  const passed = results?.filter((r) => r.pass).length ?? 0

  return (
    <div className="min-h-dvh bg-paper">
      <TopNav />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-[36px] font-bold leading-tight text-indigo-deep">{t('How Saathi computes', 'साथी कैसे गणना करता है')}</h1>
        <p className="mt-2 max-w-[70ch] text-[16px] text-muted">
          {t('Every rupee comes from deterministic, versioned code. These are the SRS golden cases, run in your browser against the same engine the app uses.', 'हर रुपया तय, संस्करण वाले कोड से आता है। ये SRS के गोल्डन केस हैं, आपके ब्राउज़र में उसी इंजन पर चलते हैं जो ऐप चलाता है।')}
        </p>

        <section className="card mt-6 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
            <div className="font-display text-[20px] font-bold">{t('Golden tests', 'गोल्डन टेस्ट')}</div>
            <div className="flex items-center gap-3">
              {results && (
                <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[14px] font-bold', passed === GOLDEN.length ? 'bg-go-soft text-go' : 'bg-risk-soft text-risk')}>
                  {passed === GOLDEN.length ? <ShieldCheck className="size-4" /> : <ShieldAlert className="size-4" />}
                  {passed}/{GOLDEN.length} {t('passed', 'पास')}
                </span>
              )}
              <button onClick={run} className="inline-flex items-center gap-2 rounded-full bg-indigo px-4 py-2 font-bold text-white">
                <Play className="size-4" /> {results ? t('Run again', 'फिर चलाएँ') : t('Run all', 'सब चलाएँ')}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-line text-left text-[12.5px] text-muted">
                  <th className="px-4 py-2 font-semibold">#</th>
                  <th className="px-3 font-semibold">{t('Input', 'इनपुट')}</th>
                  <th className="px-3 font-semibold">{t('Expected (SRS §11.4)', 'अपेक्षित (SRS §11.4)')}</th>
                  <th className="px-3 font-semibold">{t('Engine output', 'इंजन आउटपुट')}</th>
                  <th className="px-3 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {GOLDEN.map((g) => {
                  const r = results?.find((x) => x.id === g.id)
                  return (
                    <tr key={g.id} className="border-b border-line last:border-0 align-top">
                      <td className="px-4 py-3 font-bold">{g.id}</td>
                      <td className="px-3 py-3">{g.input}</td>
                      <td className="px-3 py-3 text-muted">{g.expected}</td>
                      <td className="num px-3 py-3 text-[15px]">{r ? r.actual : <span className="text-muted">-</span>}</td>
                      <td className="px-3 py-3">
                        {r && (r.pass ? <CheckCircle2 className="size-5 text-go" aria-label="pass" /> : <XCircle className="size-5 text-risk" aria-label="fail" />)}
                        {r && <div className="text-[11px] text-muted">{r.ms.toFixed(1)} ms</div>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <RouterPlayground />
          <GuardPlayground />
        </div>

        <section className="card mt-6 p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-[20px] font-bold">{t('Scheme rules (data, not code)', 'योजना नियम (डेटा, कोड नहीं)')}</h2>
            <span className="text-[13px] font-semibold text-muted">{RULESET_VERSION}</span>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b border-line text-left text-[12.5px] text-muted">
                  <th className="py-2 pr-3 font-semibold">ID</th>
                  <th className="pr-3 font-semibold">{t('Product', 'योजना')}</th>
                  <th className="pr-3 text-right font-semibold">{t('Project', 'प्रोजेक्ट')}</th>
                  <th className="pr-3 text-right font-semibold">{t('Finance', 'वित्त')}</th>
                  <th className="pr-3 text-right font-semibold">{t('Max loan', 'अधिकतम')}</th>
                  <th className="pr-3 text-right font-semibold">{t('Rate', 'दर')}</th>
                  <th className="pr-3 text-right font-semibold">{t('Tenure', 'अवधि')}</th>
                  <th className="pr-3 text-right font-semibold">{t('Moratorium', 'मोहलत')}</th>
                  <th className="font-semibold">{t('Source', 'स्रोत')}</th>
                </tr>
              </thead>
              <tbody className="num">
                {RULES.map((r) => (
                  <tr key={r.id} className="border-b border-line last:border-0">
                    <td className="py-2 pr-3 font-sans text-[12px] text-muted">{r.id}</td>
                    <td className="pr-3 font-sans font-semibold">{r.corporation} {r.product}</td>
                    <td className="pr-3 text-right">{inr(r.minCost)}–{inr(r.maxCost)}</td>
                    <td className="pr-3 text-right">{r.loanPct * 100}%</td>
                    <td className="pr-3 text-right">{inr(r.maxLoan)}</td>
                    <td className="pr-3 text-right">{(r.ratePa * 100).toFixed(1)}%</td>
                    <td className="pr-3 text-right">{r.tenureQ} q</td>
                    <td className="pr-3 text-right">{r.moratoriumQ} q{r.plantationMoratoriumQ ? ` (${r.plantationMoratoriumQ})` : ''}</td>
                    <td className="font-sans text-[12.5px]">
                      {r.source} {r.confidence === 'verify' && <span className="ml-1 rounded bg-caution-soft px-1 text-[11px] font-bold text-caution">{t('SCA to confirm', 'SCA पुष्टि')}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[13px] text-muted">{t('An admin changes a rate here (two-person approval) and every new plan picks it up, no redeploy. Each plan stores the rule ID it used.', 'एडमिन यहाँ दर बदलता है (दो लोगों की मंज़ूरी) और हर नई योजना उसे लेती है, बिना रीडिप्लॉय। हर योजना अपना नियम ID रखती है।')}</p>
        </section>
      </div>
    </div>
  )
}

function RouterPlayground() {
  const t = useT()
  const [margin, setMargin] = useState(14000)
  const [cat, setCat] = useState<SocialCategory>('SC')
  const [income, setIncome] = useState(150000)
  const r = naiveCeiling(margin, cat, income)
  const s = r.rule ? buildSchedule(r.loan, r.rule.ratePa, r.rule.tenureQ, r.moratoriumQ, 'serviced') : null
  return (
    <section className="card p-5">
      <h2 className="font-display text-[20px] font-bold">{t('Scheme router, try the edges', 'योजना राउटर, सीमाएँ आज़माएँ')}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {[10000, 14000, 14500, 100000, 600000].map((m) => (
          <button key={m} onClick={() => setMargin(m)} className={clsx('num rounded-lg border-2 px-2.5 py-1 text-[14px] font-bold', margin === m ? 'border-indigo bg-indigo-soft' : 'border-line')}>
            {inr(m)}
          </button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-[13px]">
        <label>
          <span className="text-muted">{t('Margin', 'मार्जिन')}</span>
          <input type="number" value={margin} onChange={(e) => setMargin(+e.target.value)} className="num w-full rounded-lg border border-line px-2 py-1.5 text-[15px]" />
        </label>
        <label>
          <span className="text-muted">{t('Category', 'वर्ग')}</span>
          <select value={cat} onChange={(e) => setCat(e.target.value as SocialCategory)} className="w-full rounded-lg border border-line px-2 py-1.5 text-[15px]">
            <option value="SC">SC</option>
            <option value="OBC">OBC</option>
            <option value="SAFAI">Safai K.</option>
          </select>
        </label>
        <label>
          <span className="text-muted">{t('Income', 'आय')}</span>
          <input type="number" value={income} step={10000} onChange={(e) => setIncome(+e.target.value)} className="num w-full rounded-lg border border-line px-2 py-1.5 text-[15px]" />
        </label>
      </div>
      <div className="mt-4 rounded-xl bg-khadi p-4 text-[14px]">
        {r.rule ? (
          <>
            <div>
              {inr(margin)} ÷ 10% = <b className="num">{inr(r.rawProject)}</b> → <b>{r.rule.corporation} {r.rule.product}</b>
            </div>
            <div className="mt-1">
              {t('Project', 'प्रोजेक्ट')} <b className="num">{inr(r.projectCost)}</b>, {t('loan', 'लोन')} <b className="num">{inr(r.loan)}</b>, {t('your share', 'आपका हिस्सा')} <b className="num">{inr(r.contribution)}</b> ({(r.contributionPct * 100).toFixed(1)}%)
            </div>
            {s && (
              <div className="mt-1">
                {s.moratoriumQ} × <b className="num">{inr(s.moratoriumPayment)}</b> {t('then', 'फिर')} {s.totalQ - s.moratoriumQ} × <b className="num">{inr(s.instalment)}</b>
              </div>
            )}
          </>
        ) : (
          <div className="font-semibold text-risk">{t('Ineligible', 'अपात्र')}</div>
        )}
      </div>
      <div className="mt-3 space-y-2">
        {r.flags.map((f) => (
          <div key={f.code} className={clsx('rounded-lg border-l-4 px-3 py-2 text-[13.5px]', f.severity === 'block' ? 'border-risk bg-risk-soft' : f.severity === 'warn' ? 'border-caution bg-caution-soft' : 'border-indigo bg-indigo-soft')}>
            <b className="text-[12px]">{f.code}</b> {t(f.en, f.hi)}
          </div>
        ))}
        {r.alternatives.map((a) => (
          <div key={a.rule.id} className="rounded-lg border border-line px-3 py-2 text-[13.5px]">
            {t('Compare', 'तुलना')}: <b>{a.rule.product}</b> {t('at', 'पर')} {inr(a.projectCost)} → {t('loan', 'लोन')} {inr(a.loan)} @ {(a.rule.ratePa * 100).toFixed(1)}%
          </div>
        ))}
      </div>
    </section>
  )
}

function GuardPlayground() {
  const t = useT()
  const facts = [900000, 44729, 8, 6, 26]
  const [text, setText] = useState('आपका लोन ₹9,00,000 है। पहले 6 महीने सिर्फ़ ब्याज, फिर 26 किस्तें ₹44,729 की, 8% ब्याज पर। ब्याज सिर्फ़ 2% है!')
  const g = numericGuard(text, facts)
  return (
    <section className="card p-5">
      <h2 className="font-display text-[20px] font-bold">{t('Numeric guard, try to sneak a number in', 'संख्या गार्ड, कोई संख्या घुसाकर देखें')}</h2>
      <p className="mt-1 text-[13.5px] text-muted">
        {t('Facts JSON for this plan', 'इस योजना के तथ्य')}: <span className="font-mono text-[12.5px]">[{facts.join(', ')}]</span>
      </p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="mt-3 w-full rounded-lg border border-line p-3 text-[15px]" />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {g.found.map((n, i) => {
          const bad = g.unknown.includes(n)
          return (
            <span key={i} className={clsx('rounded px-2 py-0.5 font-mono text-[12.5px] font-semibold', bad ? 'bg-risk-soft text-risk' : 'bg-go-soft text-go')}>
              {n.toLocaleString('en-IN')} {bad ? <XCircle className="inline size-3.5" /> : <CheckCircle2 className="inline size-3.5" />}
            </span>
          )
        })}
      </div>
      <div className={clsx('mt-3 flex items-center gap-2 rounded-lg px-3 py-2.5 font-bold', g.ok ? 'bg-go-soft text-go' : 'bg-risk-soft text-risk')}>
        {g.ok ? <ShieldCheck className="size-5" /> : <ShieldAlert className="size-5" />}
        {g.ok ? t('Shipped: every number is in the facts.', 'भेजा गया: हर संख्या तथ्यों में है।') : t('Blocked: retry once, then fall back to the template sentence.', 'रोका गया: एक बार फिर कोशिश, फिर टेम्पलेट वाक्य।')}
      </div>
      <p className="mt-3 text-[12.5px] text-muted">{t('Reads Indian grouping (9,00,000), Devanagari digits (९), and number words (नौ लाख, nau lakh).', 'भारतीय अंक (9,00,000), देवनागरी अंक (९), और शब्द (नौ लाख) पढ़ता है।')}</p>
    </section>
  )
}
