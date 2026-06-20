import type { FormEvent, DragEvent, ChangeEvent } from 'react'
import { useState, useRef, useEffect } from 'react'
import { navigate } from '../../app/useRoute'
import { saveMetadataBundle } from '../../shared/services/certificateStorage'
import { uploadEvidenceToFilecoin } from '../../shared/services/filecoinStorage'

const fieldStyles =
  'w-full px-3 py-2.5 text-sm border border-stone bg-transparent outline-none transition-colors duration-150 focus:border-candle placeholder-dust text-bone font-mono text-xs'

const labelStyles = 'block text-xs tracking-[0.15em] uppercase mb-2 text-dust'

type SubmissionStatus =
  | { kind: 'success'; message: string; certificateUrl: string }
  | { kind: 'error'; message: string }

/** Seconds to wait after a successful upload before allowing another. */
const COOLDOWN_SECONDS = 10

export function PreservePanel() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>()
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Tick the cooldown timer every second
  useEffect(() => {
    if (cooldownRemaining <= 0) return
    const timer = window.setTimeout(
      () => setCooldownRemaining((s) => s - 1),
      1000,
    )
    return () => clearTimeout(timer)
  }, [cooldownRemaining])

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragOver(true)
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragOver(false)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragOver(false)
    const file = event.dataTransfer.files?.[0]
    if (file) setSelectedFile(file)
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) setSelectedFile(file)
  }

  function clearFile() {
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleCreateDeathCertificate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmissionStatus(undefined)

    const formData = new FormData(event.currentTarget)
    const evidenceUpload = formData.get('evidenceUpload')
    const originalUrl = String(formData.get('originalUrl') ?? '').trim()
    const title = String(formData.get('title') ?? '').trim()
    const note = String(formData.get('preservationNote') ?? '').trim()

    const fileToUpload = selectedFile || evidenceUpload

    if (!(fileToUpload instanceof File) || fileToUpload.size === 0) {
      setSubmissionStatus({
        kind: 'error',
        message: 'Choose an evidence file before creating a certificate.',
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const upload = await uploadEvidenceToFilecoin(fileToUpload, setUploadProgress)
      const timestamp = new Date().toISOString()
      const metadataBundle = { originalUrl, title, note, timestamp, filecoinCid: upload.cid }
      const savedCertificate = saveMetadataBundle(metadataBundle)
      
      setSubmissionStatus({
        kind: 'success',
        message: 'Death certificate saved.',
        certificateUrl: `/certificate/${savedCertificate.id}`,
      })
      setCooldownRemaining(COOLDOWN_SECONDS)
    } catch (error) {
      setSubmissionStatus({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Failed to upload evidence to Filecoin.',
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(null)
      setSelectedFile(null)
    }
  }

  return (
    <section id="preserve" className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2 lg:gap-24">
        {/* Left column */}
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-candle">Preserve</p>
          <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-bone md:text-4xl">
            Prepare a clean record before the trail goes cold.
          </h2>
          <p className="mt-6 leading-relaxed text-ash">
            Every broken link was once a living page. Submit the original URL,
            attach a screenshot or archived copy, and we will issue a formal
            Death Certificate — timestamped and pinned to Filecoin for
            permanent retrieval.
          </p>

          <div className="mt-10 flex flex-col gap-5">
            {[
              ['01', 'Submit the vanished URL and any context you have.'],
              ['02', 'Upload a screenshot, HTML export, or other evidence.'],
              ['03', 'Receive a permanent Certificate with a Filecoin CID.'],
            ].map(([num, text]) => (
              <div key={num} className="flex items-start gap-4">
                <span className="shrink-0 pt-0.5 font-mono text-xs text-candle">
                  {num}
                </span>
                <p className="text-sm leading-relaxed text-ash">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: form card */}
        <div className="border border-stone bg-grave">
          {submissionStatus?.kind === 'success' ? (
            <div className="flex flex-col items-start gap-6 p-8">
              <div className="flex size-10 items-center justify-center border border-candle">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8L6.5 11.5L13 5"
                    stroke="#D8B96D"
                    strokeWidth="1.5"
                    strokeLinecap="square"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-candle">
                  Certificate issued
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ash">
                  The death certificate has been created and archived to Filecoin.
                  The record is permanent.
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate(submissionStatus.certificateUrl)}
                  className="bg-candle px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-undertaker-black transition-all duration-200 hover:brightness-110"
                >
                  View Death Certificate
                </button>
                <button
                  onClick={() => setSubmissionStatus(undefined)}
                  className="border border-stone px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-ash transition-colors duration-200 hover:border-candle hover:text-bone"
                >
                  Preserve Another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateDeathCertificate} noValidate>
              <div className="border-b border-stone px-6 py-5">
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-candle">
                  New Record
                </p>
              </div>

              <div className="flex flex-col gap-5 px-6 py-6">
                <div>
                  <label htmlFor="originalUrl" className={labelStyles}>
                    Original URL
                  </label>
                  <input
                    id="originalUrl"
                    name="originalUrl"
                    type="url"
                    placeholder="https://example.com/lost-page"
                    required
                    disabled={isUploading}
                    className={fieldStyles}
                  />
                </div>

                <div>
                  <label htmlFor="title" className={labelStyles}>
                    Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Name of the departed page"
                    required
                    disabled={isUploading}
                    className={`${fieldStyles} font-sans text-sm`}
                  />
                </div>

                <div>
                  <label htmlFor="preservationNote" className={labelStyles}>
                    Preservation Note
                  </label>
                  <textarea
                    id="preservationNote"
                    name="preservationNote"
                    placeholder="Why this page mattered. What it contained. Who might miss it."
                    rows={4}
                    required
                    disabled={isUploading}
                    className={`${fieldStyles} resize-none font-sans text-sm leading-relaxed`}
                  />
                </div>

                <div>
                  <label className={labelStyles}>Evidence Upload</label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer border border-dashed p-6 text-center transition-colors duration-150 ${
                      isDragOver
                        ? 'border-candle bg-candle/5'
                        : 'border-stone bg-transparent hover:border-ash/50'
                    }`}
                  >
                    <input
                      id="evidenceUpload"
                      name="evidenceUpload"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      aria-label="Upload evidence file"
                    />
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-mono text-xs text-candle">
                          {selectedFile.name}
                        </span>
                        <button
                          type="button"
                          className="text-xs text-dust hover:text-bone"
                          onClick={(e) => {
                            e.stopPropagation()
                            clearFile()
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-dust">
                          Drop a screenshot, HTML, or PDF
                        </p>
                        <p className="mt-1 text-xs text-stone">or click to browse</p>
                      </>
                    )}
                  </div>
                </div>

                {submissionStatus?.kind === 'error' && (
                  <div className="border border-ember px-4 py-3">
                    <p className="text-xs text-ember">
                      {submissionStatus.message}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isUploading || !selectedFile || cooldownRemaining > 0}
                  className="w-full bg-candle py-3 text-xs font-semibold uppercase tracking-[0.25em] text-undertaker-black transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {isUploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="size-3 animate-spin rounded-full border border-undertaker-black border-t-transparent" />
                      Archiving to Filecoin... {uploadProgress ?? 0}%
                    </span>
                  ) : cooldownRemaining > 0 ? (
                    `Please wait ${cooldownRemaining}s...`
                  ) : (
                    'Create Death Certificate'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
