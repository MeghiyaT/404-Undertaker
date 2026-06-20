# 404 Undertaker

A dark, minimalist web app for preserving broken paths and archiving their remains on Filecoin/IPFS.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- Vercel (Hosting + Edge Functions)

## Local Development

```bash
npm install
npm run dev
```

## Deployment (Vercel)

The app deploys to Vercel with a serverless Edge Function proxy for secure uploads.

1. Push to your Git repo connected to Vercel.
2. In **Vercel Dashboard → Settings → Environment Variables**, add:

   | Name                 | Value                    | Environment |
   | -------------------- | ------------------------ | ----------- |
   | `LIGHTHOUSE_API_KEY` | _your Lighthouse key_    | Production  |

3. Vercel will auto-build with `tsc -b && vite build` and serve the SPA via `vercel.json` rewrites.

> **Security note:** The Lighthouse API key is held exclusively in the server-side Edge Function (`api/upload.ts`) and is never bundled into the client JavaScript.

## Scripts

```bash
npm run dev        # Start local dev server
npm run build      # TypeScript check + Vite production build
npm run typecheck  # TypeScript only
npm run lint       # ESLint (typescript-eslint + react-hooks)
npm run preview    # Preview the production build locally
```
