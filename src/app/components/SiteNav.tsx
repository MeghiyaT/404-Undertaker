import { useState } from 'react'
import { navigate } from '../useRoute'

const links = [
  { label: 'Preserve', href: '/#preserve' },
  { label: 'Archive', href: '/#archive' },
]

export function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false)

  function handleNavClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    const url = new URL(href, window.location.href)

    // Same-page hash link → smooth scroll
    if (url.pathname === window.location.pathname && url.hash) {
      e.preventDefault()
      document.querySelector(url.hash)?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    // Internal navigation → client-side route
    if (url.origin === window.location.origin) {
      e.preventDefault()
      navigate(url.pathname + url.hash)
      // If there's a hash, scroll to it after routing
      if (url.hash) {
        requestAnimationFrame(() => {
          document
            .querySelector(url.hash)
            ?.scrollIntoView({ behavior: 'smooth' })
        })
      }
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-stone bg-undertaker-black">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        {/* Wordmark */}
        <a
          href="/"
          className="flex items-center gap-3 no-underline"
          onClick={(e) => handleNavClick(e, '/')}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-candle">
            <span className="font-mono text-[10px] font-semibold leading-none tracking-tighter text-candle">
              404
            </span>
          </div>
          <span className="text-sm font-semibold uppercase tracking-[0.15em] text-bone">
            Undertaker
          </span>
        </a>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-8 sm:flex">
          {links.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-xs uppercase tracking-[0.2em] text-ash transition-colors duration-200 hover:text-candle"
              onClick={(e) => handleNavClick(e, href)}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex flex-col gap-1.5 p-2 sm:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen
            ? [0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block h-px w-5 bg-candle"
                  style={{
                    transform:
                      i === 0
                        ? 'translateY(8px) rotate(45deg)'
                        : i === 2
                          ? 'translateY(-8px) rotate(-45deg)'
                          : 'scale(0)',
                    transition: 'transform 0.2s',
                  }}
                />
              ))
            : [0, 1, 2].map((i) => (
                <span key={i} className="block h-px w-5 bg-ash" />
              ))}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="flex flex-col gap-4 border-t border-stone px-6 py-4 sm:hidden">
          {links.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-left text-xs uppercase tracking-[0.2em] text-ash transition-colors duration-200 hover:text-candle"
              onClick={(e) => {
                handleNavClick(e, href)
                setMenuOpen(false)
              }}
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
