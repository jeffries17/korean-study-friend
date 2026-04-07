import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { dbGetNewCardsSeenToday, dbIncrementNewCardsSeen } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ count: 0 }, { status: 401 })
  const count = await dbGetNewCardsSeenToday(session.user.email)
  return NextResponse.json({ count })
}

export async function POST() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await dbIncrementNewCardsSeen(session.user.email)
  return NextResponse.json({ ok: true })
}
