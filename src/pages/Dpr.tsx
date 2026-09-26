import { ArrowLeft, Printer } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useMemo, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DISTRICT } from '../data/villages'
import { narrate } from '../engine/narrate'
import { inr, lakh, pct } from '../lib/format'
import { planFor, useCase } from '../lib/plans'

function H({ en, hi }: { en: string; hi: string }) {
  return (
    <h2 className="mt-7 mb-2 border-b-2 border-indigo pb-1 font-display text-[18px] font-bold text-indigo-deep">
      {en} <span className="font-semibold text-muted">/ {hi}</span>
    </h2>
  )
}

function Row({ k, v }: { k: ReactNode; v: ReactNode }) {
  return (
    <tr className="border-b border-line">
      <td className="py-1.5 pr-4 text-muted">{k}</td>
      <td className="num py-1.5 text-right font-semibold">{v}</td>
    </tr>
  )
}

export default function Dpr() {
  const { id } = useParams()
  const nav = useNavigate()
  const c = useCase(id)
  const plan = useMemo(() => (c ? planFor(c, false) : null), [c])
  if (!c || !plan) return <p className="p-8">Plan not found.</p>
  const r = plan.recommended
  const s = r.schedule
  const pj = r.projection
  const a = plan.feasibility.activity
  const v = plan.feasibility.village
  const hi = narrate(plan, 'hi').text
  const en = narrate(plan, 'en').text
  const today = new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })

  return (
    <div className="min-h-dvh bg-khadi py-6 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex max-w-[820px] items-center justify-between px-4">
        <button onClick={() => nav(-1)} className="inline-flex items-center gap-1 font-semibold text-indigo">
          <ArrowLeft className="size-4" /> Back
        </button>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-indigo px-5 py-2.5 font-bold text-white">
          <Printer className="size-4" /> Print / Save as PDF
        </button>
      </div>
      <article className="print-page mx-auto max-w-[820px] bg-white px-10 py-10 text-[13.5px] shadow-xl">
        <header className="flex items-start justify-between gap-6 border-b-4 border-marigold pb-4">
          <div>
            <div className="text-[12px] font-semibold text-muted">Detailed Project Report / विस्तृत परियोजना रिपोर्ट</div>
            <h1 className="font-display text-[28px] font-extrabold leading-tight text-indigo-deep">
              {a.name.en}: {r.unit.size.label.en}
            </h1>
            <div className="font-display text-[18px] font-semibold text-muted">
              {a.name.hi}: {r.unit.size.label.hi}
            </div>
            <div className="mt-2 text-[13px]">
              {plan.input.name}, {v.name} ({v.nameHi}), {v.block} block, {DISTRICT.name}, {DISTRICT.state}. LGD {v.lgd}
            </div>
          </div>
          <div className="text-center">
            <QRCodeSVG value={`https://pmsuraj.dosje.gov.in/?ref=${plan.id}`} size={84} fgColor="#1c2566" />
            <div className="mt-1 text-[10.5px] font-semibold text-muted">{plan.id}</div>
          </div>
        </header>

        <section className="mt-4 grid grid-cols-4 gap-3 text-center">
          {[
            ['Project cost', 'परियोजना लागत', lakh(r.projectCost)],
            ['Loan', 'ऋण', lakh(r.loan)],
            ['Own contribution', 'स्वयं का अंशदान', lakh(r.contribution)],
            ['Quarterly instalment', 'तिमाही किस्त', s ? inr(s.instalment) : '—'],
          ].map(([e, h, val]) => (
            <div key={e} className="rounded-lg bg-indigo-soft/60 p-2.5">
              <div className="num text-[20px] font-bold">{val}</div>
              <div className="text-[11px] text-muted">
                {e} / {h}
              </div>
            </div>
          ))}
        </section>

        <H en="1. Summary" hi="सारांश" />
        <p>{en}</p>
        <p className="mt-2">{hi}</p>

        <H en="2. Promoter" hi="उद्यमी" />
        <table className="w-full">
          <tbody>
            <Row k="Name / नाम" v={plan.input.name} />
            <Row k="Social category / वर्ग" v={plan.input.category === 'SAFAI' ? 'Safai Karamchari' : plan.input.category} />
            <Row k="Family income / पारिवारिक आय" v={inr(plan.input.familyIncome)} />
            <Row k="Founder-Fit score / फ़ाउंडर-फ़िट" v={`${plan.fit.score} / 100`} />
            {plan.fit.parts.map((p) => (
              <Row key={p.key} k={<span className="pl-4">{p.en}</span>} v={`${Math.round(p.got)}/${p.max}`} />
            ))}
          </tbody>
        </table>

        <H en="3. Cost of project and means of finance" hi="परियोजना लागत एवं वित्त" />
        <table className="w-full">
          <tbody>
            <Row k="Assets (animals / machines / fixtures) / संपत्ति" v={inr(r.unit.size.capex)} />
            <Row k="Working capital / कार्यशील पूंजी" v={inr(r.unit.size.workingCapital)} />
            <Row k={<b>Total project cost / कुल लागत</b>} v={inr(r.projectCost)} />
            <Row k={`Loan: ${r.route.rule?.corporation} ${r.route.rule?.product} @ ${((r.route.rule?.ratePa ?? 0) * 100).toFixed(1)}%`} v={inr(r.loan)} />
            <Row k="Promoter contribution / अंशदान" v={`${inr(r.contribution)} (${pct(r.contribution / r.projectCost, 1)})`} />
            <Row k="Rule applied / लागू नियम" v={`${r.route.rule?.id} (${plan.ruleVersion})`} />
          </tbody>
        </table>

        <H en="4. Market assessment (5 km catchment)" hi="बाज़ार आकलन" />
        <table className="w-full">
          <tbody>
            {plan.feasibility.facts.map((f) => (
              <Row key={f.id} k={`${f.id} ${f.label.en} (${f.source}, ${f.year}; ${f.confidence})`} v={f.display} />
            ))}
          </tbody>
        </table>

        {pj && (
          <>
            <H en="5. Projected profit & loss and DSCR" hi="अनुमानित लाभ-हानि और DSCR" />
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b-2 border-line text-right text-muted">
                  <th className="py-1 text-left">₹</th>
                  {pj.years.slice(0, 5).map((y) => (
                    <th key={y.year}>Year {y.year}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="num">
                {(
                  [
                    ['Sales', 'revenue'],
                    ['Materials', 'variable'],
                    ['Fixed costs', 'fixed'],
                    ['Hired labour', 'hiredLabour'],
                    ['Family drawings', 'draw'],
                    ['Interest', 'interest'],
                    ['Depreciation', 'depreciation'],
                    ['Net profit', 'netProfit'],
                    ['Principal repaid', 'principal'],
                  ] as const
                ).map(([l, k]) => (
                  <tr key={k} className="border-b border-line text-right">
                    <td className="py-1 text-left font-sans">{l}</td>
                    {pj.years.slice(0, 5).map((y) => (
                      <td key={y.year}>{Math.round(y[k]).toLocaleString('en-IN')}</td>
                    ))}
                  </tr>
                ))}
                <tr className="text-right font-bold">
                  <td className="py-1 text-left font-sans">DSCR</td>
                  {pj.years.slice(0, 5).map((y) => (
                    <td key={y.year}>{Number.isFinite(y.dscr) ? y.dscr.toFixed(2) : '—'}</td>
                  ))}
                </tr>
              </tbody>
            </table>
            <p className="mt-2">
              Minimum DSCR {pj.minDscr.toFixed(2)}, average {pj.avgDscr.toFixed(2)}. Monte Carlo (1,000 runs): probability of DSCR &lt; 1 in any year {pct(r.mc?.pDefault ?? 0, 1)}. NPV @12% {inr(pj.npv)}
              {pj.irr != null && `, IRR ${pct(pj.irr, 1)}`}.
            </p>
          </>
        )}

        {s && (
          <>
            <H en="6. Repayment schedule (quarterly)" hi="किस्त तालिका (तिमाही)" />
            <p className="mb-2">
              {s.moratoriumQ} moratorium quarter(s), interest {s.mode}. {s.totalQ - s.moratoriumQ} instalments of {inr(s.instalment)}. Total interest {inr(s.totalInterest)}.
            </p>
            <div className="columns-2 gap-6 text-[11.5px]">
              <table className="w-full">
                <thead>
                  <tr className="text-right text-muted">
                    <th className="text-left">Q</th>
                    <th>Interest</th>
                    <th>Principal</th>
                    <th>Payment</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody className="num">
                  {s.rows.map((row) => (
                    <tr key={row.q} className="border-b border-line text-right">
                      <td className="text-left">{row.q}</td>
                      <td>{Math.round(row.interest).toLocaleString('en-IN')}</td>
                      <td>{Math.round(Math.max(0, row.principal)).toLocaleString('en-IN')}</td>
                      <td className="font-semibold">{Math.round(row.payment).toLocaleString('en-IN')}</td>
                      <td>{Math.round(row.closing).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <H en="7. SWOT" hi="ताक़त, कमज़ोरी, मौक़े, ख़तरे" />
        <div className="grid grid-cols-2 gap-3">
          {(['S', 'W', 'O', 'T'] as const).map((k) => (
            <div key={k} className="rounded border border-line p-2.5">
              <b>{{ S: 'Strengths / ताक़त', W: 'Weaknesses / कमज़ोरी', O: 'Opportunities / मौक़े', T: 'Threats / ख़तरे' }[k]}</b>
              <ul className="mt-1 list-disc pl-4">
                {plan.swot[k].slice(0, 4).map((x, i) => (
                  <li key={i}>
                    {x.en}
                    {x.fact && ` [${x.fact}]`}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <H en="8. Risks and mitigation" hi="जोखिम और बचाव" />
        <ul className="list-disc pl-5">
          {plan.feasibility.threats.map((x) => (
            <li key={x.id}>
              {x.en} ({x.level})
            </li>
          ))}
          <li>Working capital of {inr(r.unit.size.workingCapital)} included to avoid informal borrowing in lean months.</li>
          {plan.fit.score < 50 && <li>Training before disbursal: {a.training.en}.</li>}
        </ul>

        <footer className="mt-8 border-t border-line pt-3 text-[11px] text-muted">
          Prepared by GramUdyam Saathi on {today}. Figures computed by deterministic engine {plan.ruleVersion} on data {plan.dataVersion}; narrative text passed the numeric guard. Demo data — verify with {DISTRICT.sca.name}.
        </footer>
      </article>
    </div>
  )
}
