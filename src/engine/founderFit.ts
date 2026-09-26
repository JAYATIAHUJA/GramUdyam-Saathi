// Founder-Fit: transparent weighted score. Weights follow the MoSJE NSFDC
// evaluation, 61.5% cited lack of expertise/interest, 69.9% had no prior skill.

export interface FitAnswers {
  experience: 0 | 1 | 2 // none, <2 yrs, 2+ yrs in this activity
  familyLabour: 0 | 1 | 2 // extra family members who can help: 0, 1, 2+
  hours: 0 | 1 | 2 // <4, 4–8, 8+ hours a day
  training: 0 | 1 // done training?
  interest: 1 | 2 | 3 | 4 | 5
}

export const DEFAULT_FIT: FitAnswers = { experience: 1, familyLabour: 1, hours: 1, training: 0, interest: 4 }

export const FIT_WEIGHTS = { experience: 30, interest: 20, familyLabour: 15, hours: 15, training: 10, inputs: 10 }

export interface FitResult {
  score: number
  parts: { key: keyof typeof FIT_WEIGHTS; got: number; max: number; en: string; hi: string }[]
  band: 'strong' | 'ok' | 'weak'
  familyLabourPersons: number
}

export function founderFit(a: FitAnswers, mandiKm: number): FitResult {
  const W = FIT_WEIGHTS
  const exp = [0, 0.6, 1][a.experience] * W.experience
  const int = ((a.interest - 1) / 4) * W.interest
  const fam = [0.2, 0.7, 1][a.familyLabour] * W.familyLabour
  const hrs = [0.2, 0.7, 1][a.hours] * W.hours
  const trn = a.training * W.training
  const inp = (mandiKm <= 10 ? 1 : mandiKm <= 15 ? 0.7 : 0.4) * W.inputs
  const parts: FitResult['parts'] = [
    { key: 'experience', got: exp, max: W.experience, en: ['No experience in this work', 'Some experience', 'Experienced in this work'][a.experience], hi: ['इस काम का अनुभव नहीं', 'थोड़ा अनुभव', 'इस काम का अच्छा अनुभव'][a.experience] },
    { key: 'interest', got: int, max: W.interest, en: `Interest ${a.interest} of 5`, hi: `रुचि 5 में से ${a.interest}` },
    { key: 'familyLabour', got: fam, max: W.familyLabour, en: ['Working alone', '1 family member helps', '2+ family members help'][a.familyLabour], hi: ['अकेले काम', '1 परिवार सदस्य मदद करेगा', '2+ परिवार सदस्य मदद करेंगे'][a.familyLabour] },
    { key: 'hours', got: hrs, max: W.hours, en: ['Under 4 hours a day', '4–8 hours a day', 'Full day'][a.hours], hi: ['रोज़ 4 घंटे से कम', 'रोज़ 4–8 घंटे', 'पूरा दिन'][a.hours] },
    { key: 'training', got: trn, max: W.training, en: a.training ? 'Training done' : 'No training yet', hi: a.training ? 'प्रशिक्षण लिया है' : 'अभी प्रशिक्षण नहीं' },
    { key: 'inputs', got: inp, max: W.inputs, en: `Mandi / inputs ${mandiKm} km away`, hi: `मंडी / कच्चा माल ${mandiKm} किमी दूर` },
  ]
  const score = Math.round(exp + int + fam + hrs + trn + inp)
  return { score, parts, band: score >= 65 ? 'strong' : score >= 50 ? 'ok' : 'weak', familyLabourPersons: 1 + a.familyLabour }
}
