import { clsx } from 'clsx'
import { AlertTriangle, CheckCircle2, Landmark, MapPin, Mic, MicOff, OctagonX, Pause, User, Volume2, Waves } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Confidence } from '../engine/feasibility'
import type { Verdict } from '../engine/plan'
import { speak, stopSpeaking } from '../lib/speech'
import { useApp, useT, type Lang } from '../lib/store'

export function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <Link to="/" className={clsx('flex shrink-0 items-center', light && 'rounded-xl bg-white px-2.5 py-1.5')} aria-label="GramUdyam Saathi home">
      {compact ? (
        <img src="/brand/logo-mark.webp" alt="GramUdyam Saathi" width={115} height={112} className="h-10 w-auto" />
      ) : (
        <img src="/brand/logo-lockup.webp" alt="GramUdyam Saathi" width={482} height={112} className={clsx('w-auto', light ? 'h-9' : 'h-11')} />
      )}
    </Link>
  )
}

export function LangToggle({ className }: { className?: string }) {
  const { lang, setLang } = useApp()
  return (
    <div role="group" aria-label="Language" className={clsx('inline-flex rounded-full bg-khadi p-1 text-sm font-semibold', className)}>
      {(['hi', 'en'] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={clsx('rounded-full px-3 py-1 transition-colors', lang === l ? 'bg-indigo text-white' : 'text-muted hover:text-ink')}
        >
          {l === 'hi' ? 'हिं' : 'EN'}
        </button>
      ))}
    </div>
  )
}

const CONF: Record<Confidence, { en: string; hi: string; icon: typeof Landmark; cls: string }> = {
  official: { en: 'Official data', hi: 'सरकारी डेटा', icon: Landmark, cls: 'bg-indigo text-white border-indigo' },
  map: { en: 'Map', hi: 'नक्शा', icon: MapPin, cls: 'bg-go-soft text-go border-go/30' },
  user: { en: 'You told us', hi: 'आपने बताया', icon: User, cls: 'bg-marigold-soft text-[#7a5500] border-marigold/40' },
  model: { en: 'Estimate', hi: 'अंदाज़ा', icon: Waves, cls: 'bg-white text-muted border-muted/50 border-dashed' },
}

export function ConfidenceBadge({ c, className }: { c: Confidence; className?: string }) {
  const t = useT()
  const m = CONF[c]
  const Icon = m.icon
  return (
    <span className={clsx('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11.5px] font-semibold whitespace-nowrap', m.cls, className)}>
      <Icon className="size-3" aria-hidden />
      {t(m.en, m.hi)}
    </span>
  )
}

export const VERDICT: Record<Verdict, { en: string; hi: string; enSub: string; hiSub: string; color: string; soft: string; icon: typeof CheckCircle2 }> = {
  go: { en: 'Good opportunity', hi: 'अच्छा मौका', enSub: 'Right-sized and repayable', hiSub: 'सही आकार, किस्त चुक जाएगी', color: '#1B873F', soft: 'bg-go-soft', icon: CheckCircle2 },
  caution: { en: 'Go carefully', hi: 'सोच के', enSub: 'Possible, with conditions', hiSub: 'हो सकता है, कुछ शर्तों के साथ', color: '#C77700', soft: 'bg-caution-soft', icon: AlertTriangle },
  rethink: { en: 'Rethink', hi: 'दोबारा सोचिए', enSub: 'Repayment is at risk', hiSub: 'किस्त चुकाने में ख़तरा', color: '#B42318', soft: 'bg-risk-soft', icon: OctagonX },
}

/** The signature element: an SCA-office rubber stamp that presses down once. */
export function VerdictStamp({ v, size = 'lg', animate = true }: { v: Verdict; size?: 'lg' | 'sm'; animate?: boolean }) {
  const t = useT()
  const m = VERDICT[v]
  const Icon = m.icon
  const lg = size === 'lg'
  return (
    <div
      className={clsx('inline-flex flex-col items-center justify-center rounded-[14px] select-none', animate && 'stamp-in', lg ? 'px-5 py-3' : 'px-2.5 py-1')}
      style={{ color: m.color, border: `${lg ? 3 : 2}px solid ${m.color}`, boxShadow: `inset 0 0 0 ${lg ? 3 : 2}px #fff, inset 0 0 0 ${lg ? 5 : 3}px ${m.color}`, transform: 'rotate(-6deg)', background: 'rgba(255,255,255,0.85)' }}
      role="img"
      aria-label={t(m.en, m.hi)}
    >
      <span className={clsx('flex items-center gap-1.5 font-display font-extrabold leading-none', lg ? 'text-[28px]' : 'text-[14px]')}>
        <Icon className={lg ? 'size-6' : 'size-3.5'} strokeWidth={2.6} aria-hidden />
        {t(m.en, m.hi)}
      </span>
      {lg && <span className="mt-1 text-[11px] font-bold tracking-wide opacity-80">{t(m.enSub, m.hiSub)}</span>}
    </div>
  )
}

