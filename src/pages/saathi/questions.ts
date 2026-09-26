import { Award, Ban, Banknote, Brush, CircleDashed, Clock4, Coins, GraduationCap, House, IdCard, type LucideIcon, PiggyBank, Sprout, Sun, Sunrise, User, Users, Wallet } from 'lucide-react'
import type { SocialCategory } from '../../engine/rules'
import { lakh } from '../../lib/format'
import type { Draft } from '../../lib/store'
import Saathi from './Saathi'

export type Opt<T> = { v: T; icon: LucideIcon; en: string; hi: string; keys: string[] }

export const EXPERIENCE: Opt<0 | 1 | 2>[] = [
  { v: 0, icon: Ban, en: 'No, never', hi: 'नहीं, कभी नहीं', keys: ['nahi', 'no', 'नहीं', 'kabhi'] },
  { v: 1, icon: Sprout, en: 'A little (under 2 years)', hi: 'थोड़ा (2 साल से कम)', keys: ['thoda', 'little', 'थोड़ा', 'kuch'] },
  { v: 2, icon: Award, en: 'Yes, 2+ years', hi: 'हाँ, 2 साल से ज़्यादा', keys: ['haan', 'yes', 'हाँ', 'saal', 'years'] },
]

export const FAMILY: Opt<0 | 1 | 2>[] = [
  { v: 0, icon: User, en: 'Nobody, just me', hi: 'कोई नहीं, सिर्फ़ मैं', keys: ['koi nahi', 'nobody', 'कोई नहीं', 'akela', 'akeli'] },
  { v: 1, icon: Users, en: 'One family member', hi: 'परिवार का एक सदस्य', keys: ['ek', 'one', 'एक'] },
  { v: 2, icon: House, en: 'Two or more', hi: 'दो या ज़्यादा', keys: ['do', 'two', 'दो', 'teen', 'zyada'] },
]

export const HOURS: Opt<0 | 1 | 2>[] = [
  { v: 0, icon: Sunrise, en: 'Under 4 hours', hi: '4 घंटे से कम', keys: ['kam', 'less', 'कम', 'do ghante'] },
  { v: 1, icon: Clock4, en: '4 to 8 hours', hi: '4 से 8 घंटे', keys: ['chaar', 'aath', 'चार', 'आठ', '4', '8'] },
  { v: 2, icon: Sun, en: 'The whole day', hi: 'पूरा दिन', keys: ['pura', 'poora', 'whole', 'पूरा', 'din'] },
]

export const TRAINING: Opt<0 | 1>[] = [
  { v: 1, icon: GraduationCap, en: 'Yes, I have', hi: 'हाँ, लिया है', keys: ['haan', 'yes', 'हाँ', 'liya'] },
  { v: 0, icon: CircleDashed, en: 'Not yet', hi: 'अभी नहीं', keys: ['nahi', 'no', 'नहीं'] },
]

export const INTEREST: Opt<1 | 2 | 3 | 4 | 5>[] = [
  { v: 1, icon: Ban, en: 'Not at all', hi: 'बिल्कुल नहीं', keys: ['bilkul nahi'] },
  { v: 2, icon: Ban, en: 'A little', hi: 'थोड़ा', keys: ['thoda'] },
  { v: 3, icon: Ban, en: 'Okay', hi: 'ठीक है', keys: ['theek', 'okay', 'ठीक'] },
  { v: 4, icon: Ban, en: 'I like it', hi: 'पसंद है', keys: ['pasand', 'like', 'पसंद'] },
  { v: 5, icon: Ban, en: 'I love it', hi: 'बहुत पसंद', keys: ['bahut', 'love', 'बहुत'] },
]

export const CATEGORY: Opt<SocialCategory>[] = [
  { v: 'SC', icon: IdCard, en: 'Scheduled Caste (SC)', hi: 'अनुसूचित जाति (SC)', keys: ['sc', 'anusuchit', 'अनुसूचित', 'scheduled'] },
  { v: 'OBC', icon: IdCard, en: 'Other Backward Class (OBC)', hi: 'अन्य पिछड़ा वर्ग (OBC)', keys: ['obc', 'pichda', 'पिछड़ा', 'backward'] },
  { v: 'SAFAI', icon: Brush, en: 'Safai Karamchari family', hi: 'सफ़ाई कर्मचारी परिवार', keys: ['safai', 'सफ़ाई', 'सफाई'] },
]

