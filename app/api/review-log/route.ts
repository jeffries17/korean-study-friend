import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { dbGetReviewLog, dbLogReviews } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({}, { status: 401 })
  const log = await dbGetReviewLog(session.user.email)
  return NextResponse.json(log)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { count } = await req.json()
  await dbLogReviews(count, session.user.email)
  return NextResponse.json({ ok: true })
}
