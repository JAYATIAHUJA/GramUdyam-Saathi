import { clsx } from 'clsx'

const ACT_BG: Record<string, string> = {
  dairy: '#E3F1E6',
  goat: '#F6EAD7',
  kirana: '#FDEBD6',
  tailoring: '#F4E4F1',
  mobile: '#E4E9F8',
  tea: '#F8E6DC',
  chakki: '#F3EDDC',
  poultry: '#FFF1CC',
  nursery: '#E2F2DF',
}

function ActSvg({ code }: { code: string }) {
  switch (code) {
    case 'dairy':
      return (
        <g>
          <ellipse cx="32" cy="54" rx="22" ry="3" fill="#000" opacity=".08" />
          <rect x="12" y="28" width="34" height="18" rx="9" fill="#fff" />
          <path d="M20 28 c4 6 10 6 12 0" fill="#2A1A14" />
          <ellipse cx="38" cy="40" rx="5" ry="4" fill="#2A1A14" />
          <rect x="15" y="42" width="5" height="12" rx="2" fill="#fff" />
          <rect x="37" y="42" width="5" height="12" rx="2" fill="#fff" />
          <rect x="15" y="51" width="5" height="3" fill="#6B4A3A" />
          <rect x="37" y="51" width="5" height="3" fill="#6B4A3A" />
          <ellipse cx="29" cy="47" rx="4" ry="2.4" fill="#F4A6B4" />
          <path d="M12 32 q-5 4 -3 12" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
          <rect x="42" y="20" width="14" height="15" rx="6" fill="#fff" />
          <rect x="45" y="29" width="10" height="7" rx="3.5" fill="#F4A6B4" />
          <circle cx="47" cy="25" r="1.6" fill="#2A1A14" />
          <circle cx="53" cy="25" r="1.6" fill="#2A1A14" />
          <path d="M43 20 l-3 -5 M55 20 l3 -5" stroke="#C9A36B" strokeWidth="2.6" strokeLinecap="round" />
        </g>
      )
    case 'goat':
      return (
        <g>
          <ellipse cx="32" cy="54" rx="20" ry="3" fill="#000" opacity=".08" />
          <rect x="14" y="30" width="30" height="15" rx="7.5" fill="#8A5A3B" />
          <rect x="17" y="42" width="4" height="12" rx="2" fill="#8A5A3B" />
          <rect x="37" y="42" width="4" height="12" rx="2" fill="#8A5A3B" />
          <path d="M40 30 l6 -10 h8 l2 10 -6 6 h-8 z" fill="#8A5A3B" />
          <path d="M47 20 q-2 -7 -8 -8 M53 20 q2 -7 8 -6" fill="none" stroke="#3E2A1E" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="51" cy="25" r="1.6" fill="#2A1A14" />
          <path d="M50 36 l1 6 2 -6" fill="#E9DCC8" />
          <path d="M42 22 l-6 2 3 3" fill="#6E4329" />
          <path d="M14 32 q-4 -3 -2 -7" fill="none" stroke="#8A5A3B" strokeWidth="3" strokeLinecap="round" />
        </g>
      )
    case 'kirana':
      return (
        <g>
          <rect x="10" y="24" width="44" height="30" rx="3" fill="#fff" />
          <path d="M8 16 h48 l-3 11 H11 z" fill="#E0662B" />
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M${14 + i * 12} 16 h6 l-1 11 h-6 z`} fill="#fff" opacity=".9" />
          ))}
          <path d="M11 27 q4 5 8 0 q4 5 8 0 q4 5 8 0 q4 5 8 0 q4 5 8 0" fill="#E0662B" />
          <rect x="14" y="34" width="36" height="3" rx="1.5" fill="#E4D7BE" />
          <rect x="16" y="28" width="6" height="6" rx="1.5" fill="#2F8F46" />
          <rect x="24" y="29" width="6" height="5" rx="1.5" fill="#F4B63A" />
          <rect x="33" y="27" width="5" height="7" rx="1.5" fill="#2E3A8C" />
          <rect x="41" y="29" width="7" height="5" rx="1.5" fill="#C0392B" />
          <rect x="12" y="42" width="40" height="12" rx="2" fill="#B37A4C" />
          <circle cx="20" cy="42" r="4" fill="#F4B63A" />
          <circle cx="44" cy="42" r="4" fill="#2F8F46" />
        </g>
      )
    case 'tailoring':
      return (
        <g>
          <rect x="10" y="48" width="44" height="6" rx="2" fill="#B37A4C" />
          <path d="M16 48 v-22 a8 8 0 0 1 8 -8 h20 a8 8 0 0 1 8 8 v8 h-8 v-6 h-18 v20 z" fill="#2E3A8C" />
          <rect x="42" y="34" width="4" height="10" fill="#9AA3D6" />
          <path d="M44 44 v4" stroke="#211F1B" strokeWidth="1.6" />
          <circle cx="24" cy="26" r="3.5" fill="#F4B63A" />
          <rect x="20" y="40" width="18" height="6" rx="1" fill="#E8C1DE" />
          <rect x="47" y="10" width="7" height="12" rx="1.5" fill="#C0397B" />
          <rect x="46" y="9" width="9" height="2.4" rx="1" fill="#B37A4C" />
          <rect x="46" y="21" width="9" height="2.4" rx="1" fill="#B37A4C" />
          <path d="M50 23 q-4 8 -6 11" fill="none" stroke="#C0397B" strokeWidth="1.4" />
        </g>
      )
    case 'mobile':
      return (
        <g>
          <rect x="18" y="8" width="24" height="44" rx="5" fill="#2E3A8C" />
          <rect x="21" y="13" width="18" height="30" rx="2" fill="#BFD4FF" />
          <circle cx="30" cy="47.5" r="2" fill="#9AA3D6" />
          <path d="M24 22 h12 M24 27 h8" stroke="#2E3A8C" strokeWidth="2" strokeLinecap="round" opacity=".5" />
          <path d="M40 50 l12 -12" stroke="#E0662B" strokeWidth="5" strokeLinecap="round" />
          <path d="M52 38 l4 -4 a4 4 0 0 0 -5 -5 l-1 3 -2 -1 1 -3 a4 4 0 0 0 -5 5" fill="#9E9E9E" />
          <circle cx="47" cy="17" r="4" fill="#F4B63A" />
          <path d="M47 11 v2 M47 21 v2 M41 17 h2 M51 17 h2" stroke="#F4B63A" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      )
    case 'tea':
      return (
        <g>
          <path d="M18 16 q2 -4 0 -8 M26 16 q2 -4 0 -8" fill="none" stroke="#B9A48A" strokeWidth="2" strokeLinecap="round" />
          <path d="M10 22 h24 l-2 20 a6 6 0 0 1 -6 5 h-8 a6 6 0 0 1 -6 -5 z" fill="#C0392B" />
          <path d="M34 26 a6 6 0 0 1 0 12" fill="none" stroke="#C0392B" strokeWidth="3.2" />
          <rect x="10" y="22" width="24" height="4" fill="#fff" opacity=".5" />
          <path d="M40 30 h14 l-2 20 h-10 z" fill="#FFF8EA" />
          <rect x="40" y="30" width="14" height="5" fill="#B5763D" />
          <ellipse cx="47" cy="30" rx="7" ry="1.6" fill="#8B5329" />
          <rect x="6" y="50" width="52" height="4" rx="2" fill="#B37A4C" />
        </g>
      )
    case 'chakki':
      return (
        <g>
          <path d="M38 24 q10 -4 16 4 l-2 26 h-14 z" fill="#E4C98E" />
          <path d="M38 24 q8 4 16 4" fill="none" stroke="#C9A36B" strokeWidth="2" />
          <circle cx="44" cy="20" r="1.8" fill="#C9A36B" />
          <circle cx="49" cy="19" r="1.8" fill="#C9A36B" />
          <rect x="8" y="40" width="30" height="14" rx="3" fill="#8A8F99" />
          <rect x="10" y="30" width="26" height="10" rx="3" fill="#A6ABB5" />
          <ellipse cx="23" cy="30" rx="13" ry="4" fill="#C7CBD2" />
          <rect x="21" y="16" width="4" height="14" rx="2" fill="#6B4A3A" />
          <path d="M8 46 h-2 v6 h6" fill="#fff" />
          <path d="M4 50 q2 4 8 4" fill="#fff" opacity=".9" />
        </g>
      )
    case 'poultry':
      return (
        <g>
          <ellipse cx="32" cy="54" rx="18" ry="3" fill="#000" opacity=".08" />
          <path d="M14 32 q0 20 20 20 q16 0 18 -16 q-8 4 -14 -2 q-8 -8 -24 -2 z" fill="#FFF8EA" />
          <path d="M14 32 q-4 -10 4 -14 q4 6 2 12" fill="#E0662B" />
          <circle cx="44" cy="24" r="9" fill="#FFF8EA" />
          <path d="M40 15 q2 -5 4 0 q2 -5 4 0 q2 -4 3 2" fill="#C0392B" />
          <path d="M52 24 l6 2 -6 2 z" fill="#F4B63A" />
          <path d="M48 30 q2 5 -1 6 q-2 -2 1 -6" fill="#C0392B" />
          <circle cx="46" cy="23" r="1.6" fill="#211F1B" />
          <path d="M24 38 q8 6 16 0" fill="none" stroke="#E9DCC8" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M28 52 v4 M36 52 v4" stroke="#F4B63A" strokeWidth="2.4" strokeLinecap="round" />
          <ellipse cx="12" cy="52" rx="4" ry="5" fill="#fff" />
        </g>
      )
    case 'nursery':
      return (
        <g>
          <path d="M18 38 h28 l-4 16 h-20 z" fill="#C8553D" />
          <rect x="16" y="35" width="32" height="6" rx="2" fill="#A8432F" />
          <path d="M32 36 v-16" stroke="#1F6B33" strokeWidth="3" strokeLinecap="round" />
          <path d="M32 26 c-10 0 -14 -6 -14 -12 c8 0 14 4 14 12 z" fill="#2F8F46" />
          <path d="M32 22 c8 0 14 -6 14 -14 c-10 0 -14 6 -14 14 z" fill="#4CAF50" />
          <path d="M32 30 c6 0 10 -3 11 -7 c-6 0 -10 2 -11 7 z" fill="#2F8F46" />
          <circle cx="10" cy="50" r="4" fill="#4CAF50" />
          <rect x="9" y="50" width="2" height="4" fill="#1F6B33" />
          <circle cx="54" cy="48" r="5" fill="#2F8F46" />
          <rect x="53" y="50" width="2" height="4" fill="#1F6B33" />
        </g>
      )
    default:
      return <circle cx="32" cy="32" r="14" fill="#2E3A8C" />
  }
}

/** Illustrated tile for a business type. */
export function ActivityArt({ code, className, tile = true }: { code: string; className?: string; tile?: boolean }) {
  return (
    <span className={clsx('inline-grid shrink-0 place-items-center overflow-hidden', tile && 'rounded-2xl', className)} style={tile ? { background: ACT_BG[code] ?? '#EEF' } : undefined} aria-hidden>
      <svg viewBox="0 0 64 64" className="size-[82%]">
        <ActSvg code={code} />
      </svg>
    </span>
  )
}

/* ---------------- Faces for the "how much do you like it" scale ---------------- */
