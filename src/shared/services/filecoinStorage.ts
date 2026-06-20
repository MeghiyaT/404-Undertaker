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
const lighthouseUploadUrl =
  'https://upload.lighthouse.storage/api/v0/add?cid-version=1'

/**
 * TODO [S-1 — NOT RESOLVED]: Move the Lighthouse API key server-side.
 *
 * RESIDUAL RISK: The VITE_LIGHTHOUSE_API_KEY is bundled into the client JS
 * because Vite inlines all VITE_* env vars. Anyone can extract it from the
 * browser bundle and abuse your Lighthouse storage quota (upload arbitrary
 * files, exhaust limits, cause billing spikes).
 *
 * REQUIRED PRODUCTION FIX:
 * 1. Create a serverless proxy (Vercel Function, Cloudflare Worker, etc.).
 * 2. Store the key in the proxy's server-side environment variables.
 * 3. Remove the VITE_ prefix so the key is never bundled.
 * 4. Have the client POST to /api/upload; the proxy forwards to Lighthouse.
 * 5. Add rate-limiting and authentication on the proxy endpoint.
 *
 * Until then, use only a low-risk / disposable / tightly-scoped demo key.
 */
function getLighthouseApiKey() {
  const apiKey = import.meta.env.VITE_LIGHTHOUSE_API_KEY?.trim()

  if (!apiKey) {
    throw new Error('Missing VITE_LIGHTHOUSE_API_KEY in your environment.')
  }

  return apiKey
}

async function uploadFileWithLighthouse(
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
          // Calculate percentage from 0 to 100
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
            : `Lighthouse upload failed with status ${xhr.status}.`
        
        reject(new Error(errorMessage))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Network error occurred during upload.'))
    })

    xhr.open('POST', lighthouseUploadUrl)
    xhr.setRequestHeader('Authorization', `Bearer ${getLighthouseApiKey()}`)
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

  const uploadResponse = await uploadFileWithLighthouse(file, onProgress)
  const cid = uploadResponse.data?.Hash

  if (typeof cid !== 'string' || cid.length === 0) {
    throw new Error('Lighthouse upload completed without returning a CID.')
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
