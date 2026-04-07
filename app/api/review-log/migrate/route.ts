import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { neon } from "@neondatabase/serverless"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { date, count } = await req.json()
  const db = neon(process.env.DATABASE_URL!)
  await db`
    INSERT INTO review_log (user_id, date, count) VALUES (${session.user.email}, ${date}, ${count})
    ON CONFLICT (user_id, date) DO UPDATE SET count = review_log.count + EXCLUDED.count
  `
  return NextResponse.json({ ok: true })
}
