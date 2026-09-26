import { ACTIVITIES, type Activity } from '../data/activities'
import { DISTRICT, VILLAGES, roadKm, type Village } from '../data/villages'

export type Confidence = 'official' | 'map' | 'user' | 'model'

export interface Fact {
  id: string
  label: { en: string; hi: string }
  value: number | string
  display: string
  source: string
  year: string
  confidence: Confidence
}

// Deterministic hash → [0,1). Stable "survey noise" per village × activity.
export function hash01(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 100000) / 100000
}

const SAT_BIAS: Record<string, number> = {
  // hand-tuned demo texture so the district has visible gaps and crowding
  '146021:kirana': 1.9, '146021:mobile': 0.2, '146021:dairy': 0.95, '146021:tailoring': 1.1, '146021:chakki': 0.3,
  '146023:dairy': 1.6, '146026:kirana': 1.4, '146026:mobile': 1.6, '146030:tea': 1.7, '146030:kirana': 1.5,
  '146022:tailoring': 0.4, '146025:goat': 0.5, '146029:dairy': 1.8, '146024:tea': 0.3, '146027:mobile': 0.1,
}

export function competitorsIn(v: Village, a: Activity) {
  const pop = v.pop2011 * DISTRICT.growthFactor
  const bias = SAT_BIAS[`${v.lgd}:${a.code}`] ?? 0.55 + hash01(v.lgd + a.code) * 0.95
  const ec6 = Math.round((v.pop2011 / 1000) * a.competitorsPer1000Median * bias * 0.82)
  const est = ec6 * 1.28 // EC-6 (2013) × establishment growth to 2026
  const osm = Math.floor(est * (0.18 + hash01(a.code + v.name) * 0.2))
  const low = Math.max(osm, Math.floor(est * 0.8))
  const high = Math.max(low, Math.ceil(est * 1.25))
  const raw = (v.pop2011 / 1000) * a.competitorsPer1000Median * bias * 0.82 * 1.28
  return { ec6, osm, low, high, mid: (low + high) / 2, pop, raw }
}

export interface Feasibility {
  village: Village
  activity: Activity
  catchment5: { villages: { v: Village; km: number }[]; population: number; households: number }
  catchment10: { villages: { v: Village; km: number }[]; population: number; households: number }
  competitors: { low: number; high: number; mid: number; ec6: number; osm: number; userCount?: number }
  competitorPoints: { v: Village; count: number; km: number }[]
  saturation: { index: number; label: 'crowded' | 'normal' | 'gap'; per1000: number; districtMedianPer1000: number }
  demand: { monthlyLow: number; monthlyHigh: number; captureLow: number; captureHigh: number; uncapped: boolean; channelNote: { en: string; hi: string } }
  seasonality: { index: number[]; leanMonths: number[]; peakMonths: number[]; amplitude: number }
  price: Activity['price'] & { marginPct: number }
  threats: { id: string; level: 'low' | 'medium' | 'high'; en: string; hi: string }[]
  facts: Fact[]
  confidence: 'High' | 'Medium' | 'Low'
}

function catchment(center: Village, km: number) {
  const vs = VILLAGES.map((v) => ({ v, km: v.lgd === center.lgd ? 0 : roadKm(center, v) })).filter((x) => x.km <= km)
  const population = Math.round(vs.reduce((s, x) => s + x.v.pop2011 * DISTRICT.growthFactor, 0))
  const households = Math.round(vs.reduce((s, x) => s + x.v.households * DISTRICT.growthFactor, 0))
  return { villages: vs.sort((a, b) => a.km - b.km), population, households }
}

