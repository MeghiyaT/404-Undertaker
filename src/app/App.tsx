import { SiteNav } from './components/SiteNav'
import { ArchivePanel } from '../features/archive/ArchivePanel'
import { CertificatePage } from '../features/certificate/CertificatePage'
import { PreservePanel } from '../features/preserve/PreservePanel'

function getCertificateIdFromPath() {
  const match = window.location.pathname.match(/^\/certificate\/([^/]+)$/)
  return match ? decodeURIComponent(match[1]) : undefined
}

export function App() {
  const certificateId = getCertificateIdFromPath()

  return (
    <div className="min-h-screen overflow-x-hidden bg-undertaker-black text-bone">
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(216,185,109,0.12),transparent_34rem),linear-gradient(180deg,rgba(244,239,229,0.04),transparent_22rem)]" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 sm:px-8">
        <SiteNav />
        {certificateId ? (
          <CertificatePage certificateId={certificateId} />
        ) : (
          <main className="min-h-screen bg-undertaker-black">
            <section className="mx-auto max-w-6xl px-6 py-28 md:py-40">
              <div className="max-w-2xl">
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-candle">
                  Memento mori for the web
                </p>
                <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight text-bone md:text-7xl">
                  404<br />Undertaker
                </h1>
                <p className="mt-8 max-w-lg text-lg leading-relaxed text-ash">
                  Preserve what fails. Archive what fades. Keep every vanished path marked with a quiet record.
                </p>
                <div className="mt-12 flex flex-col gap-4 sm:flex-row">
                  <a
                    href="#preserve"
                    className="bg-candle px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-undertaker-black transition-all duration-200 hover:brightness-110"
                  >
                    Preserve a Link
                  </a>
                  <a
                    href="#archive"
                    className="border border-stone px-6 py-3 text-center text-xs font-medium uppercase tracking-[0.2em] text-ash transition-colors duration-200 hover:border-candle hover:text-bone"
                  >
                    Browse Archive
                  </a>
                </div>
              </div>

              {/* Decorative rule */}
              <div className="mt-20 flex items-center gap-4">
                <div className="h-px flex-1 bg-stone" />
                <span className="font-mono text-[10px] tracking-[0.3em] text-[#6B6560]">
                  EST. MMXXIV
                </span>
                <div className="h-px w-8 bg-candle" />
              </div>
            </section>

            <div className="w-full border-t border-stone" />
            <PreservePanel />
            <div className="w-full border-t border-stone" />
            <ArchivePanel />

            {/* Footer */}
            <footer className="mt-32 border-t border-stone">
              <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-8 sm:flex-row sm:items-center">
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-candle">
                  404 Undertaker
                </p>
                <p className="text-xs text-[#6B6560]">
                  Preserving what the web chooses to forget.
                </p>
              </div>
            </footer>
          </main>
        )}
      </div>
    </div>
  )
}
