import { clsx } from 'clsx'
import { Coins, PiggyBank, Wallet } from 'lucide-react'
import { useState } from 'react'
import { inr, lakh } from '../../../lib/format'
import { useT } from '../../../lib/store'

export function MarginStep({ value, pending, onConfirm, onReject }: { value: number | null; pending: number | null; onConfirm: (n: number) => void; onReject: () => void }) {
  const t = useT()
  const [other, setOther] = useState('')
  const [showOther, setShowOther] = useState(false)
  const chips = [10000, 25000, 50000, 100000, 200000]
  const words = (n: number) => (n >= 100000 ? t(`₹${n / 100000} lakh`, `₹${n / 100000} लाख`) : inr(n))
  if (pending) {
    return (
      <div className="card p-5 text-center">
        <p className="text-[15px] text-muted">{t('You said', 'आपने कहा')}</p>
        <p className="num my-2 text-[48px] font-extrabold text-indigo-deep">{inr(pending)}</p>
        <p className="text-[17px] font-semibold">{t('Is that right?', 'क्या यह सही है?')}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button onClick={onReject} className="rounded-xl border-2 border-line py-3 text-[17px] font-bold">{t('No', 'नहीं')}</button>
          <button onClick={() => onConfirm(pending)} className="rounded-xl bg-go py-3 text-[17px] font-bold text-white">{t('Yes, correct', 'हाँ, सही है')}</button>
        </div>
      </div>
    )
  }
  const n = Number(other.replace(/[^0-9]/g, ''))
  return (
    <div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {chips.map((c, i) => (
          <button
            key={c}
            onClick={() => onConfirm(c)}
            className={clsx('card flex items-center gap-3 px-3.5 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-indigo/50 hover:shadow-md', value === c && 'border-indigo bg-indigo-soft/40 ring-2 ring-indigo/30')}
          >
            <span className={clsx('grid size-10 shrink-0 place-items-center rounded-xl', i < 2 ? 'bg-marigold-soft text-[#7a5500]' : i < 4 ? 'bg-go-soft text-go' : 'bg-indigo-soft text-indigo')} aria-hidden>
              {i < 2 ? <Coins className="size-5" /> : i < 4 ? <Wallet className="size-5" /> : <PiggyBank className="size-5" />}
            </span>
            <span className="num text-[20px] font-bold">{words(c)}</span>
          </button>
        ))}
        <button onClick={() => setShowOther(true)} className={clsx('card flex items-center justify-center px-3 py-3 text-[16px] font-bold text-indigo hover:border-indigo/50', showOther && 'border-indigo')}>
          {t('Other amount', 'दूसरी रकम')}
        </button>
      </div>
      {showOther && (
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (n > 0) onConfirm(n)
          }}
        >
          <label className="flex flex-1 items-center gap-1 rounded-xl border-2 border-indigo bg-white px-3">
            <span className="text-[20px] font-bold text-muted">₹</span>
            <input autoFocus inputMode="numeric" value={other} onChange={(e) => setOther(e.target.value)} placeholder="30000" className="num w-full bg-transparent py-2.5 text-[20px] font-bold outline-none" aria-label={t('Amount in rupees', 'रुपये में रकम')} />
          </label>
          <button disabled={!(n > 0)} className="rounded-xl bg-indigo px-5 text-[17px] font-bold text-white disabled:opacity-40">{t('Next', 'आगे')}</button>
        </form>
      )}
    </div>
  )
}
