import { NextResponse } from "next/server"
import { dbGetNewCardsSeenToday, dbIncrementNewCardsSeen } from "@/lib/db"

export async function GET() {
  const count = await dbGetNewCardsSeenToday()
  return NextResponse.json({ count })
}

export async function POST() {
  await dbIncrementNewCardsSeen()
  return NextResponse.json({ ok: true })
}
