import { NextResponse } from "next/server"
import { dbGetReviewLog, dbLogReviews } from "@/lib/db"

export async function GET() {
  const log = await dbGetReviewLog()
  return NextResponse.json(log)
}

export async function POST(req: Request) {
  const { count } = await req.json()
  await dbLogReviews(count)
  return NextResponse.json({ ok: true })
}
