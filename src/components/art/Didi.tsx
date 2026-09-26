import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import { ART } from './palette'

export type DidiMood = 'namaste' | 'listen' | 'happy' | 'think' | 'point' | 'worry'

/** Saathi Didi: the companion who asks every question. */
export function Didi({ mood = 'namaste', className, animate = true }: { mood?: DidiMood; className?: string; animate?: boolean }) {
  const { skin, skinShade, hair, saree, sareeDeep, border, blouse, ink } = ART
  const eyes =
    mood === 'happy' ? (
      <g fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round">
        <path d="M84 84 q5 -6 10 0" />
        <path d="M106 84 q5 -6 10 0" />
      </g>
    ) : (
      <g className={animate ? 'didi-blink' : undefined} fill={ink}>
        <ellipse cx="89" cy="84" rx="3.6" ry="4.4" />
        <ellipse cx="111" cy="84" rx="3.6" ry="4.4" />
        <circle cx="90.2" cy="82.6" r="1.1" fill="#fff" />
        <circle cx="112.2" cy="82.6" r="1.1" fill="#fff" />
      </g>
    )
  const brows =
    mood === 'think' || mood === 'worry' ? (
      <g fill="none" stroke={hair} strokeWidth="2.6" strokeLinecap="round">
        <path d={mood === 'worry' ? 'M82 75 q7 -5 13 -1' : 'M82 74 q7 -3 13 0'} />
        <path d={mood === 'worry' ? 'M105 74 q6 -4 13 1' : 'M105 72 q7 -4 13 0'} />
      </g>
    ) : (
      <g fill="none" stroke={hair} strokeWidth="2.6" strokeLinecap="round">
        <path d="M82 75 q7 -5 13 -1" />
        <path d="M105 74 q7 -4 13 1" />
      </g>
    )
  const mouth =
    mood === 'listen' ? (
      <ellipse cx="100" cy="103" rx="4" ry="4.6" fill="#7A2E1F" />
    ) : mood === 'think' ? (
      <path d="M93 104 q7 2 14 -2" fill="none" stroke="#7A2E1F" strokeWidth="3" strokeLinecap="round" />
    ) : mood === 'worry' ? (
      <path d="M92 106 q8 -6 16 0" fill="none" stroke="#7A2E1F" strokeWidth="3" strokeLinecap="round" />
    ) : (
      <path d="M90 100 q10 11 20 0 z" fill="#7A2E1F" />
    )

  // Arms are drawn as thick rounded strokes: sleeve (blouse) then forearm (skin) then a hand.
  const arm = (d: string, fore: string, hand: [number, number], key: string) => (
    <g key={key}>
      <path d={d} fill="none" stroke={blouse} strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" />
      <path d={fore} fill="none" stroke={skin} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={hand[0]} cy={hand[1]} r="9.5" fill={skin} />
      <path d={`M${hand[0] - 7} ${hand[1] + 11} h14`} stroke={border} strokeWidth="3" strokeLinecap="round" />
    </g>
  )
  const arms: Record<DidiMood, ReactNode> = {
    namaste: (
      <g>
        <path d="M58 170 q14 18 36 -2" fill="none" stroke={skin} strokeWidth="14" strokeLinecap="round" />
        <path d="M142 170 q-14 18 -36 -2" fill="none" stroke={skin} strokeWidth="14" strokeLinecap="round" />
        <path d="M100 136 c-9 8 -10 22 -5 34 h10 c5 -12 4 -26 -5 -34 z" fill={skin} />
        <path d="M100 138 v30" stroke={skinShade} strokeWidth="1.6" />
        <path d="M92 172 h16" stroke={border} strokeWidth="3" strokeLinecap="round" />
      </g>
    ),
    listen: (
      <g>
        {arm('M56 166 q-16 -26 -10 -56', 'M46 124 q0 -18 12 -30', [60, 92], 'r')}
        <path d="M142 170 q-10 20 -30 8" fill="none" stroke={skin} strokeWidth="14" strokeLinecap="round" />
      </g>
    ),
    happy: (
      <g className={clsx(animate && 'didi-wave')} style={{ transformOrigin: '150px 150px' }}>
        {arm('M146 158 q22 -16 18 -52', 'M162 126 q6 -16 -2 -34', [158, 86], 'w')}
      </g>
    ),
    think: (
      <g>
        {arm('M62 164 q10 -8 26 -24', 'M84 146 q14 -12 12 -26', [96, 116], 't')}
      </g>
    ),
    point: (
      <g>
        {arm('M146 158 q28 -6 44 -30', 'M176 136 q12 -8 18 -20', [196, 112], 'p')}
      </g>
    ),
    worry: (
      <g>
        <path d="M58 170 q14 18 36 -2" fill="none" stroke={skin} strokeWidth="14" strokeLinecap="round" />
        <path d="M142 170 q-14 18 -36 -2" fill="none" stroke={skin} strokeWidth="14" strokeLinecap="round" />
        <circle cx="100" cy="166" r="10" fill={skin} />
      </g>
    ),
  }

  return (
    <svg viewBox="0 0 210 220" className={clsx(animate && 'didi-bob', className)} role="img" aria-label="Saathi Didi">
      {/* hair back + bun */}
      <circle cx="100" cy="80" r="36" fill={hair} />
      <circle cx="134" cy="58" r="15" fill={hair} />
      <circle cx="134" cy="58" r="5" fill="#F2F2F2" opacity=".9" />
      <circle cx="140" cy="52" r="3.2" fill="#E0457B" />
      {/* body: blouse, saree, pallu */}
      <path d="M36 220 c0 -52 26 -84 64 -84 s64 32 64 84 z" fill={blouse} />
      <path d="M52 220 c2 -30 14 -52 34 -62 l66 62 z" fill={saree} />
      <path d="M68 142 c22 -8 46 -6 66 6 l20 72 h-44 z" fill={saree} />
      <path d="M68 142 c22 -8 46 -6 66 6" fill="none" stroke={border} strokeWidth="6" strokeLinecap="round" />
      <path d="M134 148 l20 72" stroke={border} strokeWidth="6" />
      <path d="M86 158 l54 62" stroke={sareeDeep} strokeWidth="3" opacity=".5" />
      {/* neck */}
      <path d="M90 108 h20 v26 c-6 6 -14 6 -20 0 z" fill={skinShade} />
      <path d="M86 130 q14 12 28 0" fill="none" stroke={border} strokeWidth="3" strokeLinecap="round" />
      {/* face */}
      <ellipse cx="100" cy="88" rx="27" ry="30" fill={skin} />
      <ellipse cx="73" cy="90" rx="5" ry="7" fill={skinShade} />
      <ellipse cx="127" cy="90" rx="5" ry="7" fill={skinShade} />
      <circle cx="73" cy="100" r="3" fill={border} />
      <circle cx="127" cy="100" r="3" fill={border} />
      {/* hair front with centre parting */}
      <path d="M72 82 c0 -26 14 -36 28 -36 s28 10 28 36 c-6 -14 -16 -22 -28 -22 s-22 8 -28 22 z" fill={hair} />
      <path d="M100 50 v10" stroke="#C0392B" strokeWidth="2.4" strokeLinecap="round" />
      {brows}
      {eyes}
      <circle cx="100" cy="72" r="3" fill="#C0392B" />
      <path d="M99 88 q-3 7 1 9" fill="none" stroke={skinShade} strokeWidth="2.2" strokeLinecap="round" />
      <ellipse cx="82" cy="96" rx="5" ry="3" fill="#E07A5F" opacity=".45" />
      <ellipse cx="118" cy="96" rx="5" ry="3" fill="#E07A5F" opacity=".45" />
      {mouth}
      {arms[mood]}
    </svg>
  )
}