export const INCOME: Opt<number>[] = [
  { v: 80000, icon: Coins, en: 'Under ₹1 lakh a year', hi: 'सालाना ₹1 लाख से कम', keys: ['ek lakh se kam', 'kam', 'under'] },
  { v: 150000, icon: Wallet, en: '₹1–2 lakh a year', hi: 'सालाना ₹1–2 लाख', keys: ['do lakh', 'dedh'] },
  { v: 250000, icon: Banknote, en: '₹2–3 lakh a year', hi: 'सालाना ₹2–3 लाख', keys: ['teen lakh', 'dhai'] },
  { v: 350000, icon: PiggyBank, en: 'Above ₹3 lakh a year', hi: 'सालाना ₹3 लाख से ज़्यादा', keys: ['zyada', 'above', 'ज़्यादा'] },
]

export const LANGS = [
  { code: 'hi', label: 'हिंदी', sample: 'नमस्ते' },
  { code: 'en', label: 'English', sample: 'Hello' },
]

export const STAGES = [
  { en: 'Place', hi: 'जगह', steps: [1, 2] },
  { en: 'Money', hi: 'पैसा', steps: [3] },
  { en: 'Work', hi: 'काम', steps: [4, 5] },
  { en: 'You', hi: 'आप', steps: [6, 7, 8, 9, 10, 11, 12] },
  { en: 'Report', hi: 'रिपोर्ट', steps: [13] },
]

export const PROMPTS: Record<number, { en: string; hi: string; subEn?: string; subHi?: string; canNext?: (d: Draft) => boolean }> = {
  0: { en: '', hi: '' },
  1: { en: 'What is your name?', hi: 'आपका नाम क्या है?', canNext: (d) => !!d.name },
  2: { en: 'Which village do you live in?', hi: 'आप किस गाँव में रहते हैं?', subEn: 'Use your location, or say the name.', subHi: 'लोकेशन से ढूँढें, या नाम बोलें।', canNext: (d) => !!d.lgd },
  3: { en: 'How much money can you put in yourself?', hi: 'आप अपनी तरफ़ से कितना पैसा लगा सकते हैं?', subEn: 'Your own savings. Tap one.', subHi: 'आपकी अपनी बचत। एक चुनें।', canNext: (d) => !!d.margin },
  4: { en: 'What work do you want to start?', hi: 'आप कौन-सा काम शुरू करना चाहते हैं?', canNext: (d) => !!d.activity },
  5: { en: 'How big do you want to start?', hi: 'कितना बड़ा शुरू करना चाहते हैं?', subEn: 'Not sure? Let Saathi choose.', subHi: 'पक्का नहीं? साथी को चुनने दें।', canNext: () => true },
  6: { en: 'Have you done this work before?', hi: 'क्या आपने यह काम पहले किया है?' },
  7: { en: 'Who at home will help you?', hi: 'घर से कौन मदद करेगा?' },
  8: { en: 'How many hours a day can you give?', hi: 'रोज़ कितने घंटे दे पाएँगे?' },
  9: { en: 'Have you taken any training for it?', hi: 'क्या इसका कोई प्रशिक्षण लिया है?' },
  10: { en: 'How much do you like this work?', hi: 'यह काम आपको कितना पसंद है?' },
  11: { en: 'Which group does your family belong to?', hi: 'आपका परिवार किस वर्ग में आता है?', subEn: 'This tells us which government loan you get.', subHi: 'इससे पता चलता है कि कौन-सा सरकारी लोन मिलेगा।' },
  12: { en: 'What is your family’s yearly income?', hi: 'परिवार की सालाना आमदनी कितनी है?', subEn: 'Rough amount is fine.', subHi: 'अंदाज़े से बताएँ।' },
}

export function matchOpt<T>(text: string, opts: Opt<T>[]): Opt<T> | null {
  const t = text.toLowerCase()
  return opts.find((o) => o.keys.some((k) => t.includes(k.toLowerCase())) || t.includes(o.hi.toLowerCase()) || t.includes(o.en.toLowerCase())) ?? null
}
