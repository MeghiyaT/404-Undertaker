import { useEffect, useState } from 'react'
import type { SavedCertificate } from '../../shared/services/certificateStorage'
import {
  getSavedCertificates,
  onSavedCertificatesUpdated,
} from '../../shared/services/certificateStorage'

export function ArchivePanel() {
  const [certificates, setCertificates] = useState<SavedCertificate[]>([])

  useEffect(() => {
    function loadCertificates() {
      setCertificates(getSavedCertificates())
    }

    loadCertificates()
    return onSavedCertificatesUpdated(loadCertificates)
  }, [])

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
      {certificates.length > 0 ? (
        <div className="grid max-w-[20rem] gap-4 sm:max-w-none sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate) => (
            <a
              key={certificate.id}
              href={`/certificate/${certificate.id}`}
              className="group flex min-h-44 flex-col justify-between border border-stone bg-grave/60 p-5 transition-colors hover:border-candle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-candle"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-candle">
                  Preserved
                </p>
                <h3 className="mt-4 line-clamp-2 text-xl font-semibold leading-tight text-bone">
                  {certificate.title || 'Untitled record'}
                </h3>
              </div>
              <p className="mt-6 line-clamp-2 break-words font-mono text-sm leading-6 text-ash transition-colors group-hover:text-bone">
                {certificate.originalUrl || 'No original URL recorded'}
              </p>
            </a>
          ))}
        </div>
      ) : (
        <div className="max-w-[20rem] border border-stone bg-grave/50 px-5 py-10 text-center sm:max-w-none">
          <p className="text-lg font-semibold text-bone">
            The graveyard is empty
          </p>
        </div>
      )}
    </section>
  )
}
