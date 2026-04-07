import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(req: Request) {
  const { date, count } = await req.json()
  const db = neon(process.env.DATABASE_URL!)
  await db`
    INSERT INTO review_log (date, count) VALUES (${date}, ${count})
    ON CONFLICT (date) DO UPDATE SET count = review_log.count + EXCLUDED.count
  `
  return NextResponse.json({ ok: true })
}
