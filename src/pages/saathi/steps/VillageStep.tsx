import { clsx } from 'clsx'
import { ChevronRight, LocateFixed, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { nearestVillages, searchVillages, type Village } from '../../../data/villages'
import { useT } from '../../../lib/store'

export function VillageStep({ q, setQ, onPick, selected }: { q: string; setQ: (s: string) => void; onPick: (lgd: string) => void; selected: string | null }) {
  const t = useT()
  const [gps, setGps] = useState<'idle' | 'finding' | 'found' | 'far' | 'error'>('idle')
  const [near, setNear] = useState<{ village: Village; km: number }[]>([])
  const searched = useMemo(() => (q ? searchVillages(q, 3).map((r) => ({ village: r.village, km: null as number | null })) : null), [q])
  const locate = () => {
    if (!('geolocation' in navigator)) {
      setGps('error')
      return
    }
    setGps('finding')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const n = nearestVillages(pos.coords.latitude, pos.coords.longitude, 3)
        setNear(n)
        setGps(n[0].km <= 25 ? 'found' : 'far')
      },
      () => setGps('error'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    )
  }
  const list: { village: Village; km: number | null }[] = searched ?? (gps === 'found' || gps === 'far' ? near : [])
  return (
    <div>
      {!q && gps !== 'found' && gps !== 'far' && (
        <button onClick={locate} disabled={gps === 'finding'} className="flex w-full items-center gap-3 rounded-2xl bg-indigo px-4 py-3.5 text-left text-white shadow-[0_4px_0_#1c2566] transition-transform active:translate-y-1 active:shadow-none disabled:opacity-80">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/15">
            <LocateFixed className={clsx('size-6', gps === 'finding' && 'animate-spin')} />
          </span>
          <span className="flex-1">
            <b className="block text-[18px] leading-tight">{gps === 'finding' ? t('Finding your village…', 'आपका गाँव ढूँढ रहे हैं…') : t('Find my village by location', 'मेरी लोकेशन से गाँव ढूँढें')}</b>
            <span className="text-[13.5px] text-white/75">{t('Easiest way. Tap “Allow” when the phone asks.', 'सबसे आसान। फ़ोन पूछे तो “Allow” दबाएँ।')}</span>
          </span>
        </button>
      )}

      {!q && gps === 'error' && <p className="mt-2 rounded-lg bg-caution-soft px-3 py-2 text-[14px] text-caution">{t('Could not get your location. Type your village name below.', 'लोकेशन नहीं मिली। नीचे गाँव का नाम लिखें।')}</p>}
      {!q && gps === 'far' && <p className="rounded-lg bg-caution-soft px-3 py-1.5 text-[14px] text-caution">{t('You are outside Barabanki. For the demo, pick a village.', 'आप बाराबंकी से बाहर हैं। डेमो के लिए कोई गाँव चुनें।')}</p>}

      {list.length > 0 && (
        <>
          <div className="mt-3 mb-1.5 flex items-center justify-between">
            <p className="text-[13.5px] font-semibold text-muted">{q ? t('Matching villages', 'मिलते-जुलते गाँव') : t('Villages near you', 'आपके पास के गाँव')}</p>
            {!q && (
              <button onClick={locate} className="inline-flex items-center gap-1 text-[13.5px] font-semibold text-indigo">
                <LocateFixed className="size-3.5" /> {t('Find again', 'दोबारा ढूँढें')}
              </button>
            )}
          </div>
          <div className="space-y-2">
            {list.map(({ village: v, km }, i) => (
              <button key={v.lgd} onClick={() => onPick(v.lgd)} className={clsx('card flex w-full items-center gap-3 px-3.5 py-2.5 text-left hover:border-indigo/50', selected === v.lgd && 'border-indigo ring-2 ring-indigo/30')}>
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-indigo-soft font-display text-[17px] font-bold text-indigo">{v.nameHi[0]}</span>
                <span className="flex-1">
                  <span className="block text-[17px] leading-tight font-semibold">{t(v.name, v.nameHi)}</span>
                  <span className="text-[13px] text-muted">{t(`${v.block} block`, `${v.blockHi} ब्लॉक`)}</span>
                </span>
                {km != null && <span className="text-[13px] font-semibold text-muted">{i === 0 && gps === 'found' ? t('Nearest', 'सबसे पास') : t(`${km.toFixed(0)} km`, `${km.toFixed(0)} किमी`)}</span>}
                <ChevronRight className="size-5 text-muted" />
              </button>
            ))}
          </div>
        </>
      )}

      <div className="mt-3 mb-2 flex items-center gap-3 text-[13px] font-semibold text-muted">
        <span className="h-px flex-1 bg-line" />
        {q ? t('Search by name', 'नाम से ढूँढें') : t('or type the village name', 'या गाँव का नाम लिखें')}
        <span className="h-px flex-1 bg-line" />
      </div>
      <label className="flex items-center gap-2 rounded-xl border-2 border-line bg-white px-3 py-2.5 focus-within:border-indigo">
        <Search className="size-5 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('e.g. Sirauli', 'जैसे: सिरौली')} className="flex-1 bg-transparent text-[18px] outline-none" />
        {q && (
          <button onClick={() => setQ('')} aria-label={t('Clear', 'मिटाएँ')}>
            <X className="size-4 text-muted" />
          </button>
        )}
      </label>
      {list.length === 0 && <p className="mt-2 text-[13px] text-muted">{t('Village not in the list? Ask your VLE or CSC for help.', 'गाँव नहीं मिला? अपने VLE या CSC से मदद लें।')}</p>}
    </div>
  )
}
