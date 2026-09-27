import { useEffect, useState } from 'react'

const QUERY = '(min-width: 768px)'

/** True on tablets and computers. Helper and officer screens only render when this is true. */
export function useWide() {
  const [wide, setWide] = useState(() => typeof window === 'undefined' || window.matchMedia(QUERY).matches)
  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const on = () => setWide(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return wide
}
