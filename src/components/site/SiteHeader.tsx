import { clsx } from 'clsx'
import { NavLink } from 'react-router-dom'
import { LINKS } from './links'
import { LangToggle, Logo } from '../ui'
import { useT } from '../../lib/store'

export function SiteHeader({ dark = false }: { dark?: boolean }) {
  const t = useT()
  return (
    <header className={clsx('no-print sticky top-0 z-40', dark ? 'bg-indigo text-white' : 'border-b border-line bg-paper/92 backdrop-blur-md')}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5">
        <Logo light={dark} />
        <nav className="hidden items-center gap-1 text-[14.5px] font-semibold lg:flex" aria-label={t('Main', 'मुख्य')}>
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                clsx(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-2 transition-colors',
                  dark ? (isActive ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white') : isActive ? 'bg-indigo-soft text-indigo' : 'text-muted hover:bg-indigo-soft hover:text-indigo',
                )
              }
            >
              <l.icon className="size-4" aria-hidden />
              {t(l.en, l.hi)}
            </NavLink>
          ))}
        </nav>
        <LangToggle />
      </div>
      {/* Phones: the same links as a scrollable row, never hidden behind a menu. */}
      <nav className="flex gap-1.5 overflow-x-auto px-4 pb-2.5 [scrollbar-width:none] text-[13.5px] font-semibold lg:hidden" aria-label={t('Main', 'मुख्य')}>
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              clsx(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5',
                dark ? (isActive ? 'border-white bg-white/15' : 'border-white/25 text-white/85') : isActive ? 'border-indigo bg-indigo-soft text-indigo' : 'border-line bg-white text-ink/80',
              )
            }
          >
            <l.icon className="size-3.5" aria-hidden />
            {t(l.en, l.hi)}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
