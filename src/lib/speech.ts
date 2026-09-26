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

let speakingId = 0
export function speak(text: string, lang: Lang, onEnd?: () => void) {
  if (typeof speechSynthesis === 'undefined') return
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text.replace(/₹/g, lang === 'hi' ? ' रुपये ' : ' rupees '))
  u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
  const voices = speechSynthesis.getVoices()
  const v = voices.find((x) => x.lang === u.lang) || voices.find((x) => x.lang.startsWith(lang))
  if (v) u.voice = v
  u.rate = 0.95
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
