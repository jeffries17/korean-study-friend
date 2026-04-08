import { generateText, Output } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { z } from "zod"
import { PARSE_SYSTEM_PROMPT } from "@/lib/parser"

const ParsedSchema = z.object({
  cards: z.array(
    z.object({
      korean: z.string(),
      english: z.string(),
      example: z.string(),
    })
  ),
})

export async function POST(req: Request) {
  const { image } = await req.json()

  if (!image || typeof image !== "string") {
    return Response.json({ error: "image is required" }, { status: 400 })
  }

  const base64 = image.replace(/^data:image\/\w+;base64,/, "")
  const mediaType = image.match(/^data:(image\/\w+);base64,/)?.[1] ?? "image/jpeg"

  try {
    const { output } = await generateText({
      model: anthropic("claude-haiku-4-5"),
      output: Output.object({ schema: ParsedSchema }),
      system: PARSE_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", image: base64, mediaType },
            { type: "text", text: "Extract all Korean vocabulary from this image." },
          ],
        },
      ],
    })

    return Response.json(output)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[parse] Anthropic error:", message)
    return Response.json({ error: message }, { status: 500 })
  }
}
