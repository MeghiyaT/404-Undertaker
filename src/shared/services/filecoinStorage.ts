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

function getLighthouseApiKey() {
  const apiKey = import.meta.env.VITE_LIGHTHOUSE_API_KEY?.trim()

  if (!apiKey) {
    throw new Error('Missing VITE_LIGHTHOUSE_API_KEY in your environment.')
  }

  return apiKey
}

async function uploadFileWithLighthouse(file: File) {
  const formData = new FormData()
  formData.set('file', file)

  const response = await fetch(lighthouseUploadUrl, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${getLighthouseApiKey()}`,
    },
  })

  const responseBody: unknown = await response.json().catch(() => undefined)

  if (!response.ok) {
    const errorMessage =
      typeof responseBody === 'object' &&
      responseBody !== null &&
      'error' in responseBody &&
      typeof responseBody.error === 'string'
        ? responseBody.error
        : `Lighthouse upload failed with status ${response.status}.`

    throw new Error(errorMessage)
  }

  return responseBody as LighthouseUploadResponse
}

export function getFilecoinGatewayUrl(cid: string) {
  return `${lighthouseGatewayUrl}/${cid}`
}

export async function uploadEvidenceToFilecoin(
  file: File,
): Promise<LighthouseUploadResult> {
  if (!file.size) {
    throw new Error('Choose a non-empty evidence file before uploading.')
  }

  const uploadResponse = await uploadFileWithLighthouse(file)
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
