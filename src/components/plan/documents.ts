import type { Plan } from '../../engine/plan'
import { lakh } from '../../lib/format'

/* ---------------- Next steps ---------------- */
export function docsFor(plan: Plan) {
  const cat = plan.input.category
  const base = [
    { en: cat === 'SAFAI' ? 'Safai Karamchari / dependant certificate' : `Caste certificate (${cat})`, hi: cat === 'SAFAI' ? 'सफ़ाई कर्मचारी / आश्रित प्रमाण पत्र' : `जाति प्रमाण पत्र (${cat})`, dl: true },
    { en: 'Family income certificate (under ₹3 lakh)', hi: 'आय प्रमाण पत्र (₹3 लाख से कम)', dl: true },
    { en: 'Aadhaar and residence proof', hi: 'आधार और निवास प्रमाण', dl: true },
    { en: 'Bank passbook (account in your name)', hi: 'बैंक पासबुक (आपके नाम का खाता)', dl: false },
    { en: 'Two passport photos', hi: 'दो पासपोर्ट फ़ोटो', dl: false },
    { en: 'Project report (DPR), made by Saathi', hi: 'प्रोजेक्ट रिपोर्ट (DPR), साथी ने बनाई', dl: false, done: true },
  ]
  const a = plan.feasibility.activity.code
  const q =
    a === 'dairy' ? { en: 'Cattle quotation + vet health certificate + insurance quote', hi: 'पशु कोटेशन + पशु चिकित्सक प्रमाण + बीमा कोटेशन' }
    : a === 'goat' ? { en: 'Goat purchase quotation + vet certificate', hi: 'बकरी ख़रीद कोटेशन + पशु चिकित्सक प्रमाण' }
    : a === 'tea' ? { en: 'Equipment quotation + FSSAI basic registration', hi: 'उपकरण कोटेशन + FSSAI पंजीकरण' }
    : { en: 'Quotations for machines / stock from a registered seller', hi: 'पंजीकृत विक्रेता से मशीन / माल के कोटेशन' }
  return [...base.slice(0, 3), { ...q, dl: false }, ...base.slice(3)]
}
