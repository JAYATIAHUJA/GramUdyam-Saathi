// DEMO DATASET, Barabanki district (UP). Shapes follow Census 2011 PCA +
// Mission Antyodaya 2020 fields; values are synthetic for the prototype.
// x/y are km offsets from the district reference point (for the catchment map).

export interface Village {
  lgd: string
  name: string
  nameHi: string
  block: string
  blockHi: string
  x: number
  y: number
  pop2011: number
  households: number
  scShare: number
  facilities: {
    milkCentre: boolean
    haat: boolean
    bank: boolean
    pacs: boolean
    pakkaRoad: boolean
    mandiKm: number
  }
  floodRisk: 'low' | 'medium' | 'high'
}

export const DISTRICT = {
  name: 'Barabanki',
  nameHi: 'बाराबंकी',
  state: 'Uttar Pradesh',
  stateHi: 'उत्तर प्रदेश',
  lgd: '146',
  growthFactor: 1.24, // 2011 → 2026 projection from district decadal growth
  sca: {
    name: 'UP Scheduled Castes Finance & Development Corp., District Office',
    nameHi: 'उ.प्र. अनुसूचित जाति वित्त एवं विकास निगम, जिला कार्यालय',
    address: 'Vikas Bhawan, Barabanki 225001',
    phone: '05248-222XXX',
  },
}

export const VILLAGES: Village[] = [
  { lgd: '146021', name: 'Sirauli', nameHi: 'सिरौली', block: 'Dewa', blockHi: 'देवा', x: 0, y: 0, pop2011: 3180, households: 596, scShare: 0.31, facilities: { milkCentre: true, haat: false, bank: true, pacs: true, pakkaRoad: true, mandiKm: 14 }, floodRisk: 'low' },
  { lgd: '146022', name: 'Mohammadpur Khala', nameHi: 'मोहम्मदपुर खाला', block: 'Dewa', blockHi: 'देवा', x: 2.4, y: 1.1, pop2011: 2210, households: 402, scShare: 0.27, facilities: { milkCentre: false, haat: true, bank: false, pacs: false, pakkaRoad: true, mandiKm: 16 }, floodRisk: 'low' },
  { lgd: '146023', name: 'Bhitauli Kalan', nameHi: 'भिटौली कलां', block: 'Dewa', blockHi: 'देवा', x: -1.8, y: 2.6, pop2011: 4020, households: 731, scShare: 0.22, facilities: { milkCentre: true, haat: true, bank: true, pacs: true, pakkaRoad: true, mandiKm: 12 }, floodRisk: 'low' },
  { lgd: '146024', name: 'Katiyara', nameHi: 'कटियारा', block: 'Dewa', blockHi: 'देवा', x: 3.1, y: -2.2, pop2011: 1640, households: 297, scShare: 0.38, facilities: { milkCentre: false, haat: false, bank: false, pacs: false, pakkaRoad: false, mandiKm: 18 }, floodRisk: 'medium' },
  { lgd: '146025', name: 'Ganeshpur', nameHi: 'गणेशपुर', block: 'Dewa', blockHi: 'देवा', x: -3.4, y: -1.5, pop2011: 2870, households: 520, scShare: 0.29, facilities: { milkCentre: false, haat: false, bank: false, pacs: true, pakkaRoad: true, mandiKm: 15 }, floodRisk: 'low' },
  { lgd: '146026', name: 'Satrikh', nameHi: 'सतरिख', block: 'Harakh', blockHi: 'हरख', x: 5.6, y: 3.4, pop2011: 9410, households: 1702, scShare: 0.18, facilities: { milkCentre: true, haat: true, bank: true, pacs: true, pakkaRoad: true, mandiKm: 9 }, floodRisk: 'low' },
  { lgd: '146027', name: 'Rasoolpur', nameHi: 'रसूलपुर', block: 'Harakh', blockHi: 'हरख', x: 1.2, y: 4.8, pop2011: 1980, households: 355, scShare: 0.34, facilities: { milkCentre: false, haat: false, bank: false, pacs: false, pakkaRoad: false, mandiKm: 17 }, floodRisk: 'high' },
  { lgd: '146028', name: 'Barauli Malik', nameHi: 'बरौली मलिक', block: 'Harakh', blockHi: 'हरख', x: 6.9, y: -1.2, pop2011: 2530, households: 460, scShare: 0.26, facilities: { milkCentre: false, haat: true, bank: false, pacs: false, pakkaRoad: true, mandiKm: 13 }, floodRisk: 'low' },
  { lgd: '146029', name: 'Tikra Usmanpur', nameHi: 'टिकरा उस्मानपुर', block: 'Dewa', blockHi: 'देवा', x: -5.9, y: 2.1, pop2011: 3340, households: 610, scShare: 0.24, facilities: { milkCentre: true, haat: false, bank: false, pacs: true, pakkaRoad: true, mandiKm: 19 }, floodRisk: 'medium' },
  { lgd: '146030', name: 'Dewa', nameHi: 'देवा', block: 'Dewa', blockHi: 'देवा', x: -2.2, y: -5.6, pop2011: 12860, households: 2380, scShare: 0.16, facilities: { milkCentre: true, haat: true, bank: true, pacs: true, pakkaRoad: true, mandiKm: 11 }, floodRisk: 'low' },
  { lgd: '146031', name: 'Kutlupur', nameHi: 'कुतलूपुर', block: 'Dewa', blockHi: 'देवा', x: 0.8, y: -4.3, pop2011: 1720, households: 311, scShare: 0.41, facilities: { milkCentre: false, haat: false, bank: false, pacs: false, pakkaRoad: false, mandiKm: 16 }, floodRisk: 'medium' },
  { lgd: '146032', name: 'Jahangirabad', nameHi: 'जहांगीराबाद', block: 'Harakh', blockHi: 'हरख', x: 8.4, y: 5.9, pop2011: 6120, households: 1105, scShare: 0.2, facilities: { milkCentre: true, haat: true, bank: true, pacs: true, pakkaRoad: true, mandiKm: 8 }, floodRisk: 'low' },
  { lgd: '146033', name: 'Paisar', nameHi: 'पैसार', block: 'Dewa', blockHi: 'देवा', x: -7.4, y: -3.8, pop2011: 2460, households: 447, scShare: 0.33, facilities: { milkCentre: false, haat: true, bank: false, pacs: false, pakkaRoad: true, mandiKm: 20 }, floodRisk: 'high' },
  { lgd: '146034', name: 'Lalpur Karauta', nameHi: 'लालपुर करौता', block: 'Harakh', blockHi: 'हरख', x: 4.2, y: -6.1, pop2011: 1890, households: 342, scShare: 0.36, facilities: { milkCentre: false, haat: false, bank: false, pacs: true, pakkaRoad: false, mandiKm: 14 }, floodRisk: 'low' },
  { lgd: '146035', name: 'Mirzapur', nameHi: 'मिर्ज़ापुर', block: 'Dewa', blockHi: 'देवा', x: -4.6, y: 6.7, pop2011: 2690, households: 488, scShare: 0.28, facilities: { milkCentre: false, haat: false, bank: true, pacs: false, pakkaRoad: true, mandiKm: 21 }, floodRisk: 'medium' },
  { lgd: '146036', name: 'Bhaneman', nameHi: 'भनेमन', block: 'Harakh', blockHi: 'हरख', x: 9.3, y: 0.6, pop2011: 2080, households: 377, scShare: 0.3, facilities: { milkCentre: false, haat: false, bank: false, pacs: false, pakkaRoad: true, mandiKm: 10 }, floodRisk: 'low' },
  { lgd: '146037', name: 'Safdarganj', nameHi: 'सफदरगंज', block: 'Harakh', blockHi: 'हरख', x: -8.8, y: 7.2, pop2011: 5230, households: 948, scShare: 0.21, facilities: { milkCentre: true, haat: true, bank: true, pacs: true, pakkaRoad: true, mandiKm: 12 }, floodRisk: 'low' },
  { lgd: '146038', name: 'Chandauli', nameHi: 'चंदौली', block: 'Dewa', blockHi: 'देवा', x: 6.3, y: -8.4, pop2011: 1560, households: 281, scShare: 0.44, facilities: { milkCentre: false, haat: false, bank: false, pacs: false, pakkaRoad: false, mandiKm: 15 }, floodRisk: 'high' },
]

