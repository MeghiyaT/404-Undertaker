const archivedRelics = [
  { path: '/old-offerings', state: 'Buried' },
  { path: '/lost-ledger', state: 'Cataloged' },
  { path: '/vanished-index', state: 'Sealed' },
]

export function ArchivePanel() {
  return (
    <section id="archive" className="pb-10">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-candle sm:text-sm">
            Archive
          </p>
          <h2 className="mt-4 max-w-[20rem] text-2xl font-semibold leading-tight text-bone sm:max-w-none sm:text-3xl">
            A quiet register for pages that no longer answer.
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-ash">
          Each entry keeps the missing path visible without disturbing the
          still-living parts of the site.
        </p>
      </div>
      <div className="max-w-[20rem] overflow-hidden border border-stone sm:max-w-none">
        {archivedRelics.map((relic) => (
          <div
            key={relic.path}
            className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-stone bg-grave/50 px-4 py-4 last:border-b-0"
          >
            <span className="min-w-0 break-words font-mono text-sm text-bone">
              {relic.path}
            </span>
            <span className="text-sm text-ash">{relic.state}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
