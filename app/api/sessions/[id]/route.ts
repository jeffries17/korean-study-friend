import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { dbDeleteSession } from "@/lib/db"

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  await dbDeleteSession(id, session.user.email)
  return NextResponse.json({ ok: true })
}
