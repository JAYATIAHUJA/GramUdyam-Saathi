import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { Monitor, Smartphone, WifiOff } from 'lucide-react'
import Landing from './pages/landing/Landing'
import Saathi from './pages/saathi/Saathi'
import PlanPage from './pages/plan/PlanPage'
import { Didi } from './components/art'
import { useT } from './lib/store'
import { useWide } from './lib/useWide'

const Officer = lazy(() => import('./pages/officer/Officer'))
const Operator = lazy(() => import('./pages/operator/Operator'))
const Engine = lazy(() => import('./pages/Engine'))
const Dpr = lazy(() => import('./pages/Dpr'))

function OfflineBanner() {
  const t = useT()
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  if (online) return null
  return (
    <div role="status" className="no-print sticky top-0 z-50 flex items-center justify-center gap-2 bg-ink px-4 py-2 text-sm font-semibold text-white">
      <WifiOff className="size-4" />
      {t('No network. Your answers are saved on this phone, keep going.', 'नेटवर्क नहीं है। आपके जवाब इसी फ़ोन में सुरक्षित हैं, जारी रखें।')}
    </div>
  )
}

/** Helper, officer and engine screens are built for a computer. On a phone, point people to their own plan instead. */
function DesktopOnly({ children }: { children: ReactNode }) {
  const t = useT()
  if (useWide()) return <>{children}</>
  return (
    <main id="main" className="grid min-h-dvh place-items-center bg-paper px-6 text-center">
      <div className="flex max-w-[320px] flex-col items-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-indigo-soft text-indigo">
          <Monitor className="size-7" aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-[22px] leading-tight font-bold text-indigo-deep">{t('Open this on a computer', 'इसे कंप्यूटर पर खोलें')}</h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-ink/70">{t('This screen is for helpers and officers, and needs a laptop or desktop.', 'यह स्क्रीन सहायक और अधिकारियों के लिए है। इसके लिए लैपटॉप या कंप्यूटर चाहिए।')}</p>
        <Link to="/saathi" className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-marigold px-4 text-[16px] font-bold text-indigo-deep shadow-[0_5px_0_#b98200]">
          <Smartphone className="size-5" aria-hidden /> {t('Make my plan', 'अपनी योजना बनाएँ')}
        </Link>
        <Link to="/" className="mt-3 text-[14px] font-semibold text-indigo hover:underline">
          {t('Go to home', 'होम पर जाएँ')}
        </Link>
      </div>
    </main>
  )
}

function Loading() {
  const t = useT()
  return (
    <div className="grid h-dvh place-items-center bg-paper" role="status">
      <div className="flex flex-col items-center gap-3">
        <Didi mood="think" className="w-28" />
        <p className="font-display text-[18px] font-bold text-indigo-deep">{t('Getting things ready…', 'तैयारी हो रही है…')}</p>
      </div>
    </div>
  )
}

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <>
      <OfflineBanner />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/saathi" element={<Saathi />} />
          <Route path="/plan/:id" element={<PlanPage />} />
          <Route path="/officer" element={<DesktopOnly><Officer /></DesktopOnly>} />
          <Route path="/officer/:id" element={<DesktopOnly><Officer /></DesktopOnly>} />
          <Route path="/operator" element={<DesktopOnly><Operator /></DesktopOnly>} />
          <Route path="/engine" element={<DesktopOnly><Engine /></DesktopOnly>} />
          <Route path="/dpr/:id" element={<Dpr />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </Suspense>
    </>
  )
}
