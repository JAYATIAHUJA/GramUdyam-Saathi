import { GovBar } from './GovBar'
import { SiteHeader } from './SiteHeader'

/** Government strip + sticky site header. Used by every full-width page. */
export function TopNav({ dark = false }: { dark?: boolean }) {
  return (
    <>
      <GovBar />
      <SiteHeader dark={dark} />
    </>
  )
}
