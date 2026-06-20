/**
 * Vercel Edge Function — proxies evidence uploads to Lighthouse.
 *
 * The Lighthouse API key is read from `process.env.LIGHTHOUSE_API_KEY`
 * (set via Vercel Dashboard → Settings → Environment Variables) and is
 * NEVER exposed to the client bundle.
 */

export const config = { runtime: 'edge' }

const LIGHTHOUSE_UPLOAD_URL =
  'https://upload.lighthouse.storage/api/v0/add?cid-version=1'

export default async function handler(request: Request) {
  // ---------- method check ----------
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  // ---------- server-side key ----------
  const apiKey = process.env.LIGHTHOUSE_API_KEY
  if (!apiKey) {
    return Response.json(
      { error: 'Upload service is not configured.' },
      { status: 500 },
    )
  }

  // ---------- forward to Lighthouse ----------
  const contentType = request.headers.get('content-type') || ''

  try {
    const body = await request.arrayBuffer()

    const lighthouseResponse = await fetch(LIGHTHOUSE_UPLOAD_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': contentType,
      },
      body,
    })

    const data = await lighthouseResponse.text()

    return new Response(data, {
      status: lighthouseResponse.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return Response.json(
      { error: 'Failed to reach the upload gateway.' },
      { status: 502 },
    )
  }
}
