import { streamText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { CONTEXT_SYSTEM_PROMPT } from "@/lib/parser"

export async function POST(req: Request) {
  const { korean, english } = await req.json()

  if (!korean || !english) {
    return Response.json({ error: "korean and english are required" }, { status: 400 })
  }

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: CONTEXT_SYSTEM_PROMPT,
    prompt: `Word: ${korean}\nMeaning: ${english}`,
  })

  return result.toTextStreamResponse()
}
