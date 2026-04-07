import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { dbGetAllCards, dbUpsertCard } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json([], { status: 401 })
  const cards = await dbGetAllCards(session.user.email)
  return NextResponse.json(cards)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const card = await req.json()
  await dbUpsertCard(card, session.user.email)
  return NextResponse.json({ ok: true })
}
