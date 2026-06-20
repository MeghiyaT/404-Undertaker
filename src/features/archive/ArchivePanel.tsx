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
    <section id="archive" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-12">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-candle">
          Archive
        </p>
        <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-bone md:text-4xl">
          A quiet register for pages that no longer answer.
        </h2>
      </div>

      {certificates.length === 0 ? (
        <div className="flex flex-col items-center gap-4 border border-stone bg-grave py-20">
          <div className="flex size-10 items-center justify-center border border-stone">
            <span className="font-mono text-sm text-[#6B6560]">ø</span>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#6B6560]">
            The graveyard is empty.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-px border border-stone bg-stone md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert, index) => (
            <a
              key={cert.id}
              href={`/certificate/${cert.id}`}
              className="group flex h-full min-h-44 flex-col justify-between border-t border-transparent bg-[#0F0D0B] p-6 outline-none transition-all duration-150 animate-fade-in-up hover:border-candle hover:bg-grave focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-candle"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-candle">
                    Preserved
                  </span>
                  <span className="font-mono text-[10px] text-[#6B6560]">
                    {cert.id}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-medium leading-snug text-bone">
                    {cert.title || 'Untitled record'}
                  </p>
                  {cert.note && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#6B6560]">
                      {cert.note}
                    </p>
                  )}
                </div>
              </div>

              <p className="mt-6 truncate font-mono text-[10px] leading-relaxed text-[#6B6560]">
                {cert.originalUrl || 'No original URL recorded'}
              </p>
            </a>
          ))}
        </div>
      )}
    </section>
  )
}