function median(xs: number[]) {
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

// Huff: P(i→new) = (1/d_i0^β) / (1/d_i0^β + Σ_k c_k / d_ik^β)
function huffDemand(center: Village, a: Activity, beta: number, radius: number) {
  const area = VILLAGES.filter((v) => roadKm(center, v) <= radius || v.lgd === center.lgd)
  let captured = 0
  for (const i of area) {
    const dNew = i.lgd === center.lgd ? 0.4 : roadKm(i, center)
    const own = 1 / Math.pow(dNew, beta)
    let rival = 0
    for (const k of VILLAGES) {
      const c = competitorsIn(k, a).mid
      if (!c) continue
      const d = k.lgd === i.lgd ? 0.4 : roadKm(i, k)
      if (d > radius + 4) continue
      rival += c / Math.pow(d, beta)
    }
    const p = own / (own + rival)
    captured += i.households * DISTRICT.growthFactor * a.spendPerHH * p
  }
  return captured
}

export function assessFeasibility(village: Village, activity: Activity, userCount?: number): Feasibility {
  const c5 = catchment(village, 5)
  const c10 = catchment(village, 10)
  const a = activity

  const pts = c5.villages.map(({ v, km }) => ({ v, km, count: Math.round(competitorsIn(v, a).mid) }))
  let low = 0
  let high = 0
  let ec6 = 0
  let osm = 0
  for (const { v } of c5.villages) {
    const c = competitorsIn(v, a)
    low += c.low
    high += c.high
    ec6 += c.ec6
    osm += c.osm
  }
  // Bayesian-style blend: a VLE / user count is an observation that pulls the range.
  if (userCount != null) {
    low = Math.round((low + userCount * 2) / 3)
    high = Math.max(low, Math.round((high + userCount * 2) / 3))
  }
  const mid = (low + high) / 2

  const per1000 = (mid / c5.population) * 1000
  const districtPer1000 = median(VILLAGES.map((v) => (competitorsIn(v, a).mid / (v.pop2011 * DISTRICT.growthFactor)) * 1000))
  const satIdx = districtPer1000 ? per1000 / districtPer1000 : 1
  const satLabel = satIdx > 1.5 ? 'crowded' : satIdx < 0.5 ? 'gap' : 'normal'

  const nearestMilk = VILLAGES.filter((v) => v.facilities.milkCentre)
    .map((v) => ({ v, km: v.lgd === village.lgd ? 0 : roadKm(village, v) }))
    .sort((x, y) => x.km - y.km)[0]

  const uncapped = a.channel === 'trader' || (a.channel === 'milkCentre' && nearestMilk.km <= 5)
  const dLow = huffDemand(village, a, 2.0, 5)
  const dHigh = huffDemand(village, a, 1.5, 5)
  const channelNote =
    a.channel === 'milkCentre'
      ? nearestMilk.km === 0
        ? { en: 'Milk collection centre in your own village buys all you produce.', hi: 'आपके अपने गाँव का दूध संग्रह केंद्र सारा दूध ख़रीदता है।' }
        : nearestMilk.km <= 5
        ? { en: `Milk collection centre at ${nearestMilk.v.name} (${nearestMilk.km.toFixed(1)} km) buys all you produce.`, hi: `${nearestMilk.v.nameHi} (${nearestMilk.km.toFixed(1)} किमी) का दूध संग्रह केंद्र सारा दूध ख़रीदता है।` }
        : { en: `Nearest milk centre is ${nearestMilk.km.toFixed(1)} km away, you must sell locally.`, hi: `सबसे पास दूध केंद्र ${nearestMilk.km.toFixed(1)} किमी दूर, गाँव में ही बेचना होगा।` }
      : a.channel === 'trader'
        ? { en: 'Sold to traders / haat, not limited by village demand, but price moves.', hi: 'व्यापारी / हाट में बिक्री, गाँव की माँग की सीमा नहीं, पर दाम ऊपर-नीचे होते हैं।' }
        : { en: 'Sold inside the 5 km catchment, village demand is the ceiling.', hi: '5 किमी के अंदर बिक्री, गाँव की माँग ही सीमा है।' }

  const idx = a.seasonality
  const lean = idx.map((x, i) => [x, i] as const).filter(([x]) => x < 0.9).map(([, i]) => i)
  const peak = idx.map((x, i) => [x, i] as const).filter(([x]) => x > 1.15).map(([, i]) => i)
  const amplitude = Math.max(...idx) - Math.min(...idx)

  const p = a.price
  const marginPct = p.costPerUnit ? (p.suggested - p.costPerUnit) / p.suggested : p.suggested / 100

  const threats: Feasibility['threats'] = []
  threats.push({
    id: 'T-season',
    level: amplitude > 0.8 ? 'high' : amplitude > 0.35 ? 'medium' : 'low',
    en: `Some months sell less (up to ${Math.round(amplitude * 100)}% difference). Save in the good months.`,
    hi: `कुछ महीनों में बिक्री कम होती है (${Math.round(amplitude * 100)}% तक फ़र्क)। अच्छे महीनों में बचत करें।`,
  })
  const inputKm = village.facilities.mandiKm
  threats.push({
    id: 'T-input',
    level: inputKm > 17 ? 'high' : inputKm > 12 ? 'medium' : 'low',
    en: `The mandi is ${inputKm} km away. Count the travel cost.`,
    hi: `मंडी ${inputKm} किमी दूर है। आने-जाने का ख़र्च जोड़कर चलें।`,
  })
  if (a.channel === 'milkCentre' || a.code === 'poultry') {
    threats.push({
      id: 'T-buyer',
      level: 'medium',
      en: 'Only one buyer (milk centre or company) decides your price.',
      hi: 'दाम एक ही ख़रीदार (दूध केंद्र या कंपनी) तय करता है।',
    })
  }
  threats.push({
    id: 'T-flood',
    level: village.floodRisk,
    en: `Chance of flood or waterlogging: ${village.floodRisk}.`,
    hi: `बाढ़ या पानी भरने का ख़तरा: ${village.floodRisk === 'high' ? 'ज़्यादा' : village.floodRisk === 'medium' ? 'मध्यम' : 'कम'}।`,
  })
  if (satLabel === 'crowded')
    threats.push({ id: 'T-crowd', level: 'high', en: `${Math.round(mid)} similar businesses are already within 5 km.`, hi: `5 किमी में पहले से ${Math.round(mid)} ऐसे काम चल रहे हैं।` })

  const rupee = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')
  const facts: Fact[] = [
    { id: 'F1', label: { en: 'People within 5 km', hi: '5 किमी में लोग' }, value: c5.population, display: c5.population.toLocaleString('en-IN'), source: 'Census 2011 PCA × district growth', year: '2011→2026', confidence: 'official' },
    { id: 'F2', label: { en: 'Households within 5 km', hi: '5 किमी में परिवार' }, value: c5.households, display: c5.households.toLocaleString('en-IN'), source: 'Census 2011 Village Directory', year: '2011→2026', confidence: 'official' },
    { id: 'F3', label: { en: 'People within 10 km', hi: '10 किमी में लोग' }, value: c10.population, display: c10.population.toLocaleString('en-IN'), source: 'Census 2011 PCA × district growth', year: '2011→2026', confidence: 'official' },
    { id: 'F4', label: { en: 'Similar units within 5 km', hi: '5 किमी में ऐसी इकाइयाँ' }, value: `${low}–${high}`, display: `${low}–${high}`, source: `EC-6 prior (${ec6}) × growth, OSM floor (${osm})${userCount != null ? ', your count' : ''}`, year: '2013 / 2026', confidence: userCount != null ? 'user' : 'model' },
    { id: 'F5', label: { en: 'Saturation vs district', hi: 'ज़िले के मुकाबले भीड़' }, value: Number(satIdx.toFixed(2)), display: `${satIdx.toFixed(2)}×`, source: 'Units per 1,000 people ÷ district median', year: '2026', confidence: 'model' },
    { id: 'F6', label: { en: 'Demand you can capture / month', hi: 'हर महीने मिलने वाली माँग' }, value: Math.round(dLow), display: uncapped ? (a.channel === 'milkCentre' ? 'No cap (milk centre)' : 'Trader market') : `${rupee(dLow)}–${rupee(dHigh)}`, source: 'Households × HCES spend share × Huff capture (β 1.5–2.0)', year: 'HCES 2023-24', confidence: 'model' },
    { id: 'F7', label: { en: `Local price: ${p.item.en}`, hi: `स्थानीय दाम: ${p.item.hi}` }, value: p.suggested, display: p.unit.en === '%' ? `${p.low}–${p.high}%` : `₹${p.low}–₹${p.high} / ${p.unit.en}`, source: a.channel === 'local' ? 'Local survey, VLE reported' : 'Agmarknet modal price, Barabanki', year: '2025-26', confidence: a.channel === 'local' ? 'user' : 'official' },
    { id: 'F8', label: { en: 'Mandi distance', hi: 'मंडी की दूरी' }, value: inputKm, display: `${inputKm} km`, source: 'OSM road network', year: '2026', confidence: 'map' },
  ]
  if (a.channel === 'milkCentre')
    facts.push({ id: 'F9', label: { en: 'Nearest milk collection centre', hi: 'सबसे पास दूध केंद्र' }, value: Number(nearestMilk.km.toFixed(1)), display: nearestMilk.km === 0 ? `${nearestMilk.v.name} (in village)` : `${nearestMilk.v.name}, ${nearestMilk.km.toFixed(1)} km`, source: 'Mission Antyodaya 2020', year: '2020', confidence: 'official' })

  const missing = !village.facilities.pakkaRoad
  return {
    village,
    activity: a,
    catchment5: c5,
    catchment10: c10,
    competitors: { low, high, mid, ec6, osm, userCount },
    competitorPoints: pts,
    saturation: { index: satIdx, label: satLabel, per1000, districtMedianPer1000: districtPer1000 },
    demand: { monthlyLow: dLow, monthlyHigh: dHigh, captureLow: dLow / Math.max(1, c5.households * a.spendPerHH), captureHigh: dHigh / Math.max(1, c5.households * a.spendPerHH), uncapped, channelNote },
    seasonality: { index: idx, leanMonths: lean, peakMonths: peak, amplitude },
    price: { ...p, marginPct },
    threats,
    facts,
    confidence: missing ? 'Low' : c5.villages.length >= 4 ? 'High' : 'Medium',
  }
}

export const ALL_ACTIVITIES = ACTIVITIES
