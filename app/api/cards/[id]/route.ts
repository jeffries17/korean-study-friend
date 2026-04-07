import { NextResponse } from "next/server"
import { dbDeleteCard } from "@/lib/db"

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await dbDeleteCard(id)
  return NextResponse.json({ ok: true })
}
