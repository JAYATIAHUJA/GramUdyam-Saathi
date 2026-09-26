import { SiteFooter, TopNav } from '../../components/site'
import { FinalCta } from './sections/FinalCta'
import { Hero } from './sections/Hero'
import { HowItWorks } from './sections/HowItWorks'
import { StoryExample } from './sections/StoryExample'
import { TradesMarquee } from './sections/TradesMarquee'
import { WhatYouGet } from './sections/WhatYouGet'
import { WhoIsItFor } from './sections/WhoIsItFor'
import { WorkBento } from './sections/WorkBento'

export default function Landing() {
  return (
    <div className="min-h-dvh overflow-x-clip bg-paper">
      <TopNav />
      <main id="main">
        <Hero />
        <TradesMarquee />
        <HowItWorks />
        <StoryExample />
        <WorkBento />
        <WhatYouGet />
        <WhoIsItFor />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  )
}