export const ROAD_FACTOR = 1.3 // straight-line → road-network distance

export function roadKm(a: Village, b: Village) {
  const d = Math.hypot(a.x - b.x, a.y - b.y) * ROAD_FACTOR
  return Math.max(d, 0.4)
}

// Fuzzy village search (FR-A3): tolerant to spelling and Hindi/English input.
function norm(s: string) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zऀ-ॿ ]/g, '')
    .replace(/aa/g, 'a')
    .replace(/ee/g, 'i')
    .replace(/oo/g, 'u')
    .replace(/w/g, 'v')
    .trim()
}

function lev(a: string, b: string) {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 1; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return dp[m][n]
}

export function searchVillages(q: string, limit = 3) {
  const nq = norm(q)
  if (!nq) return VILLAGES.slice(0, limit).map((v) => ({ village: v, score: 0.5 }))
  return VILLAGES.map((v) => {
    const cands = [norm(v.name), norm(v.nameHi), ...norm(v.name).split(' ')]
    let best = 0
    for (const c of cands) {
      if (!c) continue
      if (c.startsWith(nq) || nq.startsWith(c)) best = Math.max(best, 0.95)
      const d = lev(nq, c.slice(0, Math.max(nq.length, 3)))
      best = Math.max(best, 1 - d / Math.max(nq.length, c.length, 1))
    }
    return { village: v, score: best }
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export const villageByLgd = (lgd: string) => VILLAGES.find((v) => v.lgd === lgd)

// Demo anchor: village x/y offsets are km east/north of this point (Sirauli, Dewa block).
const ANCHOR = { lat: 26.935, lon: 81.19 }

/** Villages ordered by distance from a GPS fix. `km` is straight-line distance. */
export function nearestVillages(lat: number, lon: number, limit = 3) {
  const x = (lon - ANCHOR.lon) * 111.32 * Math.cos((ANCHOR.lat * Math.PI) / 180)
  const y = (lat - ANCHOR.lat) * 110.57
  return VILLAGES.map((v) => ({ village: v, km: Math.hypot(v.x - x, v.y - y) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, limit)
}
