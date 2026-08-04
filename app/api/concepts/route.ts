import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { dbGetAllConcepts, dbUpsertConcept } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json([], { status: 401 })
  const concepts = await dbGetAllConcepts(session.user.email)
  return NextResponse.json(concepts)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const concept = await req.json()
  await dbUpsertConcept(concept, session.user.email)
  return NextResponse.json({ ok: true })
}
