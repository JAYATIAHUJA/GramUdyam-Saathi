import { UserCheck } from 'lucide-react'
import { DISTRICT } from '../../data/villages'
import { useT } from '../../lib/store'

export function DeskHeader() {
  const t = useT()
  return (
    <div className="flex shrink-0 flex-wrap items-end justify-between gap-3 px-1">
      <div>
        <p className="text-[13px] font-semibold text-muted">{t(DISTRICT.sca.name, DISTRICT.sca.nameHi)}</p>
        <h1 className="font-display text-[26px] leading-tight font-bold text-indigo-deep">{t(`${DISTRICT.name} case desk`, `${DISTRICT.nameHi} केस डेस्क`)}</h1>
      </div>
      <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[13px] text-muted shadow-sm">
        <UserCheck className="size-4 text-go" />
        <span>
          <b className="text-ink">A. Srivastava</b>, {t('District Manager', 'ज़िला प्रबंधक')}
        </span>
      </div>
    </div>
  )
}
