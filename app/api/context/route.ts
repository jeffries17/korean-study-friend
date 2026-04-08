import { streamText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { auth } from "@/auth"
import { CONTEXT_SYSTEM_PROMPT } from "@/lib/parser"
import { dbGetCardContext, dbSetCardContext } from "@/lib/db"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const cardId = searchParams.get("cardId")
  if (!cardId) return Response.json(null, { status: 400 })

  const context = await dbGetCardContext(cardId, session.user.email)
  if (!context) return Response.json(null, { status: 404 })
  return Response.json({ context })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { korean, english, cardId } = await req.json()

  if (!korean || !english) {
    return Response.json({ error: "korean and english are required" }, { status: 400 })
  }

  const userId = session.user.email
  const result = streamText({
    model: anthropic("claude-haiku-4-5"),
    system: CONTEXT_SYSTEM_PROMPT,
    prompt: `Word: ${korean}\nMeaning: ${english}`,
    onFinish: async ({ text }) => {
      if (cardId) {
        await dbSetCardContext(cardId, userId, text)
      }
    },
  })

  return result.toTextStreamResponse()
}
