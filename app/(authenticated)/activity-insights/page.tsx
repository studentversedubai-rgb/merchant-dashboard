"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, Line, LineChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { KpiCard } from "@/components/kpi-card"
import { Skeleton } from "@/components/ui/skeleton"
import { getRedemptions, getAnalyticsEvents, getStudents } from "@/services/data-service"

interface ActivityData {
  weekdayActivity: { day: string; active: number }[]
  weekdayRedemptions: { day: string; redemptions: number }[]
  hourData: { hour: string; events: number }[]
  newVsReturning: { day: string; new: number; returning: number }[]
  maxActivityDay: { day: string; active: number }
  maxRedeemDay: { day: string; redemptions: number }
  maxHour: { hour: string; events: number }
}

export default function ActivityInsightsPage() {
  const [loading, setLoading] = React.useState(true)
  const [activityData, setActivityData] = React.useState<ActivityData | null>(null)

  React.useEffect(() => {
    let cancelled = false
    Promise.all([getRedemptions(), getAnalyticsEvents(), getStudents()])
      .then(([rdms, events, students]) => {
        if (cancelled) return
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        const hourLabels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`)

        const redemptionDay: Record<string, number> = {}
        const activityDay: Record<string, Set<string>> = {}
        const activityHour: Record<string, number> = {}
        const newUsersDay: Record<string, number> = {}
        const returningDay: Record<string, number> = {}

        dayNames.forEach((d) => { redemptionDay[d] = 0; activityDay[d] = new Set(); activityHour[d] = 0; newUsersDay[d] = 0; returningDay[d] = 0 })

        rdms.forEach((r) => {
          const d = new Date(r.date)
          const day = dayNames[d.getDay()]
          redemptionDay[day] = (redemptionDay[day] || 0) + 1
        })

        events.forEach((e) => {
          const d = new Date(e.date)
          const day = dayNames[d.getDay()]
          if (!activityDay[day]) activityDay[day] = new Set()
          activityDay[day].add(e.student_id)
          const hour = d.getHours()
          activityHour[`${hour.toString().padStart(2, "0")}:00`] = (activityHour[`${hour.toString().padStart(2, "0")}:00`] || 0) + 1
        })

        students.forEach((s) => {
          const d = new Date(s.created_at)
          const day = dayNames[d.getDay()]
          if (s.is_active) {
            returningDay[day] = (returningDay[day] || 0) + 1
          } else {
            newUsersDay[day] = (newUsersDay[day] || 0) + 1
          }
        })

        const weekdayActivity = dayNames.map((day) => ({ day, active: activityDay[day]?.size || 0 }))
        const weekdayRedemptions = dayNames.map((day) => ({ day, redemptions: redemptionDay[day] || 0 }))
        const hourData = hourLabels.map((hour) => ({ hour, events: activityHour[hour] || 0 }))
        const newVsReturning = dayNames.map((day) => ({ day, new: newUsersDay[day] || 0, returning: returningDay[day] || 0 }))

        const maxActivityDay = [...weekdayActivity].sort((a, b) => b.active - a.active)[0]
        const maxRedeemDay = [...weekdayRedemptions].sort((a, b) => b.redemptions - a.redemptions)[0]
        const maxHour = [...hourData].sort((a, b) => b.events - a.events)[0]

        setActivityData({ weekdayActivity, weekdayRedemptions, hourData, newVsReturning, maxActivityDay, maxRedeemDay, maxHour })
        setLoading(false)
      })
      .catch((err) => { console.error("Failed to load activity data", err); if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (loading) return <PageSkeleton />
  if (!activityData) return null

  const config = { active: { label: "Active Students", color: "var(--color-chart-1)" }, redemptions: { label: "Redemptions", color: "var(--color-chart-2)" }, events: { label: "Events", color: "var(--color-chart-3)" }, new: { label: "New", color: "var(--color-chart-4)" }, returning: { label: "Returning", color: "var(--color-chart-5)" } } satisfies ChartConfig

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activity Insights</h1>
        <p className="text-sm text-muted-foreground">When students are most active on the platform</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Most Active Day" value={activityData.maxActivityDay?.day ?? ""} />
        <KpiCard title="Peak Redemption Day" value={activityData.maxRedeemDay?.day ?? ""} />
        <KpiCard title="Peak Activity Hour" value={activityData.maxHour?.hour ?? ""} />
        <KpiCard title="Peak Activity Period" value={activityData.maxHour ? `${parseInt(activityData.maxHour.hour) >= 12 ? "Afternoon" : "Morning"}` : ""} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Activity by Day of Week</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={config} className="h-[250px] w-full">
              <BarChart data={activityData.weekdayActivity} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="active" fill="var(--color-active)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Redemptions by Day of Week</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={config} className="h-[250px] w-full">
              <BarChart data={activityData.weekdayRedemptions} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="redemptions" fill="var(--color-redemptions)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Activity by Hour</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={config} className="h-[250px] w-full">
              <BarChart data={activityData.hourData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} interval={3} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="events" fill="var(--color-events)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>New vs Returning Active Users</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={config} className="h-[250px] w-full">
              <BarChart data={activityData.newVsReturning} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="new" fill="var(--color-new)" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="returning" fill="var(--color-returning)" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div><Skeleton className="h-8 w-40" /><Skeleton className="h-4 w-56 mt-2" /></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => (<Card key={i}><CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-20" /></CardContent></Card>))}</div>
    </div>
  )
}
