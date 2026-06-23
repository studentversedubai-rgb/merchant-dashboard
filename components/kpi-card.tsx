import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  title: string
  value: string | number
  trend?: number
  trendLabel?: string
  className?: string
}

export const KpiCard = React.memo(function KpiCard({ title, value, trend, trendLabel, className }: KpiCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{value}</span>
          {trend !== undefined && (
            <Badge
              variant={trend >= 0 ? "secondary" : "destructive"}
              className={cn(
                "text-xs",
                trend >= 0 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : ""
              )}
            >
              {trend >= 0 ? "+" : ""}{trend}%
            </Badge>
          )}
        </div>
        {trendLabel && (
          <p className="mt-1 text-xs text-muted-foreground">{trendLabel}</p>
        )}
      </CardContent>
    </Card>
  )
})
