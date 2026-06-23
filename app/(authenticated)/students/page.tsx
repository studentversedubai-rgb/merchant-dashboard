"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { KpiCard } from "@/components/kpi-card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatNumber } from "@/lib/formatters"
import { getStudents } from "@/services/data-service"
import type { Student } from "@/types"
import { RiMore2Line } from "@remixicon/react"

const PIE_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"]

export default function StudentsPage() {
  const [loading, setLoading] = React.useState(true)
  const [students, setStudents] = React.useState<Student[]>([])

  React.useEffect(() => {
    let cancelled = false
    getStudents()
      .then((data) => { if (!cancelled) { setStudents(data); setLoading(false) } })
      .catch((err) => { console.error("Failed to load students", err); if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div><Skeleton className="h-8 w-40" /><Skeleton className="h-4 w-56 mt-2" /></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 5 }).map((_, i) => (<Card key={i}><CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-20" /></CardContent></Card>))}
        </div>
        <Card><CardContent className="p-6"><Skeleton className="h-[300px] w-full" /></CardContent></Card>
      </div>
    )
  }

  const totalStudents = students.length
  const avgAge = totalStudents > 0 ? Math.round(students.reduce((s, st) => s + st.age, 0) / totalStudents) : 0
  const nationalityCount: Record<string, number> = {}
  const universityCount: Record<string, number> = {}
  const cityCount: Record<string, number> = {}
  students.forEach((s) => {
    nationalityCount[s.nationality] = (nationalityCount[s.nationality] || 0) + 1
    universityCount[s.university] = (universityCount[s.university] || 0) + 1
    cityCount[s.city] = (cityCount[s.city] || 0) + 1
  })
  const topNation = Object.entries(nationalityCount).sort((a, b) => b[1] - a[1])[0]
  const topUni = Object.entries(universityCount).sort((a, b) => b[1] - a[1])[0]
  const topC = Object.entries(cityCount).sort((a, b) => b[1] - a[1])[0]
  const topNationality = topNation?.[0] ?? ""
  const topUniversity = topUni?.[0] ?? ""
  const topCity = topC?.[0] ?? ""

  const nationalityData = Object.entries(nationalityCount).map(([name, value]) => ({ name, value }))
  const nationalityDetails = [...nationalityData].sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
  const universityData = Object.entries(universityCount).map(([name, value]) => ({ name: name.length > 18 ? name.slice(0, 18) + "..." : name, value })).sort((a, b) => b.value - a.value)
  const cityData = Object.entries(cityCount).map(([name, value]) => ({ name, value }))
  const ageGroups = [
    { range: "18-19", count: students.filter((s) => s.age >= 18 && s.age <= 19).length },
    { range: "20-21", count: students.filter((s) => s.age >= 20 && s.age <= 21).length },
    { range: "22-23", count: students.filter((s) => s.age >= 22 && s.age <= 23).length },
    { range: "24-25", count: students.filter((s) => s.age >= 24 && s.age <= 25).length },
  ]

  const nationalityConfig = { value: { label: "Students", color: "var(--color-chart-1)" } } satisfies ChartConfig
  const uniConfig = { value: { label: "Students", color: "var(--color-chart-2)" } } satisfies ChartConfig
  const ageConfig = { count: { label: "Students", color: "var(--color-chart-3)" } } satisfies ChartConfig

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Students</h1>
        <p className="text-sm text-muted-foreground">Student demographics and behavior analysis</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard title="Total Students" value={formatNumber(totalStudents)} />
        <KpiCard title="Average Age" value={avgAge} />
        <KpiCard title="Top Nationality" value={topNationality} />
        <KpiCard title="Top University" value={topUniversity.length > 18 ? topUniversity.slice(0, 18) + "..." : topUniversity} />
        <KpiCard title="Top City" value={topCity} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Students by Nationality</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <RiMore2Line data-icon="inline-start" />
                  More
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Students by Nationality</DialogTitle>
                  <DialogDescription>
                    Complete nationality breakdown sorted by student count.
                  </DialogDescription>
                </DialogHeader>
                <ol className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto pr-2 text-sm">
                  {nationalityDetails.map((item, index) => (
                    <li key={item.name} className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2">
                      <span className="font-medium">
                        {index + 1}. {item.name}
                      </span>
                      <span className="text-muted-foreground">[{formatNumber(item.value)}]</span>
                    </li>
                  ))}
                </ol>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <ChartContainer config={nationalityConfig} className="h-[250px] w-full">
              <PieChart>
                <Pie data={nationalityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                  {nationalityData.map((_, i) => (<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Students by Age Group</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={ageConfig} className="h-[250px] w-full">
              <BarChart data={ageGroups} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="range" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Students by University</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={uniConfig} className="h-[250px] w-full">
              <BarChart data={universityData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} fontSize={12} width={120} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Students by City</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={nationalityConfig} className="h-[250px] w-full">
              <BarChart data={cityData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-chart-4)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>All Students</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Nationality</TableHead>
                  <TableHead>University</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead className="text-right">Redemptions</TableHead>
                  <TableHead className="text-right">Monthly Spend</TableHead>
                  <TableHead className="text-right">Monthly Savings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.id}</TableCell>
                    <TableCell>{s.age}</TableCell>
                    <TableCell>{s.nationality}</TableCell>
                    <TableCell>{s.university}</TableCell>
                    <TableCell>{s.city}</TableCell>
                    <TableCell className="text-right">{formatNumber(s.total_redemptions)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(s.estimated_monthly_spend)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(s.estimated_monthly_savings)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
