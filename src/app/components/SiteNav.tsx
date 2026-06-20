const links = [
  { label: 'Preserve', href: '/#preserve' },
  { label: 'Archive', href: '/#archive' },
]

export function SiteNav() {
  return (
    <header className="sticky top-0 z-20 min-w-0 border-b border-stone/80 bg-undertaker-black/85 py-4 backdrop-blur transition-colors duration-undertaker ease-undertaker">
      <div className="flex items-center justify-start gap-4 sm:justify-between">
        <a
          href="/"
          aria-label="404 Undertaker home"
          className="group flex min-w-0 items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-candle rounded-sm"
        >
          <span className="grid size-9 place-items-center border border-candle/30 bg-grave text-sm font-semibold text-candle transition-all duration-undertaker ease-undertaker group-hover:border-candle/80 group-hover:bg-candle/5">
            404
          </span>
          <span className="truncate text-base font-medium text-bone transition-opacity duration-undertaker ease-undertaker group-hover:opacity-80">
            Undertaker
          </span>
        </a>
        <nav aria-label="Primary navigation" className="shrink-0">
          <ul className="flex items-center gap-1 sm:gap-2">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="px-2 py-2 text-sm text-ash transition-colors duration-undertaker ease-undertaker hover:text-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-candle rounded-sm sm:px-3"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
