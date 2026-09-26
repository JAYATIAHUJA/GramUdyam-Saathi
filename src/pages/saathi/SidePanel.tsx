import { Volume2 } from 'lucide-react'
import { Logo } from '../../components/ui'
import { useApp, useT } from '../../lib/store'

/** Laptop-only column beside the phone frame. */
export function SidePanel() {
  const t = useT()
  const { autoRead, setAutoRead } = useApp()
  return (
  <aside className="hidden flex-col justify-between p-8 md:flex">
    <Logo />
    <div className="max-w-xs text-[14.5px] text-ink/75">
      <p className="font-display text-[24px] font-bold leading-tight text-indigo-deep">{t('One question at a time. Speak or tap.', 'एक बार में एक सवाल। बोलिए या छुइए।')}</p>
      <label className="mt-5 flex cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-white px-3 py-2.5 font-semibold text-ink">
        <input type="checkbox" checked={autoRead} onChange={(e) => setAutoRead(e.target.checked)} className="size-4.5 accent-indigo" />
        <Volume2 className="size-4 text-indigo" />
        {t('Read every question aloud', 'हर सवाल बोलकर सुनाएँ')}
      </label>
    </div>
    <div />
  </aside>
  )
}
