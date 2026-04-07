"use client"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { getHeatmapData } from "@/lib/stats"
import type { ReviewLog } from "@/lib/storage"

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function intensity(count: number): string {
  if (count === 0) return "bg-muted/40"
  if (count < 5)  return "bg-primary/30"
  if (count < 10) return "bg-primary/55"
  if (count < 20) return "bg-primary/80"
  return "bg-primary"
}

interface ActivityHeatmapProps {
  log: ReviewLog
  weeks?: number
}

export function ActivityHeatmap({ log, weeks = 16 }: ActivityHeatmapProps) {
  const days = getHeatmapData(log, weeks)

  // Group into columns of 7 (each column = one week, Sun→Sat)
  const columns: typeof days[number][][] = []
  for (let i = 0; i < days.length; i += 7) {
    columns.push(days.slice(i, i + 7))
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1">
          {DAY_LABELS.map((d) => (
            <div key={d} className="h-3 w-6 text-[9px] text-muted-foreground flex items-center">
              {d[0]}
            </div>
          ))}
        </div>

        {/* Week columns */}
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-1">
            {col.map((day) => (
              <Tooltip key={day.date}>
                <TooltipTrigger>
                  <div
                    className={`h-3 w-3 rounded-sm cursor-default transition-colors ${intensity(day.count)}`}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {day.count > 0
                    ? `${day.count} review${day.count !== 1 ? "s" : ""} on ${day.date}`
                    : `No reviews on ${day.date}`}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <span>Less</span>
        {["bg-muted/40", "bg-primary/30", "bg-primary/55", "bg-primary/80", "bg-primary"].map((c) => (
          <div key={c} className={`h-3 w-3 rounded-sm ${c}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
