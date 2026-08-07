import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY })

export async function GET(req: Request) {
  const text = new URL(req.url).searchParams.get("text")

  if (!text) {
    return Response.json({ error: "text is required" }, { status: 400 })
  }

  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: text,
      response_format: "mp3",
    })

    const buffer = await mp3.arrayBuffer()

    return new Response(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[TTS error]", msg)
    return Response.json({ error: msg }, { status: 500 })
  }
}
