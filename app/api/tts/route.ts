import { createHash } from "crypto"
import { head, put } from "@vercel/blob"

const VOICE_NAME = "ko-KR-Neural2-A"

function pathnameFor(text: string): string {
  const hash = createHash("sha256").update(text).digest("hex")
  return `tts/${hash}.mp3`
}

async function synthesize(text: string): Promise<Buffer> {
  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: "ko-KR", name: VOICE_NAME },
        audioConfig: { audioEncoding: "MP3" },
      }),
    }
  )

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Google TTS request failed (${res.status}): ${body}`)
  }

  const { audioContent } = await res.json()
  return Buffer.from(audioContent, "base64")
}

export async function GET(req: Request) {
  const text = new URL(req.url).searchParams.get("text")

  if (!text) {
    return Response.json({ error: "text is required" }, { status: 400 })
  }

  const pathname = pathnameFor(text)

  try {
    const cached = await head(pathname).catch(() => null)
    if (cached) {
      return Response.redirect(cached.url, 302)
    }

    const audio = await synthesize(text)
    const blob = await put(pathname, audio, {
      access: "public",
      contentType: "audio/mpeg",
      addRandomSuffix: false,
    })

    return Response.redirect(blob.url, 302)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[TTS error]", msg)
    return Response.json({ error: msg }, { status: 500 })
  }
}
