const FACE_COLORS = ['#E5553F', '#EE8A3C', '#F2B93B', '#8CC152', '#2F9E55']

export function Face({ v, className }: { v: 1 | 2 | 3 | 4 | 5; className?: string }) {
  const c = FACE_COLORS[v - 1]
  const mouth = ['M22 44 q10 -9 20 0', 'M23 43 q9 -4 18 0', 'M23 42 h18', 'M22 40 q10 7 20 0', 'M20 38 q12 14 24 0 z'][v - 1]
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="32" cy="32" r="28" fill={c} />
      <circle cx="32" cy="32" r="28" fill="#fff" opacity=".12" />
      {v === 5 ? (
        <g fill="none" stroke="#211F1B" strokeWidth="3" strokeLinecap="round">
          <path d="M19 27 q4 -5 8 0" />
          <path d="M37 27 q4 -5 8 0" />
        </g>
      ) : (
        <g fill="#211F1B">
          <circle cx="23" cy="27" r="3.4" />
          <circle cx="41" cy="27" r="3.4" />
        </g>
      )}
      {v === 1 && <path d="M16 21 L25 16 M48 21 L39 16" stroke="#211F1B" strokeWidth="2.4" strokeLinecap="round" />}
      <path d={mouth} fill={v === 5 ? '#7A2E1F' : 'none'} stroke="#211F1B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {v >= 4 && (
        <g fill="#fff" opacity=".35">
          <ellipse cx="16" cy="36" rx="4" ry="2.5" />
          <ellipse cx="48" cy="36" rx="4" ry="2.5" />
        </g>
      )}
    </svg>
  )
}

/* ---------------- Village scene (hero backdrop) ---------------- */
