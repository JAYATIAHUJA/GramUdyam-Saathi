import { lazy, Suspense, useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { WifiOff } from 'lucide-react'
import Landing from './pages/Landing'
import Saathi from './pages/Saathi'
import PlanPage from './pages/PlanPage'
import { useT } from './lib/store'

const Officer = lazy(() => import('./pages/Officer'))
const Operator = lazy(() => import('./pages/Operator'))
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
      {t('No network. Your answers are saved on this phone — keep going.', 'नेटवर्क नहीं है। आपके जवाब इसी फ़ोन में सुरक्षित हैं — जारी रखें।')}
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
      <Suspense fallback={<div className="grid h-dvh place-items-center text-muted">…</div>}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/saathi" element={<Saathi />} />
          <Route path="/plan/:id" element={<PlanPage />} />
          <Route path="/officer" element={<Officer />} />
          <Route path="/officer/:id" element={<Officer />} />
          <Route path="/operator" element={<Operator />} />
          <Route path="/engine" element={<Engine />} />
          <Route path="/dpr/:id" element={<Dpr />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </Suspense>
    </>
  )
}
