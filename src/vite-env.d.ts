/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STORACHA_LOGIN_EMAIL?: `${string}@${string}`
  readonly VITE_STORACHA_SPACE_DID?: `did:${string}:${string}`
}
