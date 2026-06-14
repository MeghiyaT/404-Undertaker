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

Evidence uploads use the Lighthouse JavaScript SDK to store files on Filecoin/IPFS and return a CID.

Create `.env.local` from `.env.example` and set `VITE_LIGHTHOUSE_API_KEY`.

For this Vite-only MVP, the key is exposed to the browser. Use a restricted or disposable key for demos; move uploads behind a serverless endpoint before production.
