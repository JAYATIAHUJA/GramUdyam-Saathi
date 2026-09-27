import { useCallback, useEffect, useRef, useState } from 'react'
import type { Lang } from './store'

// Web Speech API stands in for Bhashini ASR/TTS in the browser demo.
// Production: Bhashini ULCA pipeline (ASR → NMT → TTS), AI4Bharat fallback.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = any

function Recognition(): AnyRec | null {
  const w = window as AnyRec
  const C = w.SpeechRecognition || w.webkitSpeechRecognition
  return C ? new C() : null
}

export const speechSupported = () => typeof window !== 'undefined' && !!((window as AnyRec).SpeechRecognition || (window as AnyRec).webkitSpeechRecognition)

export function useListen(lang: Lang, onFinal: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [error, setError] = useState<string | null>(null)
  const rec = useRef<AnyRec | null>(null)
  const cb = useRef(onFinal)
  cb.current = onFinal

  const stop = useCallback(() => {
    rec.current?.stop()
    setListening(false)
  }, [])

  const start = useCallback(() => {
    setError(null)
    const r = Recognition()
    if (!r) {
      setError('unsupported')
      return
    }
    r.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
    r.interimResults = true
    r.maxAlternatives = 1
    r.onresult = (e: AnyRec) => {
      let fin = ''
      let mid = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) fin += t
        else mid += t
      }
      setInterim(mid || fin)
      if (fin) cb.current(fin.trim())
    }
    r.onerror = (e: AnyRec) => {
      setError(e.error || 'error')
      setListening(false)
    }
    r.onend = () => setListening(false)
    rec.current = r
    setInterim('')
    setListening(true)
    try {
      r.start()
    } catch {
      setListening(false)
    }
  }, [lang])

  useEffect(() => () => rec.current?.abort?.(), [])
  return { listening, interim, error, start, stop, supported: speechSupported() }
}

// Browsers load voices late, so keep the list fresh instead of reading it once.
let voices: SpeechSynthesisVoice[] = []
if (typeof speechSynthesis !== 'undefined') {
  voices = speechSynthesis.getVoices()
  speechSynthesis.addEventListener?.('voiceschanged', () => {
    voices = speechSynthesis.getVoices()
  })
}

// Female Indian voices first (Didi is a woman), then any Indian voice. Names cover Chrome, Edge, Android and Apple.
const PREFERRED: Record<Lang, RegExp[]> = {
  hi: [/swara/i, /kalpana/i, /lekha/i, /google.*(hindi|हिन्दी)/i, /hindi|हिन्दी/i],
  en: [/neerja/i, /heera/i, /veena/i, /google.*english.*india/i, /india/i],
}
const norm = (l: string) => l.toLowerCase().replace('_', '-')

/** The best installed voice that actually speaks this language with an Indian accent, or null. */
export function pickVoice(lang: Lang): SpeechSynthesisVoice | null {
  const want = lang === 'hi' ? 'hi-in' : 'en-in'
  const local = voices.filter((v) => norm(v.lang) === want || (lang === 'hi' && norm(v.lang).startsWith('hi')))
  if (!local.length) return null
  for (const re of PREFERRED[lang]) {
    const hit = local.find((v) => re.test(v.name))
    if (hit) return hit
  }
  // Prefer the higher-quality neural/online voices when names don't match.
  return local.find((v) => /natural|online|neural/i.test(v.name)) ?? local[0]
}

/** Read numbers the way a person in Barabanki would say them, not digit by digit in English. */
function forSpeech(text: string, lang: Lang) {
  const hi = lang === 'hi'
  // Money only: "₹1,06,000" -> "106000 रुपये", "₹2.07 L" -> "2.07 लाख रुपये". Other numbers (13 km, 10 cows) stay as they are.
  let s = text.replace(/~?\s?₹\s?(\d+(?:,\d+)*(?:\.\d+)?)(\s?L\b)?/g, (m, n: string, l?: string) => {
    const about = m.startsWith('~') ? (hi ? 'लगभग ' : 'about ') : ''
    const num = n.replace(/,/g, '')
    return ` ${about}${num} ${l ? (hi ? 'लाख रुपये' : 'lakh rupees') : hi ? 'रुपये' : 'rupees'}`
  })
  if (hi) s = s.replace(/%/g, ' प्रतिशत').replace(/×/g, ' गुना')
  return s
}

let speakingId = 0
export function speak(text: string, lang: Lang, onEnd?: () => void) {
  if (typeof speechSynthesis === 'undefined') return
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(forSpeech(text, lang))
  u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
  const v = pickVoice(lang)
  if (v) u.voice = v
  // A touch slower and warmer for Hindi, so it sounds like Didi talking, not an announcement.
  u.rate = lang === 'hi' ? 0.9 : 0.95
  u.pitch = 1.05
  const id = ++speakingId
  u.onend = () => id === speakingId && onEnd?.()
  speechSynthesis.speak(u)
}

export function stopSpeaking() {
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel()
}

/** Map a spoken phrase to a business code. */
export function matchActivity(text: string): string | null {
  const t = text.toLowerCase()
  const table: [RegExp, string][] = [
    [/gaay|gai|cow|dairy|doodh|dudh|bhains|buffalo|गाय|डेयरी|दूध|भैंस/, 'dairy'],
    [/bakri|goat|बकरी/, 'goat'],
    [/kirana|shop|dukan|grocery|किराना|दुकान/, 'kirana'],
    [/silai|tailor|sewing|सिलाई|दर्जी/, 'tailoring'],
    [/mobile|phone|repair|मोबाइल|रिपेयर/, 'mobile'],
    [/chai|tea|nashta|snack|चाय|नाश्ता/, 'tea'],
    [/chakki|atta|flour|mill|चक्की|आटा/, 'chakki'],
    [/murgi|poultry|chicken|मुर्गी/, 'poultry'],
    [/nursery|plant|paudha|नर्सरी|पौध/, 'nursery'],
  ]
  return table.find(([re]) => re.test(t))?.[1] ?? null
}
