import { NextResponse } from "next/server"
import { dbGetAllSessions, dbUpsertSession } from "@/lib/db"

export async function GET() {
  const sessions = await dbGetAllSessions()
  return NextResponse.json(sessions)
}

export async function POST(req: Request) {
  const session = await req.json()
  await dbUpsertSession(session)
  return NextResponse.json({ ok: true })
}
