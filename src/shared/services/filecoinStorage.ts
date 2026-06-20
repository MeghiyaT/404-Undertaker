type LighthouseUploadResponse = {
  data?: {
    Hash?: unknown
    Name?: unknown
    Size?: unknown
  }
}

type LighthouseUploadResult = {
  cid: string
  gatewayUrl: string
  provider: 'lighthouse'
}

function hasErrorMessage(value: unknown): value is { error: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as Record<string, unknown>).error === 'string'
  )
}

const lighthouseGatewayUrl = 'https://gateway.lighthouse.storage/ipfs'

/**
 * Uploads a file via our Vercel serverless proxy at /api/upload.
 * The proxy holds the Lighthouse API key server-side so it is
 * never bundled into the client.
 */
async function uploadFileViaProxy(
  file: File,
  onProgress?: (progress: number) => void
): Promise<LighthouseUploadResponse> {
  const formData = new FormData()
  formData.set('file', file)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          onProgress(percentComplete)
        }
      })
    }

    xhr.addEventListener('load', () => {
      let responseBody: unknown
      try {
        responseBody = JSON.parse(xhr.responseText)
      } catch {
        responseBody = undefined
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(responseBody as LighthouseUploadResponse)
      } else {
        const errorMessage = hasErrorMessage(responseBody)
            ? responseBody.error
            : `Upload failed with status ${xhr.status}.`

        reject(new Error(errorMessage))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Network error occurred during upload.'))
    })

    xhr.open('POST', '/api/upload')
    xhr.send(formData)
  })
}

/** Maximum allowed evidence file size: 10 MB */
const MAX_EVIDENCE_FILE_SIZE_BYTES = 10 * 1024 * 1024

/** MIME types accepted for evidence uploads */
const ALLOWED_EVIDENCE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/html',
  'text/plain',
  'multipart/related', // .mhtml
] as const

function validateEvidenceFile(file: File) {
  if (!file.size) {
    throw new Error('Choose a non-empty evidence file before uploading.')
  }

  if (file.size > MAX_EVIDENCE_FILE_SIZE_BYTES) {
    const maxMB = MAX_EVIDENCE_FILE_SIZE_BYTES / (1024 * 1024)
    throw new Error(`File exceeds the maximum allowed size of ${maxMB} MB.`)
  }

  if (
    file.type &&
    !ALLOWED_EVIDENCE_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_EVIDENCE_MIME_TYPES)[number],
    )
  ) {
    throw new Error(
      `File type "${file.type}" is not allowed. Accepted types: PNG, JPEG, WebP, GIF, PDF, HTML, plain text.`,
    )
  }
}

/** CIDs are base32/base58 alphanumeric strings (CIDv0: Qm..., CIDv1: bafy...) */
const CID_FORMAT = /^[a-zA-Z0-9]+$/

export function getFilecoinGatewayUrl(cid: string) {
  if (!CID_FORMAT.test(cid)) {
    throw new Error('Invalid CID format.')
  }
  return `${lighthouseGatewayUrl}/${cid}`
}

export async function uploadEvidenceToFilecoin(
  file: File,
  onProgress?: (progress: number) => void
): Promise<LighthouseUploadResult> {
  validateEvidenceFile(file)

  const uploadResponse = await uploadFileViaProxy(file, onProgress)
  const cid = uploadResponse.data?.Hash

  if (typeof cid !== 'string' || cid.length === 0) {
    throw new Error('Upload completed without returning a CID.')
  }

  return {
    cid,
    gatewayUrl: getFilecoinGatewayUrl(cid),
    provider: 'lighthouse',
  }
}

/** How long to keep an object URL alive before revoking (5 minutes) */
const OBJECT_URL_TTL_MS = 5 * 60 * 1000

export async function retrieveEvidenceFromFilecoin(cid: string) {
  const gatewayUrl = getFilecoinGatewayUrl(cid)

  try {
    const response = await fetch(gatewayUrl)

    if (!response.ok) {
      throw new Error(`Filecoin gateway returned ${response.status}`)
    }

    const evidenceBlob = await response.blob()
    const evidenceUrl = URL.createObjectURL(evidenceBlob)

    window.open(evidenceUrl, '_blank', 'noopener')
    window.setTimeout(() => URL.revokeObjectURL(evidenceUrl), OBJECT_URL_TTL_MS)
  } catch (error) {
    // Fetch failed — fall back to opening the gateway URL directly
    window.open(gatewayUrl, '_blank', 'noopener')

    throw error
  }
}
