"use client"

import { Button } from "@/components/ui/button"
import type { SRSGrade } from "@/lib/types"

const GRADES: { grade: SRSGrade; label: string; description: string; className: string }[] = [
  {
    grade: 3,
    label: "Forgot",
    description: "Had to flip it",
    className: "border-red-500/40 text-red-400 hover:bg-red-500/10",
  },
  {
    grade: 4,
    label: "Good",
    description: "Some idea",
    className: "border-blue-500/40 text-blue-400 hover:bg-blue-500/10",
  },
  {
    grade: 5,
    label: "Easy",
    description: "Was sure",
    className: "border-green-500/40 text-green-400 hover:bg-green-500/10",
  },
]

interface SRSControlsProps {
  onGrade: (grade: SRSGrade) => void
}

export function SRSControls({ onGrade }: SRSControlsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-xl mx-auto">
      {GRADES.map(({ grade, label, description, className }) => (
        <Button
          key={grade}
          variant="outline"
          className={`flex flex-col h-auto py-3 gap-0.5 ${className}`}
          onClick={() => onGrade(grade)}
        >
          <span className="font-semibold text-sm">{label}</span>
          <span className="text-[10px] font-normal opacity-70">{description}</span>
        </Button>
      ))}
    </div>
  )
}
