export const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')

/** Compact Indian units: ₹2.9 L, ₹45 L, ₹1.2 Cr, ₹90,000 */
export function lakh(n: number) {
  const a = Math.abs(n)
  if (a >= 1e7) return `₹${trim(n / 1e7)} Cr`
  if (a >= 1e5) return `₹${trim(n / 1e5)} L`
  return inr(n)
}

function trim(x: number) {
  return x.toFixed(x >= 10 ? 1 : 2).replace(/\.?0+$/, '')
}

export const pct = (x: number, d = 0) => `${(x * 100).toFixed(d)}%`

export const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const MONTHS_HI = ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुला', 'अग', 'सितं', 'अक्टू', 'नवं', 'दिसं']

/** DSCR for display: no debt service → '-'. */
export const dscr = (n: number | undefined | null) => (n == null || !Number.isFinite(n) ? '-' : n.toFixed(2))
