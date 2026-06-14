import type { FormEvent } from 'react'
import { useState } from 'react'
import { saveMetadataBundle } from '../../shared/services/certificateStorage'
import { uploadEvidenceToFilecoin } from '../../shared/services/filecoinStorage'

const fieldStyles =
  'mt-2 w-full border border-stone bg-undertaker-black/80 px-4 py-3 text-base text-bone outline-none transition-colors placeholder:text-ash/55 focus:border-candle'

const labelStyles = 'text-sm font-medium text-bone'

export function PreservePanel() {
  const [isUploading, setIsUploading] = useState(false)

  async function handleCreateDeathCertificate(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const evidenceUpload = formData.get('evidenceUpload')

    if (!(evidenceUpload instanceof File) || evidenceUpload.size === 0) {
      console.error('Choose an evidence file before creating a certificate.')
      return
    }

    setIsUploading(true)

    try {
      const upload = await uploadEvidenceToFilecoin(evidenceUpload)
      const timestamp = new Date().toISOString()
      const metadataBundle = {
        originalUrl: String(formData.get('originalUrl') ?? ''),
        title: String(formData.get('title') ?? ''),
        note: String(formData.get('preservationNote') ?? ''),
        timestamp,
        filecoinCid: upload.cid,
      }
      const savedCertificate = saveMetadataBundle(metadataBundle)

      console.log('Evidence uploaded CID:', upload.cid)
      console.log('Death certificate metadata bundle:', metadataBundle)
      console.log('Saved certificate:', savedCertificate)
      console.log('Certificate URL:', `/certificate/${savedCertificate.id}`)
    } catch (error) {
      console.error('Failed to upload evidence to Filecoin:', error)
    } finally {
      setIsUploading(false)
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
            className={`${fieldStyles} resize-y leading-6`}
          />
        </div>

        <div>
          <label htmlFor="evidence-upload" className={labelStyles}>
            Evidence Upload
          </label>
          <input
            id="evidence-upload"
            name="evidenceUpload"
            type="file"
            className="mt-2 w-full cursor-pointer border border-stone bg-undertaker-black/80 text-sm text-ash outline-none transition-colors file:mr-4 file:border-0 file:bg-stone file:px-4 file:py-3 file:text-sm file:font-medium file:text-bone hover:border-candle focus:border-candle"
          />
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="mt-2 border border-candle bg-candle px-5 py-3 text-sm font-semibold text-undertaker-black transition-colors hover:bg-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-candle disabled:cursor-not-allowed disabled:border-stone disabled:bg-stone disabled:text-ash"
        >
          {isUploading ? 'Uploading Evidence...' : 'Create Death Certificate'}
        </button>
      </form>
    </section>
  )
}
