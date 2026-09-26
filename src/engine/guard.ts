// Numeric guard (SRS §7.4): every number the narrator writes must exist in the
// engine's facts JSON. Handles Indian grouping, Devanagari digits and number words.

const DEV = '०१२३४५६७८९'
const WORDS: Record<string, number> = {
  ek: 1, do: 2, teen: 3, char: 4, chaar: 4, paanch: 5, panch: 5, chhe: 6, saat: 7, aath: 8, nau: 9, das: 10,
  एक: 1, दो: 2, तीन: 3, चार: 4, पाँच: 5, पांच: 5, छह: 6, सात: 7, आठ: 8, नौ: 9, दस: 10, बीस: 20, पचास: 50,
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twenty: 20, fifty: 50,
  bees: 20, pachas: 50, pachaas: 50,
}
const MULT: Record<string, number> = {
  lakh: 100000, lac: 100000, लाख: 100000, hazaar: 1000, hazar: 1000, हज़ार: 1000, हजार: 1000, thousand: 1000, crore: 10000000, करोड़: 10000000, sau: 100, सौ: 100, hundred: 100,
}

export function toAsciiDigits(s: string) {
  return s.replace(/[०-९]/g, (d) => String(DEV.indexOf(d)))
}

/** Extract every numeric quantity from free text (₹9,00,000 · 8% · "nau lakh" · ९ लाख). */
export function extractNumbers(text: string): number[] {
  const t = toAsciiDigits(text.toLowerCase())
  const out: number[] = []
  const re = /(\d[\d,]*(?:\.\d+)?)\s*(lakh|lac|लाख|hazaar|hazar|हज़ार|हजार|thousand|crore|करोड़)?/g
  let m: RegExpExecArray | null
  while ((m = re.exec(t))) {
    let n = parseFloat(m[1].replace(/,/g, ''))
    if (m[2]) n *= MULT[m[2]]
    out.push(n)
  }
  const tokens = t.split(/[\s,।.]+/)
  for (let i = 0; i < tokens.length; i++) {
    const w = WORDS[tokens[i]]
    if (w == null) continue
    const mul = MULT[tokens[i + 1]]
    out.push(mul ? w * mul : w)
  }
  return out
}

/** Spoken amount → rupees. "ek lakh" → 100000, "पचास हज़ार" → 50000, "1.5 lakh" → 150000. */
export function parseAmount(text: string): number | null {
  const t = toAsciiDigits(text.toLowerCase())
  let total = 0
  let current = 0
  let seen = false
  const tokens = t.replace(/₹|rs\.?|rupaye|rupees|रुपये|रुपए/g, ' ').split(/[\s,]+/).filter(Boolean)
  for (const tok of tokens) {
    const num = /^\d+(\.\d+)?$/.test(tok) ? parseFloat(tok) : WORDS[tok]
    if (num != null) {
      current += num
      seen = true
      continue
    }
    const mul = MULT[tok]
    if (mul) {
      total += (current || 1) * mul
      current = 0
      seen = true
    }
  }
  total += current
  return seen && total > 0 ? Math.round(total) : null
}

export function numericGuard(text: string, facts: number[], tolerance = 0.005) {
  const found = extractNumbers(text)
  const unknown = found.filter((n) => !facts.some((f) => Math.abs(f - n) <= Math.max(1, Math.abs(f) * tolerance)))
  return { ok: unknown.length === 0, found, unknown }
}
