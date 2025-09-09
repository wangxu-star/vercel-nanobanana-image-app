// Serverless API route: proxies requests to Google Gemini (Nano‑Banana) Generative API.
// Keep your API key in an environment variable on Vercel: GEMINI_API_KEY
// Model used: gemini-2.5-flash-image-preview (change model id as needed)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed')
  const { prompt, initImage } = req.body || {}
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Server not configured. Set GEMINI_API_KEY in environment.' })
  }

  try {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-image-preview'
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

    let imageBase64 = null
    if (initImage) {
      const m = initImage.match(/^data:(.+);base64,(.*)$/)
      if (m) imageBase64 = m[2]
      else imageBase64 = initImage
    }

    const contents = [
      {
        parts: [{ text: prompt || '' }]
      }
    ]

    if (imageBase64) {
      contents[0].parts.push({
        inline_image: {
          mime_type: 'image/png',
          data: imageBase64
        }
      })
    }

    const payload = { contents }

    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
      },
      body: JSON.stringify(payload),
    })

    const text = await r.text()
    let json
    try { json = JSON.parse(text) } catch(e) { json = null }

    if (!r.ok) {
      return res.status(502).json({ error: 'Upstream error', status: r.status, details: json || text })
    }

    let imageBase64Out = null
    try {
      const body = json
      const candidate = body?.candidates?.[0]
      if (candidate) {
        const parts = candidate.content?.parts || []
        for (const p of parts) {
          if (p.inline_data?.data) {
            imageBase64Out = `data:image/png;base64,${p.inline_data.data}`
            break
          }
          if (p.imageBytes) {
            imageBase64Out = `data:image/png;base64,${p.imageBytes}`
            break
          }
          if (typeof p === 'string' && p.startsWith('data:')) {
            imageBase64Out = p
            break
          }
        }
      }
      if (!imageBase64Out) {
        if (body?.output && typeof body.output === 'string' && body.output.startsWith('data:')) imageBase64Out = body.output
        else if (body?.output_url) imageBase64Out = body.output_url
        else if (body?.data?.[0]?.b64_json) imageBase64Out = `data:image/png;base64,${body.data[0].b64_json}`
      }
    } catch (e) {
      console.warn('Failed parsing upstream response for image data', e)
    }

    if (!imageBase64Out) return res.status(500).json({ error: 'Could not parse upstream response for image', upstream: json || text })

    return res.status(200).json({ image_base64: imageBase64Out })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: String(err) })
  }
}
