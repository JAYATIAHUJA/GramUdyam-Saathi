import { clsx } from 'clsx'
import { type ReactNode, useId } from 'react'
import { ART } from './palette'

export type DidiMood = 'namaste' | 'listen' | 'happy' | 'think' | 'point' | 'worry'

/** Saathi Didi: the companion who asks every question. */
export function Didi({ mood = 'namaste', className, animate = true }: { mood?: DidiMood; className?: string; animate?: boolean }) {
  const { skin, skinShade, hair, saree, sareeDeep, border, blouse, ink } = ART
  const uid = useId().replace(/:/g, '')
  const g = (n: string) => `didi-${n}-${uid}`
  const lip = '#8E3B2C'

  const eyes =
    mood === 'happy' ? (
      <g fill="none" stroke={ink} strokeWidth="2.8" strokeLinecap="round">
        <path d="M83 85 q6 -6 12 0" />
        <path d="M105 85 q6 -6 12 0" />
      </g>
    ) : (
      <g className={animate ? 'didi-blink' : undefined}>
        {/* almond eyes with a lash line */}
        <path d="M82.5 85 q6.5 -6.5 13 0 q-6.5 4.5 -13 0 z" fill="#fff" />
        <path d="M104.5 85 q6.5 -6.5 13 0 q-6.5 4.5 -13 0 z" fill="#fff" />
        <circle cx="89" cy="84.4" r="3.4" fill={ink} />
        <circle cx="111" cy="84.4" r="3.4" fill={ink} />
        <circle cx="90.2" cy="83.2" r="1.1" fill="#fff" />
        <circle cx="112.2" cy="83.2" r="1.1" fill="#fff" />
        <path d="M81.5 84.6 q7.5 -8 15 0" fill="none" stroke={ink} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M103.5 84.6 q7.5 -8 15 0" fill="none" stroke={ink} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M96.2 84 l2 -1.6 M118.2 84 l2 -1.6" stroke={ink} strokeWidth="1.6" strokeLinecap="round" />
      </g>
    )
  const brows =
    mood === 'think' || mood === 'worry' ? (
      <g fill="none" stroke={hair} strokeWidth="2.4" strokeLinecap="round">
        <path d={mood === 'worry' ? 'M82 75 q7 -5 13 -1' : 'M82 74 q7 -3 13 0'} />
        <path d={mood === 'worry' ? 'M105 74 q6 -4 13 1' : 'M105 72 q7 -4 13 0'} />
      </g>
    ) : (
      <g fill="none" stroke={hair} strokeWidth="2.4" strokeLinecap="round">
        <path d="M82 76 q7 -5 13 -1.5" />
        <path d="M105 74.5 q7 -3.5 13 1.5" />
      </g>
    )
  const mouth =
    mood === 'listen' ? (
      <ellipse cx="100" cy="104" rx="3.6" ry="4.2" fill={lip} />
    ) : mood === 'think' ? (
      <path d="M94 105 q6 2 12 -2" fill="none" stroke={lip} strokeWidth="2.8" strokeLinecap="round" />
    ) : mood === 'worry' ? (
      <path d="M93 107 q7 -5 14 0" fill="none" stroke={lip} strokeWidth="2.8" strokeLinecap="round" />
    ) : (
      <g>
        <path d="M91 101 q9 10 18 0 q-9 3 -18 0 z" fill={lip} />
        <path d="M94 102.6 q6 3.4 12 0" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity=".85" />
      </g>
    )

  // Two glass bangles sitting across the wrist, turned to follow the forearm.
  const bangles = ([x, y]: [number, number], rot: number) => (
    <g transform={`rotate(${rot} ${x} ${y})`} strokeLinecap="round">
      <path d={`M${x - 7} ${y - 1.8} h14`} stroke="#D6336C" strokeWidth="3.2" />
      <path d={`M${x - 6.5} ${y + 1.8} h13`} stroke={border} strokeWidth="2.4" />
    </g>
  )
  // Arms: a sleeve stroke (blouse), a forearm stroke (skin), bangles at the wrist, then the hand on top.
  const arm = (d: string, fore: string, hand: [number, number], key: string, wrist: [number, number], rot: number) => (
    <g key={key}>
      <path d={d} fill="none" stroke={blouse} strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" />
      <path d={fore} fill="none" stroke={skin} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
      {bangles(wrist, rot)}
      <circle cx={hand[0]} cy={hand[1]} r="9" fill={skin} stroke={skinShade} strokeWidth="1" />
    </g>
  )
  const arms: Record<DidiMood, ReactNode> = {
    namaste: (
      <g>
        <path d="M58 172 q14 18 36 -2" fill="none" stroke={skin} strokeWidth="13" strokeLinecap="round" />
        <path d="M142 172 q-14 18 -36 -2" fill="none" stroke={skin} strokeWidth="13" strokeLinecap="round" />
        <path d="M100 138 c-9 8 -10 22 -5 34 h10 c5 -12 4 -26 -5 -34 z" fill={skin} />
        <path d="M100 140 v30" stroke={skinShade} strokeWidth="1.4" />
        <path d="M91 174 h18" stroke="#D6336C" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M92 177.5 h16" stroke={border} strokeWidth="2.4" strokeLinecap="round" />
      </g>
    ),
    listen: (
      <g>
        {arm('M56 166 q-16 -26 -10 -56', 'M46 124 q0 -18 12 -30', [60, 92], 'r', [51.5, 100.5], 45)}
        <path d="M142 172 q-10 20 -30 8" fill="none" stroke={skin} strokeWidth="13" strokeLinecap="round" />
      </g>
    ),
    happy: (
      <g className={clsx(animate && 'didi-wave')} style={{ transformOrigin: '150px 150px' }}>
        {arm('M146 158 q22 -16 18 -52', 'M162 126 q6 -16 -2 -34', [158, 86], 'w', [163, 97], -24)}
      </g>
    ),
    // Elbow down by her side, fist resting under the chin, one finger on the jaw.
    think: (
      <g>
        <path d="M66 156 q-6 14 0 30" fill="none" stroke={blouse} strokeWidth="17" strokeLinecap="round" />
        <path d="M68 190 q12 -30 28 -58" fill="none" stroke={skin} strokeWidth="13" strokeLinecap="round" />
        {bangles([89.5, 143], 28)}
        {/* a lighter fist so it reads against the neck, with knuckle creases and a raised index finger */}
        <path d="M104.5 123 q4 -5 2 -10.5" fill="none" stroke={skinShade} strokeWidth="6.4" strokeLinecap="round" />
        <path d="M104.5 123 q4 -5 2 -10.5" fill="none" stroke="#C98D60" strokeWidth="4.6" strokeLinecap="round" />
        <ellipse cx="99" cy="127" rx="10" ry="8" fill="#C98D60" stroke={skinShade} strokeWidth="1.4" />
        <path d="M91.5 125 h7 M91.5 128.5 h7 M92.5 132 h6" stroke={skinShade} strokeWidth="1.1" strokeLinecap="round" />
      </g>
    ),
    point: <g>{arm('M146 158 q28 -6 44 -30', 'M176 136 q12 -8 18 -20', [196, 112], 'p', [190.6, 122.7], 27)}</g>,
    worry: (
      <g>
        <path d="M58 172 q14 18 36 -2" fill="none" stroke={skin} strokeWidth="13" strokeLinecap="round" />
        <path d="M142 172 q-14 18 -36 -2" fill="none" stroke={skin} strokeWidth="13" strokeLinecap="round" />
        <circle cx="100" cy="168" r="10" fill={skin} />
        <path d="M92 177 h16" stroke="#D6336C" strokeWidth="3" strokeLinecap="round" />
      </g>
    ),
  }

  return (
    <svg viewBox="0 0 210 220" className={clsx(animate && 'didi-bob', className)} role="img" aria-label="Saathi Didi">
      <defs>
        <linearGradient id={g('saree')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={saree} />
          <stop offset="1" stopColor={sareeDeep} />
        </linearGradient>
        <linearGradient id={g('blouse')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3A48A8" />
          <stop offset="1" stopColor={blouse} />
        </linearGradient>
        <radialGradient id={g('face')} cx=".45" cy=".4" r=".7">
          <stop offset="0" stopColor="#C88A5C" />
          <stop offset="1" stopColor={skin} />
        </radialGradient>
      </defs>

      {/* hair falling behind the shoulders, and a bun with a gajra */}
      <path d="M64 94 C60 58 78 42 100 42 C122 42 140 58 136 94 C137 118 134 138 126 152 C118 158 82 158 74 152 C66 138 63 118 64 94 Z" fill={hair} />
      <circle cx="133" cy="54" r="15" fill={hair} />
      <g fill="#FFFDF5">
        <circle cx="121" cy="46" r="3" />
        <circle cx="125" cy="41.5" r="3" />
        <circle cx="130.5" cy="39" r="3" />
        <circle cx="136.5" cy="39" r="3" />
        <circle cx="142" cy="41.5" r="3" />
        <circle cx="146" cy="46" r="3" />
      </g>
      <circle cx="146" cy="52" r="3.6" fill="#E0457B" />
      <circle cx="146" cy="52" r="1.4" fill={border} />

      {/* body: blouse, then the saree wrapped at the waist and the pallu over the shoulder */}
      <path d="M38 220 C38 170 64 140 100 140 C136 140 162 170 162 220 Z" fill={`url(#${g('blouse')})`} />
      <path d="M50 220 C54 190 68 172 92 164 L150 220 Z" fill={`url(#${g('saree')})`} />
      <path d="M50 220 C54 190 68 172 92 164" fill="none" stroke={border} strokeWidth="4" strokeLinecap="round" />
      <path d="M112 141 C132 142 150 156 156 178 L164 220 L118 220 C122 190 116 164 100 150 Z" fill={`url(#${g('saree')})`} />
      <path d="M100 150 C116 164 122 190 118 220" fill="none" stroke={border} strokeWidth="6" />
      <path d="M100 150 C116 164 122 190 118 220" fill="none" stroke={sareeDeep} strokeWidth="1.6" strokeDasharray="1 5" strokeLinecap="round" />
      <path d="M126 150 C140 162 150 184 152 206" fill="none" stroke={sareeDeep} strokeWidth="2" opacity=".35" strokeLinecap="round" />

      {/* neck, mangalsutra */}
      <path d="M90 108 h20 v26 c-6 6 -14 6 -20 0 z" fill={skinShade} />
      <path d="M86 130 q14 14 28 0" fill="none" stroke={ink} strokeWidth="1.4" />
      <g fill={border}>
        <circle cx="100" cy="137.5" r="3" />
        <circle cx="92" cy="134.5" r="1.3" />
        <circle cx="108" cy="134.5" r="1.3" />
      </g>

      {/* ears with jhumkas */}
      <ellipse cx="73.5" cy="90" rx="4.6" ry="6.6" fill={skinShade} />
      <ellipse cx="126.5" cy="90" rx="4.6" ry="6.6" fill={skinShade} />
      <g fill={border}>
        <circle cx="73.5" cy="99" r="2" />
        <path d="M69.5 108 q4 -8 8 0 z" />
        <circle cx="73.5" cy="110" r="1.3" />
        <circle cx="126.5" cy="99" r="2" />
        <path d="M122.5 108 q4 -8 8 0 z" />
        <circle cx="126.5" cy="110" r="1.3" />
      </g>

      {/* face with a soft chin */}
      <path d="M74 84 C74 64 86 55 100 55 C114 55 126 64 126 84 C126 104 115 119 100 119 C85 119 74 104 74 84 Z" fill={`url(#${g('face')})`} />
      <path d="M80 104 C86 114 94 118 100 118" fill="none" stroke={skinShade} strokeWidth="2" opacity=".35" strokeLinecap="round" />

      {/* front hair with a centre parting and sindoor */}
      <path d="M71 88 C68 60 83 47 100 47 C117 47 132 60 129 88 C125 72 115 63 104 61 L100 66 L96 61 C85 63 75 72 71 88 Z" fill={hair} />
      <path d="M100 48.5 v6" stroke="#C0392B" strokeWidth="2.2" strokeLinecap="round" />

      {brows}
      {eyes}
      {/* bindi, nose, blush */}
      <circle cx="100" cy="71.5" r="2.8" fill="#C0392B" />
      <circle cx="100" cy="71.5" r="0.9" fill={border} />
      <path d="M99 88 q-3 7 1 9.5" fill="none" stroke={skinShade} strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="82" cy="97" rx="5" ry="3" fill="#E07A5F" opacity=".4" />
      <ellipse cx="118" cy="97" rx="5" ry="3" fill="#E07A5F" opacity=".4" />
      {mouth}
      {arms[mood]}
    </svg>
  )
}
