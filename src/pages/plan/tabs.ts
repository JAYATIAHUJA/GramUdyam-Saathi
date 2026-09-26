import { Lightbulb, ListChecks, MapPinned, TriangleAlert, Wallet } from 'lucide-react'

export const TABS = [
  { k: 'market', en: 'Market', hi: 'बाज़ार', icon: MapPinned },
  { k: 'money', en: 'Money', hi: 'पैसा', icon: Wallet },
  { k: 'risks', en: 'Risks', hi: 'जोखिम', icon: TriangleAlert },
  { k: 'alts', en: 'Other ideas', hi: 'विकल्प', icon: Lightbulb },
  { k: 'next', en: 'Next steps', hi: 'आगे क्या', icon: ListChecks },
] as const

export type TabKey = (typeof TABS)[number]['k']
