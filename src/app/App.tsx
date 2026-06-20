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
          <main className="flex flex-1 flex-col gap-16 py-16 sm:gap-24 sm:py-24">
            <section className="max-w-3xl">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-candle sm:text-sm">
                Memento mori for the web
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-bone sm:text-6xl">
                404 Undertaker
              </h1>
              <p className="mt-6 max-w-[20rem] text-base leading-relaxed text-ash sm:max-w-2xl sm:text-lg sm:leading-8">
                Preserve what fails. Archive what fades. Keep every vanished
                path marked with a quiet record.
              </p>
            </section>
            <PreservePanel />
            <ArchivePanel />
          </main>
        )}
      </div>
    </div>
  )
}
