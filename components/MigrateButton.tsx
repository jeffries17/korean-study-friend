"use client"

import { useEffect, useState } from "react"
import { Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { migrateFromLocalStorage } from "@/lib/storage"

interface MigrateButtonProps {
  onMigrated?: () => void
}

export function MigrateButton({ onMigrated }: MigrateButtonProps) {
  const [hasLocalData, setHasLocalData] = useState(false)
  const [status, setStatus] = useState<"idle" | "migrating" | "done">("idle")
  const [result, setResult] = useState<string | null>(null)

  useEffect(() => {
    const hasData = !!(localStorage.getItem("ksf-cards") || localStorage.getItem("ksf-sessions"))
    setHasLocalData(hasData)
  }, [])

  if (!hasLocalData || status === "done") {
    if (status === "done" && result) {
      return <p className="text-xs text-muted-foreground">{result} — data now syncs across devices</p>
    }
    return null
  }

  const migrate = async () => {
    setStatus("migrating")
    try {
      const { cards, sessions } = await migrateFromLocalStorage()
      setResult(`Imported ${cards} cards and ${sessions} sessions`)
      setStatus("done")
      setHasLocalData(false)
      onMigrated?.()
    } catch {
      setResult("Migration failed — try again")
      setStatus("idle")
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={migrate}
        disabled={status === "migrating"}
        className="text-muted-foreground text-xs"
      >
        <Database className="h-3 w-3 mr-1" />
        {status === "migrating" ? "Migrating…" : "Import local data to cloud"}
      </Button>
      {result && <span className="text-xs text-muted-foreground">{result}</span>}
    </div>
  )
}
