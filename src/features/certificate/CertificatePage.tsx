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
    <main className="flex flex-1 justify-center pb-16 pt-10 sm:pt-16">
      <article className="w-full max-w-4xl border border-stone bg-grave/80">
        <header className="border-b border-stone px-6 py-8 text-center sm:px-10">
          <p className="text-xs uppercase tracking-[0.35em] text-candle">
            404 Undertaker
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-bone sm:text-6xl">
            Death Certificate
          </h1>
          <p className="mt-3 text-sm uppercase tracking-[0.25em] text-ash">
            For a departed web link
          </p>
        </header>

        <section className="grid gap-0 sm:grid-cols-[0.8fr_1.2fr]">
          <div className="border-b border-stone p-6 sm:border-b-0 sm:border-r sm:p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-candle">
              Certificate ID
            </p>
            <p className="mt-4 break-all font-mono text-sm leading-6 text-ash">
              {certificate.id}
            </p>
          </div>

          <dl className="divide-y divide-stone">
            <div className="grid gap-3 p-6 sm:grid-cols-[10rem_1fr] sm:p-8">
              <dt className="text-sm font-medium text-ash">Original URL</dt>
              <dd className="break-words font-mono text-sm leading-6 text-bone">
                {certificate.originalUrl}
              </dd>
            </div>

            <div className="grid gap-3 p-6 sm:grid-cols-[10rem_1fr] sm:p-8">
              <dt className="text-sm font-medium text-ash">Title</dt>
              <dd className="text-base font-semibold text-bone">
                {certificate.title || 'Untitled record'}
              </dd>
            </div>

            <div className="grid gap-3 p-6 sm:grid-cols-[10rem_1fr] sm:p-8">
              <dt className="text-sm font-medium text-ash">
                Preservation Note
              </dt>
              <dd className="whitespace-pre-wrap text-base leading-7 text-bone">
                {certificate.note || 'No note entered.'}
              </dd>
            </div>

            <div className="grid gap-3 p-6 sm:grid-cols-[10rem_1fr] sm:p-8">
              <dt className="text-sm font-medium text-ash">Timestamp</dt>
              <dd className="text-base text-bone">
                {formatTimestamp(certificate.timestamp)}
              </dd>
            </div>

            <div className="grid gap-3 p-6 sm:grid-cols-[10rem_1fr] sm:p-8">
              <dt className="text-sm font-medium text-ash">Filecoin CID</dt>
              <dd className="break-all font-mono text-sm leading-6 text-candle">
                {certificate.filecoinCid}
              </dd>
            </div>
          </dl>
        </section>

        <footer className="flex flex-col gap-4 border-t border-stone px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
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
      </article>
    </main>
  )
}
