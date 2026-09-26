import { useT } from '../../../lib/store'

export function NameStep({ name, onChange, onNext }: { name: string; onChange: (name: string) => void; onNext: () => void }) {
  const t = useT()
  return (
    <div>
      <input
        autoFocus
        value={name}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && name && onNext()}
        placeholder={t('e.g. Sunita Devi', 'जैसे सुनीता देवी')}
        className="w-full rounded-xl border-2 border-line bg-white px-4 py-4 font-display text-[24px] font-semibold outline-none focus:border-indigo"
      />
      <p className="mt-3 text-[13px] text-muted">{t('Only used on your report. Not shared with the AI.', 'सिर्फ़ आपकी रिपोर्ट पर। AI को नहीं भेजा जाता।')}</p>
    </div>
  
  )
}
