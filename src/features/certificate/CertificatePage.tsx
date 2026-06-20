import { useEffect, useState } from 'react'
import type { SavedCertificate } from '../../shared/services/certificateStorage'
import { getSavedCertificateById } from '../../shared/services/certificateStorage'
import { retrieveEvidenceFromFilecoin } from '../../shared/services/filecoinStorage'

type CertificatePageProps = {
  certificateId: string
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp)

  if (Number.isNaN(date.getTime())) {
    return timestamp
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date)
}

export function CertificatePage({ certificateId }: CertificatePageProps) {
  const [certificate, setCertificate] = useState<SavedCertificate>()
  const [hasLoaded, setHasLoaded] = useState(false)
  const [isRetrieving, setIsRetrieving] = useState(false)

  useEffect(() => {
    setCertificate(getSavedCertificateById(certificateId))
    setHasLoaded(true)
  }, [certificateId])

  async function handleRetrieveEvidence() {
    if (!certificate) {
      return
    }

    setIsRetrieving(true)

    try {
      await retrieveEvidenceFromFilecoin(certificate.filecoinCid)
    } catch (error) {
      console.error('Opened gateway fallback after evidence fetch failed:', error)
    } finally {
      setIsRetrieving(false)
    }
  }

  if (!hasLoaded) {
    return (
      <main className="flex flex-1 items-center justify-center py-20">
        <p className="text-sm uppercase tracking-[0.3em] text-candle">
          Summoning record
        </p>
      </main>
    )
  }

  if (!certificate) {
    return (
      <main className="flex flex-1 items-center justify-center py-20">
        <section className="w-full max-w-2xl border border-stone bg-grave/70 p-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-candle">
            Certificate not found
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-bone">
            No record rests under this ID.
          </h1>
          <p className="mt-4 text-base leading-7 text-ash">
            This MVP stores certificates in your browser localStorage, so the
            record must be opened from the same browser that created it.
          </p>
          <a
            href="/#preserve"
            className="mt-8 inline-flex border border-candle px-5 py-3 text-sm font-semibold text-candle transition-colors hover:bg-candle hover:text-undertaker-black"
          >
            Preserve a Link
          </a>
        </section>
      </main>
    )
  }

  return (
    <main className="flex flex-1 justify-center px-4 pb-16 pt-10 sm:px-0 sm:pt-16">
      <article className="w-full max-w-4xl certificate-engraved bg-[#13110F] shadow-2xl relative p-3 sm:p-5">
        <div className="certificate-seal h-full w-full bg-grave/40">
          <header className="border-b border-stone/60 px-6 py-12 text-center sm:px-12">
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center border border-candle/30 rounded-full">
              <span className="text-candle/80 font-serif italic text-lg">X</span>
            </div>
            <p className="text-xs uppercase tracking-[0.4em] text-candle">
              404 Undertaker
            </p>
            <h1 className="mt-6 text-4xl font-serif font-medium tracking-wide text-bone sm:text-6xl">
              Death Certificate
            </h1>
            <p className="mt-5 text-sm uppercase tracking-[0.3em] text-ash/80">
              For a departed web link
            </p>
          </header>

          <section className="grid gap-0 sm:grid-cols-[1fr_1.5fr]">
          <div className="border-b border-stone p-6 sm:border-b-0 sm:border-r sm:p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-candle">
              Certificate ID
            </p>
            <p className="mt-4 break-all font-mono text-sm leading-6 text-ash">
              {certificate.id}
            </p>
          </div>

          <dl className="divide-y divide-stone/60">
            <div className="grid gap-2 p-6 sm:grid-cols-[11rem_1fr] sm:p-8 hover:bg-white/[0.01] transition-colors">
              <dt className="text-sm font-medium uppercase tracking-wider text-ash/70">Original URL</dt>
              <dd className="break-words font-mono text-sm leading-6 text-bone">
                <a href={certificate.originalUrl} target="_blank" rel="noopener noreferrer" className="hover:text-candle transition-colors underline decoration-stone underline-offset-4">
                  {certificate.originalUrl}
                </a>
              </dd>
            </div>

            <div className="grid gap-2 p-6 sm:grid-cols-[11rem_1fr] sm:p-8 hover:bg-white/[0.01] transition-colors">
              <dt className="text-sm font-medium uppercase tracking-wider text-ash/70">Title</dt>
              <dd className="text-lg font-serif text-bone">
                {certificate.title || 'Untitled record'}
              </dd>
            </div>

            <div className="grid gap-2 p-6 sm:grid-cols-[11rem_1fr] sm:p-8 hover:bg-white/[0.01] transition-colors">
              <dt className="text-sm font-medium uppercase tracking-wider text-ash/70">
                Preservation Note
              </dt>
              <dd className="whitespace-pre-wrap text-base leading-relaxed text-ash/90 italic border-l-2 border-stone pl-4">
                {certificate.note || 'No note entered.'}
              </dd>
            </div>

            <div className="grid gap-2 p-6 sm:grid-cols-[11rem_1fr] sm:p-8 hover:bg-white/[0.01] transition-colors">
              <dt className="text-sm font-medium uppercase tracking-wider text-ash/70">Timestamp</dt>
              <dd className="text-sm tracking-wide text-bone">
                {formatTimestamp(certificate.timestamp)}
              </dd>
            </div>

            <div className="grid gap-2 p-6 sm:grid-cols-[11rem_1fr] sm:p-8 hover:bg-white/[0.01] transition-colors">
              <dt className="text-sm font-medium uppercase tracking-wider text-ash/70">Filecoin CID</dt>
              <dd className="break-all font-mono text-sm leading-6 text-candle/80 bg-candle/5 px-2 py-1 inline-block border border-candle/10">
                {certificate.filecoinCid}
              </dd>
            </div>
          </dl>
        </section>

        <footer className="flex flex-col gap-5 border-t border-stone/60 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10 bg-undertaker-black/20">
          <p className="max-w-xl text-sm leading-6 text-ash">
            Evidence is retrieved by CID from the Filecoin-backed IPFS gateway
            and opened in a new tab.
          </p>
          <button
            type="button"
            onClick={handleRetrieveEvidence}
            disabled={isRetrieving}
            className="border border-candle bg-candle px-5 py-3 text-sm font-semibold text-undertaker-black transition-colors hover:bg-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-candle disabled:cursor-not-allowed disabled:border-stone disabled:bg-stone disabled:text-ash"
          >
            {isRetrieving ? 'Retrieving Evidence...' : 'Retrieve Evidence'}
          </button>
        </footer>
        </div>
      </article>
    </main>
  )
}
