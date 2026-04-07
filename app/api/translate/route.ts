import { generateText, Output } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { z } from "zod"

const CardSchema = z.object({
  korean: z.string(),
  english: z.string(),
  example: z.string(),
})

export async function POST(req: Request) {
  const { english } = await req.json()

  if (!english || typeof english !== "string") {
    return Response.json({ error: "english is required" }, { status: 400 })
  }

  const { output } = await generateText({
    model: anthropic("claude-sonnet-4-6"),
    output: Output.object({ schema: CardSchema }),
    system: `You are a Korean language expert. Given an English word or phrase, return the most natural Korean equivalent.

Return a JSON object with:
- korean: the Korean word or phrase (prefer the most natural, commonly used form)
- english: the English input, cleaned up if needed
- example: a natural Korean sentence using this word/phrase

Rules:
- For verbs, use the dictionary form (e.g. 먹다, 가다)
- Prefer common everyday Korean over formal or archaic forms
- The example must be a full, natural-sounding Korean sentence
- No romanization`,
    prompt: `Translate to Korean: "${english}"`,
  })

  return Response.json(output)
}
