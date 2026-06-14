export type CertificateMetadataBundle = {
  originalUrl: string
  title: string
  note: string
  timestamp: string
  filecoinCid: string
}

export type SavedCertificate = CertificateMetadataBundle & {
  id: string
}

const certificateIndexKey = '404-undertaker:certificate-ids'
const certificateKeyPrefix = '404-undertaker:certificate'
const certificatesUpdatedEvent = '404-undertaker:certificates-updated'

function createCertificateId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `certificate-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function getCertificateKey(id: string) {
  return `${certificateKeyPrefix}:${id}`
}

function readCertificateIds() {
  const storedIds = localStorage.getItem(certificateIndexKey)

  if (!storedIds) {
    return []
  }

  try {
    const parsedIds: unknown = JSON.parse(storedIds)
    return Array.isArray(parsedIds)
      ? parsedIds.filter((id): id is string => typeof id === 'string')
      : []
  } catch {
    return []
  }
}

export function saveMetadataBundle(
  bundle: CertificateMetadataBundle,
): SavedCertificate {
  const id = createCertificateId()
  const savedCertificate = { ...bundle, id }
  const certificateIds = readCertificateIds()

  localStorage.setItem(
    getCertificateKey(id),
    JSON.stringify(savedCertificate),
  )
  localStorage.setItem(
    certificateIndexKey,
    JSON.stringify([...certificateIds, id]),
  )
  window.dispatchEvent(new CustomEvent(certificatesUpdatedEvent))

  return savedCertificate
}

export function getSavedCertificateById(
  id: string,
): SavedCertificate | undefined {
  const storedCertificate = localStorage.getItem(getCertificateKey(id))

  if (!storedCertificate) {
    return undefined
  }

  try {
    const parsedCertificate: unknown = JSON.parse(storedCertificate)

    if (
      typeof parsedCertificate === 'object' &&
      parsedCertificate !== null &&
      'id' in parsedCertificate &&
      'originalUrl' in parsedCertificate &&
      'title' in parsedCertificate &&
      'note' in parsedCertificate &&
      'timestamp' in parsedCertificate &&
      'filecoinCid' in parsedCertificate
    ) {
      return parsedCertificate as SavedCertificate
    }
  } catch {
    return undefined
  }

  return undefined
}

export function getSavedCertificates() {
  return readCertificateIds()
    .map((id) => getSavedCertificateById(id))
    .filter(
      (certificate): certificate is SavedCertificate =>
        certificate !== undefined,
    )
    .sort(
      (firstCertificate, secondCertificate) =>
        new Date(secondCertificate.timestamp).getTime() -
        new Date(firstCertificate.timestamp).getTime(),
    )
}

export function onSavedCertificatesUpdated(callback: () => void) {
  window.addEventListener(certificatesUpdatedEvent, callback)
  window.addEventListener('storage', callback)

  return () => {
    window.removeEventListener(certificatesUpdatedEvent, callback)
    window.removeEventListener('storage', callback)
  }
}
