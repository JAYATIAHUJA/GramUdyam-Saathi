import type { CaseStatus } from '../../lib/store'

export const STATUS: Record<CaseStatus, { en: string; hi: string; cls: string }> = {
  draft: { en: 'New', hi: 'नया', cls: 'bg-indigo-soft text-indigo' },
  ready: { en: 'Ready for PM-SURAJ', hi: 'PM-SURAJ के लिए तैयार', cls: 'bg-go-soft text-go' },
  revision: { en: 'Needs revision', hi: 'सुधार चाहिए', cls: 'bg-caution-soft text-caution' },
}
