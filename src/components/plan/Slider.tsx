import { clsx } from 'clsx'

export function Slider({ label, v, set, min, max }: { label: string; v: number; set: (n: number) => void; min: number; max: number }) {
  return (
    <label className="block">
      <span className="flex justify-between text-[14px]">
        <span>{label}</span>
        <b className={clsx('num', v < 0 ? 'text-risk' : v > 0 ? 'text-go' : '')}>
          {v > 0 ? '+' : ''}
          {v}%
        </b>
      </span>
      <input type="range" min={min} max={max} value={v} onChange={(e) => set(+e.target.value)} className="mt-1 w-full accent-indigo" />
    </label>
  )
}
