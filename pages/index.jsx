import { useState } from 'react'

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [resultB64, setResultB64] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function onFileChange(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function generate(e) {
    e.preventDefault()
    setError(null)
    setResultB64(null)
    setLoading(true)
    try {
      let initImage = null
      if (file) {
        const reader = await new Promise((res, rej) => {
          const r = new FileReader()
          r.onload = () => res(r.result)
          r.onerror = rej
          r.readAsDataURL(file)
        })
        initImage = reader
      }

      const resp = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, initImage })
      })
      if (!resp.ok) throw new Error(await resp.text())
      const json = await resp.json()
      setResultB64(json.image_base64)
    } catch (err) {
      console.error(err)
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  function downloadResult() {
    if (!resultB64) return
    const a = document.createElement('a')
    a.href = resultB64
    a.download = 'nanobanana-result.png'
    a.click()
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-semibold mb-4">Nano‑Banana (Gemini) Image Demo</h1>
        <form onSubmit={generate} className="space-y-4">
          <label className="block">
            <div className="text-sm font-medium mb-1">Prompt</div>
            <textarea value={prompt} onChange={(e)=>setPrompt(e.target.value)} className="w-full border rounded p-2" rows={4} placeholder="A cute corgi wearing sunglasses, cinematic lighting" />
          </label>

          <label className="block">
            <div className="text-sm font-medium mb-1">Optional reference image</div>
            <input type="file" accept="image/*" onChange={onFileChange} />
            {preview && <img src={preview} alt="preview" className="mt-3 max-h-48 rounded" />}
          </label>

          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>{loading? 'Generating...': 'Generate'}</button>
            {resultB64 && <button type="button" onClick={downloadResult} className="px-4 py-2 bg-green-600 text-white rounded">Download</button>}
          </div>
          {error && <div className="text-red-600">Error: {error}</div>}
        </form>

        <div className="mt-6">
          {resultB64 ? (
            <div>
              <h2 className="font-medium mb-2">Result</h2>
              <img src={resultB64} alt="result" className="rounded max-w-full" />
            </div>
          ) : (
            <div className="text-sm text-slate-500">Result will appear here.</div>
          )}
        </div>
      </div>
    </main>
  )
}