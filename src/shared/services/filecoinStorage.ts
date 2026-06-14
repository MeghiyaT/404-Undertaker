type StorachaUploadResult = {
  cid: string
  gatewayUrl: string
  provider: 'storacha'
}

type StorachaModule = typeof import('@storacha/client')
type StorachaClient = Awaited<ReturnType<StorachaModule['create']>>

const storachaGatewayHost = 'storacha.link'
let storachaClientPromise: Promise<StorachaClient> | undefined

function getStorachaClient() {
  storachaClientPromise ??= import('@storacha/client').then(({ create }) =>
    create(),
  )
  return storachaClientPromise
}

async function ensureStorachaSpace() {
  const client = await getStorachaClient()
  const configuredSpaceDid = import.meta.env.VITE_STORACHA_SPACE_DID
  const configuredLoginEmail = import.meta.env.VITE_STORACHA_LOGIN_EMAIL

  if (client.currentSpace()) {
    return client
  }

  const existingSpace = configuredSpaceDid
    ? client.spaces().find((space) => space.did() === configuredSpaceDid)
    : client.spaces()[0]

  if (existingSpace) {
    await client.setCurrentSpace(existingSpace.did())
    return client
  }

  if (configuredLoginEmail) {
    await client.login(configuredLoginEmail)
  }

  const authorizedSpace = configuredSpaceDid
    ? client.spaces().find((space) => space.did() === configuredSpaceDid)
    : client.spaces()[0]

  if (authorizedSpace) {
    await client.setCurrentSpace(authorizedSpace.did())
    return client
  }

  throw new Error(
    'Storacha is not configured. Add VITE_STORACHA_LOGIN_EMAIL and optionally VITE_STORACHA_SPACE_DID, or authorize this browser agent before uploading.',
  )
}

export async function uploadEvidenceToFilecoin(
  file: File,
): Promise<StorachaUploadResult> {
  if (!file.size) {
    throw new Error('Choose a non-empty evidence file before uploading.')
  }

  const client = await ensureStorachaSpace()
  const cid = await client.uploadFile(file)
  const cidString = cid.toString()

  return {
    cid: cidString,
    gatewayUrl: `https://${cidString}.ipfs.${storachaGatewayHost}`,
    provider: 'storacha',
  }
}
