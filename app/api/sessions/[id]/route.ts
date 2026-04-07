import { NextResponse } from "next/server"
import { dbDeleteSession } from "@/lib/db"

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await dbDeleteSession(id)
  return NextResponse.json({ ok: true })
}
