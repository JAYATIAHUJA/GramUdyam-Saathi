import type { DidiMood } from '../../components/art'
import type { Plan } from '../../engine/plan'

export const DIDI_SAYS: Record<Plan['verdict'], { mood: DidiMood; en: string; hi: string }> = {
  go: { mood: 'happy', en: 'Good news! This plan looks safe.', hi: 'अच्छी ख़बर! यह योजना सुरक्षित लगती है।' },
  caution: { mood: 'think', en: 'This can work, but go carefully.', hi: 'यह हो सकता है, पर सोच-समझकर।' },
  rethink: { mood: 'worry', en: 'The instalment may be hard to repay. See safer options.', hi: 'किस्त चुकाना मुश्किल हो सकता है। सुरक्षित विकल्प देखें।' },
}
