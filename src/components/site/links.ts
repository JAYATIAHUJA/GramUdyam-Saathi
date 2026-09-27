import { Building2, Calculator, Smartphone, UsersRound } from 'lucide-react'

/** `desktop` links are for helpers and officers at a computer; phones only get the applicant's flow. */
export const LINKS = [
  { to: '/saathi', icon: Smartphone, en: 'Make my plan', hi: 'अपनी योजना बनाएँ', desktop: false },
  { to: '/operator', icon: UsersRound, en: 'For helpers (VLE)', hi: 'सहायक (VLE) के लिए', desktop: true },
  { to: '/officer', icon: Building2, en: 'For officers (SCA)', hi: 'अधिकारी (SCA) के लिए', desktop: true },
  { to: '/engine', icon: Calculator, en: 'How we calculate', hi: 'हिसाब कैसे होता है', desktop: true },
]
