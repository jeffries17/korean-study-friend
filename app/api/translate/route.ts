import { generateText, Output } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { z } from "zod"

export async function POST(req: Request) {
  const { english } = await req.json()

  if (!english || typeof english !== "string") {
    return Response.json({ error: "english is required" }, { status: 400 })
  }

  // Free translation via MyMemory API
  let korean = ""
  try {
    const mmRes = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(english)}&langpair=en|ko`
    )
    const mmData = await mmRes.json()
    korean = mmData.responseData?.translatedText ?? ""
  } catch {
    // fall through to AI fallback
  }

  // If MyMemory failed or returned garbage, fall back to Haiku
  if (!korean || korean === english) {
    const { output } = await generateText({
      model: anthropic("claude-haiku-4-5"),
      output: Output.object({
        schema: z.object({ korean: z.string(), english: z.string(), example: z.string() }),
      }),
      system: `You are a Korean language expert. Given an English word or phrase, return the most natural Korean equivalent with a natural example sentence.`,
      prompt: `Translate to Korean: "${english}"`,
    })
    return Response.json(output)
  }

  // Generate example sentence with Haiku (cheap)
  const { output } = await generateText({
    model: anthropic("claude-haiku-4-5"),
    output: Output.object({ schema: z.object({ example: z.string() }) }),
    prompt: `Write one natural Korean sentence using "${korean}" (which means "${english}"). Return JSON with an "example" field.`,
  })

  return Response.json({ korean, english, example: output?.example ?? "" })
}
