# 404 Undertaker

A dark, minimalist web app scaffold for preserving broken paths and archiving their remains.

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS

## Scripts

```bash
npm install
npm run dev
npm run build
```

## Filecoin Uploads

Evidence uploads use the Storacha JavaScript client, the current Web3.Storage-backed Filecoin path.

Create `.env.local` from `.env.example` and set `VITE_STORACHA_LOGIN_EMAIL`. On the first upload, confirm the Storacha email authorization. If the account has multiple spaces, also set `VITE_STORACHA_SPACE_DID`.
# 404-Undertaker
