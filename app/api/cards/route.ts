import { NextResponse } from "next/server"
import { dbGetAllCards, dbUpsertCard } from "@/lib/db"

export async function GET() {
  const cards = await dbGetAllCards()
  return NextResponse.json(cards)
}

export async function POST(req: Request) {
  const card = await req.json()
  await dbUpsertCard(card)
  return NextResponse.json({ ok: true })
}
