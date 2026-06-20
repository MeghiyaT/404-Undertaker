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

const lighthouseGatewayUrl = 'https://gateway.lighthouse.storage/ipfs'
const lighthouseUploadUrl =
  'https://upload.lighthouse.storage/api/v0/add?cid-version=1'

/**
 * SECURITY NOTE: 
 * In this Vite-only MVP, the Lighthouse API key is exposed to the browser.
 * This is suitable for a low-risk or disposable key used for demonstrations.
 * For production, DO NOT expose this key in the browser. Instead:
 * 1. Create a serverless endpoint (e.g. Vercel Function, Cloudflare Worker).
 * 2. Store the key securely in the endpoint's environment variables.
 * 3. Have the client upload to your endpoint (or request a signed upload token),
 *    and let the server handle the interaction with Lighthouse.
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
      } catch (e) {
        responseBody = undefined
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(responseBody as LighthouseUploadResponse)
      } else {
        const errorMessage =
          typeof responseBody === 'object' &&
          responseBody !== null &&
          'error' in responseBody &&
          typeof (responseBody as any).error === 'string'
            ? (responseBody as any).error
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

export function getFilecoinGatewayUrl(cid: string) {
  return `${lighthouseGatewayUrl}/${cid}`
}

export async function uploadEvidenceToFilecoin(
  file: File,
  onProgress?: (progress: number) => void
): Promise<LighthouseUploadResult> {
  if (!file.size) {
    throw new Error('Choose a non-empty evidence file before uploading.')
  }

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

export async function retrieveEvidenceFromFilecoin(cid: string) {
  const gatewayUrl = getFilecoinGatewayUrl(cid)
  const evidenceWindow = window.open('about:blank', '_blank')

  if (evidenceWindow) {
    evidenceWindow.opener = null
  }

  try {
    const response = await fetch(gatewayUrl)

    if (!response.ok) {
      throw new Error(`Filecoin gateway returned ${response.status}`)
    }

    const evidenceBlob = await response.blob()
    const evidenceUrl = URL.createObjectURL(evidenceBlob)

    if (evidenceWindow) {
      evidenceWindow.location.href = evidenceUrl
    } else {
      window.open(evidenceUrl, '_blank', 'noopener')
    }

    window.setTimeout(() => URL.revokeObjectURL(evidenceUrl), 60_000)
  } catch (error) {
    if (evidenceWindow) {
      evidenceWindow.location.href = gatewayUrl
    } else {
      window.open(gatewayUrl, '_blank', 'noopener')
    }

    throw error
  }
}
