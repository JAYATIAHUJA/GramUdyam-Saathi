// Narrator: words around engine numbers. In production this is Sarvam-30B with
// the facts JSON in the prompt; the demo uses the template fallback path the SRS
// specifies. Either way the output passes the numeric guard before it ships.
import { numericGuard } from './guard'
import type { Plan } from './plan'

export type Lang = 'hi' | 'en'

const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')

export function planNumbers(p: Plan): number[] {
  const r = p.recommended
  const n: number[] = [
    r.loan, r.projectCost, r.contribution, p.naive.loan, p.chosen.loan, p.input.margin,
    Math.round(r.schedule?.instalment ?? 0), Math.round(p.perDay), Math.round(p.localUnits),
    Math.round((r.schedule?.instalment ?? 0) / 3), p.fit.score, r.route.moratoriumQ * 3,
    Math.round((r.mc?.pDefault ?? 0) * 100), Math.round((p.naive.mc?.pDefault ?? 0) * 100),
    Number((r.projection?.minDscr ?? 0).toFixed(2)), Number((p.naive.projection?.minDscr ?? 0).toFixed(2)),
    (r.route.rule?.ratePa ?? 0) * 100, (r.schedule?.totalQ ?? 0) - (r.schedule?.moratoriumQ ?? 0), 5, 10, 1, 2, 3, 4, 6, 7, 12,
    p.feasibility.catchment5.households, p.feasibility.competitors.low, p.feasibility.competitors.high,
  ]
  return n
}

export function narrate(p: Plan, lang: Lang): { text: string; guard: ReturnType<typeof numericGuard> } {
  const r = p.recommended
  const act = p.feasibility.activity
  const inst = r.schedule?.instalment ?? 0
  const mor = r.route.moratoriumQ * 3
  const units = Math.round(p.localUnits)
  const perDay = Math.round(p.perDay)
  const smaller = r !== p.chosen && r.passes
  let text: string
  if (lang === 'hi') {
    const verdictLine = p.verdict === 'go' ? 'अच्छा मौका है।' : p.verdict === 'caution' ? 'सोच-समझ कर कदम उठाइए।' : 'दोबारा सोचिए।'
    text =
      `${p.input.name} जी, ${act.name.hi} के लिए ${verdictLine} ` +
      (smaller ? `${inr(p.chosen.loan)} की जगह ${inr(r.loan)} का लोन लीजिए, ${r.unit.size.label.hi} से शुरू करें। ` : `${inr(r.loan)} का लोन ठीक रहेगा। `) +
      `पहले ${mor} महीने सिर्फ़ ब्याज, फिर हर तीन महीने ${inr(inst)}। ` +
      `यानी रोज़ क़रीब ${inr(perDay)}, लगभग ${units} ${act.localUnit.hi} रोज़। ` +
      (p.fit.score < 50 ? `पहले ${act.training.hi} कर लीजिए।` : `किस्त हर महीने ${inr(inst / 3)} अलग रखिए।`)
  } else {
    const verdictLine = p.verdict === 'go' ? 'this is a good opportunity.' : p.verdict === 'caution' ? 'go ahead carefully.' : 'please rethink this plan.'
    text =
      `${p.input.name}, for ${act.name.en.toLowerCase()} ${verdictLine} ` +
      (smaller ? `Borrow ${inr(r.loan)}, not ${inr(p.chosen.loan)}, start with ${r.unit.size.label.en}. ` : `A loan of ${inr(r.loan)} is right-sized. `) +
      `For the first ${mor} months you pay only interest, then ${inr(inst)} every three months. ` +
      `That is about ${inr(perDay)} a day, roughly ${units} ${act.localUnit.en} a day. ` +
      (p.fit.score < 50 ? `Do the ${act.training.en} first.` : `Set aside ${inr(inst / 3)} every month.`)
  }
  const facts = [...planNumbers(p), mor, units, perDay, Math.round(inst / 3), r.loan, p.chosen.loan, Math.round(inst)]
  // Training names carry numbers of their own (e.g. "10-day", "3 months"): allow them as facts.
  const trainNums = (act.training.en + ' ' + act.training.hi).match(/\d+/g)?.map(Number) ?? []
  const sizeNums = (r.unit.size.label.en + ' ' + p.chosen.unit.size.label.en).match(/\d+/g)?.map(Number) ?? []
  const guard = numericGuard(text, [...facts, ...trainNums, ...sizeNums])
  return { text, guard }
}
