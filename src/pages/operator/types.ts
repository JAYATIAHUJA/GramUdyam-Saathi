import type { PlanInput } from '../../engine/plan'

export type SetInput = (p: Partial<PlanInput>) => void

export type SetFit = (p: Partial<PlanInput['fit']>) => void

/** Answers the helper must actually collect before a result means anything. Size and early interest have honest defaults. */
export type FieldKey = 'name' | 'lgd' | 'category' | 'familyIncome' | 'activity' | 'margin' | 'experience' | 'familyLabour' | 'hours' | 'training' | 'interest'

export const REQUIRED: { key: FieldKey; en: string; hi: string }[] = [
  { key: 'name', en: 'Full name', hi: 'पूरा नाम' },
  { key: 'lgd', en: 'Village', hi: 'गाँव' },
  { key: 'category', en: 'Social group', hi: 'वर्ग' },
  { key: 'familyIncome', en: 'Family income', hi: 'परिवार की आय' },
  { key: 'activity', en: 'Business', hi: 'काम' },
  { key: 'margin', en: 'Own savings', hi: 'अपनी बचत' },
  { key: 'experience', en: 'Experience', hi: 'अनुभव' },
  { key: 'familyLabour', en: 'Family help', hi: 'घर से मदद' },
  { key: 'hours', en: 'Hours a day', hi: 'रोज़ घंटे' },
  { key: 'training', en: 'Training', hi: 'प्रशिक्षण' },
  { key: 'interest', en: 'Interest in this work', hi: 'काम में रुचि' },
]

export const ALL_FILLED = new Set<FieldKey>(REQUIRED.map((r) => r.key))
