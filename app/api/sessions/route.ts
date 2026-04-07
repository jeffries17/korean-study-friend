import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { dbGetAllSessions, dbUpsertSession } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json([], { status: 401 })
  const sessions = await dbGetAllSessions(session.user.email)
  return NextResponse.json(sessions)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  await dbUpsertSession(body, session.user.email)
  return NextResponse.json({ ok: true })
}