export function VerdictPill({ v }: { v: Verdict }) {
  const t = useT()
  const m = VERDICT[v]
  const Icon = m.icon
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold" style={{ color: m.color, background: m.color + '14', border: `1px solid ${m.color}40` }}>
      <Icon className="size-3.5" aria-hidden />
      {t(m.en, m.hi)}
    </span>
  )
}

/** A term with a dotted underline that explains itself on hover, focus or tap. */
export function Tip({ tip, children, className, dark }: { tip: string; children: ReactNode; className?: string; dark?: boolean }) {
  return (
    <span tabIndex={0} className={clsx('group/tip relative inline-flex cursor-help items-center underline decoration-dotted decoration-1 underline-offset-[3px] outline-none', dark ? 'decoration-white/40' : 'decoration-ink/30', className)}>
      {children}
      <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-[220px] -translate-x-1/2 translate-y-1 rounded-lg bg-ink px-2.5 py-1.5 text-left text-[12px] leading-snug font-medium text-white no-underline opacity-0 shadow-lg transition-all duration-150 group-hover/tip:translate-y-0 group-hover/tip:opacity-100 group-focus/tip:translate-y-0 group-focus/tip:opacity-100">
        {tip}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-ink" aria-hidden />
      </span>
    </span>
  )
}

/** Icon plus a short label, no pill chrome: for tables where many verdicts sit in one column. */
export function VerdictTag({ v }: { v: Verdict }) {
  const t = useT()
  const m = VERDICT[v]
  const Icon = m.icon
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold whitespace-nowrap" style={{ color: m.color }}>
      <Icon className="size-4" aria-hidden />
      {t(m.en, m.hi)}
    </span>
  )
}

/** Icon-only verdict for dense lists; the label lives in the tooltip and for screen readers. */
export function VerdictDot({ v }: { v: Verdict }) {
  const t = useT()
  const m = VERDICT[v]
  const Icon = m.icon
  return (
    <span className="grid size-7 shrink-0 place-items-center rounded-full" style={{ color: m.color, background: m.color + '14' }} title={t(m.en, m.hi)} role="img" aria-label={t(m.en, m.hi)}>
      <Icon className="size-4" aria-hidden />
    </span>
  )
}

export function ReadAloud({ text, lang, className, label }: { text: string; lang: Lang; className?: string; label?: ReactNode }) {
  const [on, setOn] = useState(false)
  const t = useT()
  useEffect(() => () => stopSpeaking(), [])
  return (
    <button
      type="button"
      onClick={() => {
        if (on) {
          stopSpeaking()
          setOn(false)
        } else {
          setOn(true)
          speak(text, lang, () => setOn(false))
        }
      }}
      className={clsx('inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-sm font-semibold text-indigo hover:border-indigo/40', className)}
      aria-label={on ? t('Stop reading', 'पढ़ना रोकें') : t('Read aloud', 'सुनें')}
    >
      {on ? <Pause className="size-4" /> : <Volume2 className="size-4" />}
      {label ?? (on ? t('Stop', 'रोकें') : t('Listen', 'सुनें'))}
    </button>
  )
}

export function MicButton({ listening, onClick, disabled, size = 76 }: { listening: boolean; onClick: () => void; disabled?: boolean; size?: number }) {
  const t = useT()
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={listening ? t('Stop listening', 'सुनना बंद करें') : t('Speak', 'बोलिए')}
      className={clsx(
        'relative grid place-items-center rounded-full text-indigo-deep shadow-[0_6px_0_#b98200] transition-transform active:translate-y-1 active:shadow-[0_2px_0_#b98200] disabled:opacity-40',
        listening ? 'bg-white listening' : 'bg-marigold',
      )}
      style={{ width: size, height: size }}
    >
      {disabled ? <MicOff className="size-8" /> : <Mic className="size-8" strokeWidth={2.4} />}
    </button>
  )
}

export function Stat({ label, value, sub, tone }: { label: ReactNode; value: ReactNode; sub?: ReactNode; tone?: 'go' | 'caution' | 'risk' }) {
  return (
    <div>
      <div className="text-[13px] text-muted font-medium">{label}</div>
      <div className={clsx('num text-[26px] font-bold leading-tight', tone === 'go' && 'text-go', tone === 'caution' && 'text-caution', tone === 'risk' && 'text-risk')}>{value}</div>
      {sub && <div className="text-[12.5px] text-muted">{sub}</div>}
    </div>
  )
}

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={clsx('inline-flex items-center rounded-md bg-khadi px-1.5 py-0.5 text-[11.5px] font-semibold text-muted', className)}>{children}</span>
}

export function FactRow({ label, value, source, year, c }: { label: string; value: string; source: string; year: string; c: Confidence }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-line last:border-0">
      <div className="min-w-0">
        <div className="text-[14px] font-medium">{label}</div>
        <div className="text-[11.5px] text-muted truncate">
          {source}, {year}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="num text-[17px] font-bold">{value}</div>
        <ConfidenceBadge c={c} />
      </div>
    </div>
  )
}
