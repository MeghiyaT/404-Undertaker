import { useEffect, useState } from 'react'
import type { SavedCertificate } from '../../shared/services/certificateStorage'
import { getSavedCertificateById } from '../../shared/services/certificateStorage'
import { retrieveEvidenceFromFilecoin } from '../../shared/services/filecoinStorage'

type CertificatePageProps = {
  certificateId: string
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return timestamp
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
    if (!certificate) return
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
      <main className="flex min-h-screen items-center justify-center bg-undertaker-black">
        <p className="text-xs uppercase tracking-[0.3em] text-candle">Summoning record...</p>
      </main>
    )
  }

  if (!certificate) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-undertaker-black px-6">
        <section className="w-full max-w-2xl border border-stone bg-grave p-10 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#8B2020]">
            Record not found
          </p>
          <h1 className="mt-5 text-3xl font-semibold text-bone">
            This certificate does not exist in this browser.
          </h1>
          <p className="mt-6 leading-relaxed text-ash">
            This MVP stores certificates in your local storage. You must open
            this link from the same browser that created it.
          </p>
          <a
            href="/#preserve"
            className="mt-8 inline-block bg-candle px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-undertaker-black transition-all hover:brightness-110"
          >
            Return to Surface
          </a>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-undertaker-black px-6 pb-32">
      {/* Return Nav inside the page since the old one isn't sticky here if rendered standalone, but wait App renders Nav */}
      <div className="mx-auto mt-16 max-w-4xl border border-stone bg-grave p-2 lg:p-4">
        {/* Double rule border wrapper */}
        <div 
          className="relative h-full border border-stone p-8 lg:p-12"
          style={{ boxShadow: "inset 0 0 0 1px rgba(45,41,37,0.55)" }}
        >
          {/* Header */}
          <div className="relative border-b border-stone pb-12 text-center">
            {/* Top decorative lines */}
            <div className="absolute left-1/2 top-0 h-8 w-px -translate-x-1/2 bg-stone" />
            <div className="absolute left-0 top-8 h-px w-full bg-stone" />
            
            <div className="relative mx-auto mt-12 flex size-12 items-center justify-center border border-candle bg-[#0F0D0B]">
              <span className="font-mono text-[10px] font-semibold tracking-tighter text-candle">404</span>
            </div>
            
            <h1 className="mt-8 text-4xl font-semibold tracking-tight text-bone md:text-5xl">
              Death Certificate
            </h1>
            <p className="mt-4 text-xs font-medium uppercase tracking-[0.3em] text-[#6B6560]">
              Record of a Departed Web Page
            </p>
          </div>

          {/* Content Body */}
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr]">
            {/* Left Column (Seal & Status) */}
            <div className="border-b border-stone lg:border-b-0 lg:border-r">
              <div className="flex flex-col items-center border-b border-stone py-12">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="60" cy="60" r="59" stroke="#2D2925" strokeWidth="2"/>
                  <circle cx="60" cy="60" r="54" stroke="#2D2925" strokeDasharray="4 4"/>
                  <circle cx="60" cy="60" r="44" stroke="#D8B96D" strokeWidth="1"/>
                  <circle cx="60" cy="60" r="30" fill="#090807" stroke="#D8B96D" strokeWidth="2"/>
                  <path d="M60 10V20M60 100V110M10 60H20M100 60H110" stroke="#2D2925" strokeWidth="2"/>
                  <text x="60" y="56" fill="#D8B96D" fontSize="14" fontFamily="monospace" fontWeight="bold" textAnchor="middle">404</text>
                  <text x="60" y="74" fill="#D8B96D" fontSize="8" letterSpacing="0.2em" fontFamily="sans-serif" textAnchor="middle">VERIFIED</text>
                </svg>
              </div>
              <div className="p-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6560]">Status</p>
                <p className="mt-2 font-mono text-sm text-bone">Permanently Archived</p>
              </div>
              <div className="border-t border-stone p-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6560]">Evidence</p>
                <p className="mt-2 font-mono text-xs text-ash">IPFS Distributed</p>
                <button
                  type="button"
                  onClick={handleRetrieveEvidence}
                  disabled={isRetrieving}
                  className="mt-6 block w-full border border-candle py-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-candle transition-colors hover:bg-candle hover:text-undertaker-black disabled:opacity-50"
                >
                  {isRetrieving ? 'Retrieving...' : 'Retrieve'}
                </button>
              </div>
            </div>

            {/* Right Column (Details) */}
            <div className="divide-y divide-stone">
              <div className="p-6 lg:p-8">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6560]">Certificate ID</p>
                <p className="mt-2 font-mono text-sm text-bone">{certificate.id}</p>
              </div>
              
              <div className="p-6 lg:p-8">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6560]">Original URL</p>
                <a 
                  href={certificate.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block break-all font-mono text-sm text-candle transition-colors hover:text-bone"
                >
                  {certificate.originalUrl}
                </a>
              </div>

              <div className="p-6 lg:p-8">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6560]">Page Title</p>
                <p className="mt-2 text-lg font-medium text-bone">{certificate.title || 'Untitled record'}</p>
              </div>

              <div className="p-6 lg:p-8">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6560]">Preservation Note</p>
                <p className="mt-3 leading-relaxed text-ash">{certificate.note || 'No note entered.'}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-stone">
                <div className="p-6 lg:p-8">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6560]">Time of Death (Recorded)</p>
                  <p className="mt-2 font-mono text-xs text-bone">{formatTimestamp(certificate.timestamp)}</p>
                </div>
                <div className="p-6 lg:p-8">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6560]">Filecoin CID</p>
                  <p className="mt-2 break-all font-mono text-xs text-ash">{certificate.filecoinCid}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Rule */}
          <div className="mt-12 flex items-center justify-center gap-4 border-t border-stone pt-12">
            <div className="h-px w-12 bg-stone"></div>
            <span className="font-mono text-[10px] tracking-[0.3em] text-[#6B6560]">PERMANENT RECORD</span>
            <div className="h-px w-12 bg-stone"></div>
          </div>
        </div>
      </div>
    </main>
  )
}
