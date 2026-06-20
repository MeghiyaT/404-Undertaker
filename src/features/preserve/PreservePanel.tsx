import type { FormEvent, DragEvent, ChangeEvent } from 'react'
import { useState, useRef } from 'react'
import { saveMetadataBundle } from '../../shared/services/certificateStorage'
import { uploadEvidenceToFilecoin } from '../../shared/services/filecoinStorage'

const fieldStyles =
  'mt-2 w-full border border-stone bg-undertaker-black/80 px-4 py-3 text-base text-bone outline-none transition-colors placeholder:text-ash/55 focus:border-candle'

const labelStyles = 'text-sm font-medium text-bone'

type SubmissionStatus =
  | {
      kind: 'success'
      message: string
      certificateUrl: string
    }
  | {
      kind: 'error'
      message: string
    }

export function PreservePanel() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus>()
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    if (file) {
      setSelectedFile(file)
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  function clearFile() {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleCreateDeathCertificate(
    event: FormEvent<HTMLFormElement>,
  ) {
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
      const metadataBundle = {
        originalUrl,
        title,
        note,
        timestamp,
        filecoinCid: upload.cid,
      }
      const savedCertificate = saveMetadataBundle(metadataBundle)
      const certificateUrl = `/certificate/${savedCertificate.id}`

      console.log('Evidence uploaded CID:', upload.cid)
      console.log('Death certificate metadata bundle:', metadataBundle)
      console.log('Saved certificate:', savedCertificate)
      console.log('Certificate URL:', certificateUrl)
      setSubmissionStatus({
        kind: 'success',
        message: 'Death certificate saved.',
        certificateUrl,
      })
    } catch (error) {
      console.error('Failed to upload evidence to Filecoin:', error)
      setSubmissionStatus({
        kind: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to upload evidence to Filecoin.',
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(null)
      setSelectedFile(null)
    }
  }

  return (
    <section
      id="preserve"
      className="border-y border-stone py-12 sm:grid sm:grid-cols-[0.8fr_1.2fr] sm:gap-12 sm:py-16"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-candle sm:text-sm">
          Preserve
        </p>
        <h2 className="mt-4 max-w-[20rem] text-2xl font-semibold leading-tight text-bone sm:max-w-none sm:text-3xl">
          Prepare a clean record before the trail goes cold.
        </h2>
      </div>
      <form
        onSubmit={handleCreateDeathCertificate}
        className="mt-8 grid max-w-[20rem] gap-5 border border-stone bg-grave/70 p-5 sm:mt-0 sm:max-w-none sm:p-6"
      >
        <div>
          <label htmlFor="original-url" className={labelStyles}>
            Original URL
          </label>
          <input
            id="original-url"
            name="originalUrl"
            type="url"
            placeholder="https://example.com/lost-page"
            required
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
            placeholder="Last known page title"
            required
            className={fieldStyles}
          />
        </div>

        <div>
          <label htmlFor="preservation-note" className={labelStyles}>
            Preservation Note
          </label>
          <textarea
            id="preservation-note"
            name="preservationNote"
            rows={5}
            placeholder="Record context, provenance, or final observations."
            required
            className={`${fieldStyles} resize-y leading-6`}
          />
        </div>

        <div>
          <label htmlFor="evidence-upload" className={labelStyles}>
            Evidence Upload
          </label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`mt-2 relative border-2 border-dashed p-6 text-center transition-colors duration-undertaker ease-undertaker ${
              isDragOver
                ? 'border-candle bg-candle/5'
                : 'border-stone bg-undertaker-black/80 hover:border-ash/50'
            }`}
          >
            <input
              id="evidence-upload"
              name="evidenceUpload"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label="Upload evidence file"
            />
            {selectedFile ? (
              <div className="flex flex-col items-center justify-center gap-2">
                <p className="text-sm font-medium text-bone">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-ash">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    clearFile()
                  }}
                  className="mt-2 text-xs uppercase tracking-wider text-candle hover:text-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-candle"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="pointer-events-none flex flex-col items-center justify-center gap-2">
                <p className="text-sm text-ash">
                  Drag and drop a file, or click to browse
                </p>
                <p className="text-xs text-ash/60">Any file up to 100MB</p>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isUploading || !selectedFile}
          className="mt-2 relative overflow-hidden border border-candle bg-candle px-5 py-3 text-sm font-semibold text-undertaker-black transition-colors hover:bg-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-candle disabled:cursor-not-allowed disabled:border-stone disabled:bg-stone disabled:text-ash"
        >
          {isUploading && uploadProgress !== null && (
            <div
              className="absolute inset-y-0 left-0 bg-undertaker-black/10 transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          )}
          <span className="relative z-10">
            {isUploading
              ? `Uploading Evidence... ${uploadProgress ?? 0}%`
              : 'Create Death Certificate'}
          </span>
        </button>
        {submissionStatus ? (
          <div
            aria-live="polite"
            className={`border px-4 py-3 text-sm leading-6 ${
              submissionStatus.kind === 'success'
                ? 'border-candle/60 bg-candle/10 text-bone'
                : 'border-stone bg-undertaker-black/70 text-ash'
            }`}
          >
            <p>{submissionStatus.message}</p>
            {submissionStatus.kind === 'success' ? (
              <a
                href={submissionStatus.certificateUrl}
                className="mt-2 inline-flex font-semibold text-candle hover:text-bone"
              >
                View Death Certificate
              </a>
            ) : null}
          </div>
        ) : null}
      </form>
    </section>
  )
}
