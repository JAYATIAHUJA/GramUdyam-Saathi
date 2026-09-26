import type { ReactNode } from 'react'
import { ActivityArt } from '../../components/art'
import { useT } from '../../lib/store'

/** Side shortcuts for demos: open a finished report in one click. */
export function DemoPersonas({ onPersona }: { onPersona: (i: number) => void }) {
  const t = useT()
  return (
    <aside className="hidden flex-col justify-end p-8 lg:flex" aria-label={t('Demo personas', 'डेमो व्यक्ति')}>
      <div className="card max-w-xs p-4 text-[13.5px]">
        <div className="font-display text-[16px] font-bold">{t('Try an example', 'उदाहरण देखें')}</div>
        <p className="text-muted">{t('Jump straight to a finished report.', 'सीधे तैयार रिपोर्ट देखें।')}</p>
        <div className="mt-3 flex flex-col gap-2">
          <PersonaBtn onClick={() => onPersona(0)} code="dairy">Sunita · {t('dairy, ₹1 L', 'डेयरी, ₹1 लाख')}</PersonaBtn>
          <PersonaBtn onClick={() => onPersona(1)} code="tailoring">Rekha · {t('tailoring, ₹10k', 'सिलाई, ₹10 हज़ार')}</PersonaBtn>
          <PersonaBtn onClick={() => onPersona(10)} code="kirana">Rajesh · {t('kirana, ₹14k', 'किराना, ₹14 हज़ार')}</PersonaBtn>
        </div>
      </div>
    </aside>
  )
}

function PersonaBtn({ children, onClick, code }: { children: ReactNode; onClick: () => void; code: string }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-2 text-left font-semibold hover:border-indigo/40">
      <ActivityArt code={code} className="size-8 rounded-lg" />
      {children}
    </button>
  )
}
