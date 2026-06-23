"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Skeleton } from "@/components/ui/skeleton"
import { KpiCard } from "@/components/kpi-card"
import { formatCurrency, formatNumber, formatDate } from "@/lib/formatters"
import { getStudents, getBrands, getRedemptions, getCategories, getAnalyticsEvents } from "@/services/data-service"
import type { Redemption, Brand, Category, Student } from "@/types"

const CHART_COLORS = {
  chart1: "var(--color-chart-1)",
  chart2: "var(--color-chart-2)",
  chart3: "var(--color-chart-3)",
  chart4: "var(--color-chart-4)",
  chart5: "var(--color-chart-5)",
}

const PIE_COLORS = [CHART_COLORS.chart1, CHART_COLORS.chart2, CHART_COLORS.chart3, CHART_COLORS.chart4, CHART_COLORS.chart5]

export default function DashboardPage() {
  const [loading, setLoading] = React.useState(true)
  const [students, setStudents] = React.useState<Student[]>([])
  const [brands, setBrands] = React.useState<Brand[]>([])
  const [categories, setCategories] = React.useState<Category[]>([])
  const [redemptions, setRedemptions] = React.useState<Redemption[]>([])
  const [activityByDay, setActivityByDay] = React.useState<{ day: string; active: number }[]>([])

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [s, b, r, c, events] = await Promise.all([
          getStudents(), getBrands(), getRedemptions(), getCategories(), getAnalyticsEvents(),
        ])
        if (cancelled) return
        setStudents(s); setBrands(b); setRedemptions(r); setCategories(c)

        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        const grouped: Record<string, Set<string>> = {}
        events.forEach((e) => {
          const day = dayNames[new Date(e.date).getDay()]
          if (!grouped[day]) grouped[day] = new Set()
          grouped[day].add(e.student_id)
        })
        setActivityByDay(dayNames.filter((d) => grouped[d]).map((day) => ({ day, active: grouped[day].size })))
      } catch (err) { console.error("Failed to load dashboard data", err) }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const stats = React.useMemo(() => {
    const activeStudents = students.filter((s) => s.is_active)
    const nationalityCount: Record<string, number> = {}
    students.forEach((s) => { nationalityCount[s.nationality] = (nationalityCount[s.nationality] || 0) + 1 })
    const topEntry = Object.entries(nationalityCount).sort((a, b) => b[1] - a[1])[0]
    const totalAge = students.reduce((sum, s) => sum + s.age, 0)
    const totalEstimatedSpend = brands.reduce((sum, b) => sum + b.estimated_spend, 0)
    const totalStudentSavings = brands.reduce((sum, b) => sum + b.savings_generated, 0)
    const topBrand = [...brands].sort((a, b) => b.total_redemptions - a.total_redemptions)[0]?.name ?? ""
    return {
      totalStudents: students.length,
      activeStudents: activeStudents.length,
      totalRedemptions: redemptions.length,
      totalEstimatedSpend,
      totalStudentSavings,
      averageAge: students.length > 0 ? Math.round(totalAge / students.length) : 0,
      topNationality: topEntry?.[0] ?? "",
      topBrand,
    }
  }, [students, brands, redemptions])

  const redemptionsOverTime = React.useMemo(() => {
    const grouped: Record<string, number> = {}
    redemptions.forEach((r) => {
      const day = r.date.split("T")[0]
      grouped[day] = (grouped[day] || 0) + 1
    })
    return Object.entries(grouped).map(([date, count]) => ({ date, redemptions: count })).sort((a, b) => a.date.localeCompare(b.date))
  }, [redemptions])

  const brandPerformanceData = React.useMemo(() =>
    brands.slice(0, 8).map((b) => ({
      name: b.name.length > 12 ? b.name.slice(0, 12) + "..." : b.name,
      redemptions: b.total_redemptions,
    })), [brands])

  const categoryData = React.useMemo(() =>
    categories.map((c) => ({ name: c.name, redemptions: c.total_redemptions })), [categories])

  const savingsOverTime = React.useMemo(() =>
    groupRedemptionAmountByDate(redemptions, (r) => r.amount_saved, "savings"),
    [redemptions])

  const spendingOverTime = React.useMemo(() =>
    groupRedemptionAmountByDate(redemptions, (r) => r.discounted_price, "spending"),
    [redemptions])

  const studentMap = React.useMemo(() => new Map(students.map((s) => [s.id, s])), [students])
  const brandMap = React.useMemo(() => new Map(brands.map((b) => [b.id, b])), [brands])
  const categoryMap = React.useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  const recentRedemptions = React.useMemo(() =>
    redemptions.slice(-8).reverse().map((r) => {
      const student = studentMap.get(r.student_id)
      const brand = brandMap.get(r.brand_id)
      const category = categoryMap.get(r.category_id)
      return {
        ...r,
        studentName: student ? `Student ${student.id.slice(-3)}` : r.student_id,
        brandName: brand?.name ?? r.brand_id,
        categoryName: category?.name ?? r.category_id,
      }
    }), [redemptions, studentMap, brandMap, categoryMap])

  const redemptionsConfig = { redemptions: { label: "Redemptions", color: CHART_COLORS.chart1 } } satisfies ChartConfig
  const savingsConfig = { savings: { label: "Savings ($)", color: CHART_COLORS.chart2 } } satisfies ChartConfig
  const spendingConfig = { spending: { label: "Spending ($)", color: CHART_COLORS.chart3 } } satisfies ChartConfig
  const activityConfig = { active: { label: "Active Students", color: CHART_COLORS.chart4 } } satisfies ChartConfig
  const brandConfig = { redemptions: { label: "Redemptions", color: CHART_COLORS.chart1 } } satisfies ChartConfig
  const categoryConfig = { redemptions: { label: "Redemptions", color: CHART_COLORS.chart1 } } satisfies ChartConfig

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          High-level overview of the Student Verse platform
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <KpiCard title="Total Students" value={formatNumber(stats.totalStudents)} />
        <KpiCard title="Active Students" value={formatNumber(stats.activeStudents)} />
        <KpiCard title="Total Redemptions" value={formatNumber(stats.totalRedemptions)} />
        <KpiCard title="Total Estimated Spend" value={formatCurrency(stats.totalEstimatedSpend)} />
        <KpiCard title="Total Student Savings" value={formatCurrency(stats.totalStudentSavings)} />
        <KpiCard title="Average Age" value={stats.averageAge} />
        <KpiCard title="Top Nationality" value={stats.topNationality} />
        <KpiCard title="Top Brand" value={stats.topBrand} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Redemptions Over Time</CardTitle><CardDescription>Daily redemption volume</CardDescription></CardHeader>
          <CardContent>
            <ChartContainer config={redemptionsConfig} className="h-[250px] w-full">
              <AreaChart data={redemptionsOverTime} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <defs><linearGradient id="fillRedemptions" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-redemptions)" stopOpacity={0.3} /><stop offset="95%" stopColor="var(--color-redemptions)" stopOpacity={0} /></linearGradient></defs>
                <Area type="monotone" dataKey="redemptions" stroke="var(--color-redemptions)" fill="url(#fillRedemptions)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Student Savings Over Time</CardTitle><CardDescription>Estimated daily savings for students</CardDescription></CardHeader>
          <CardContent>
            <ChartContainer config={savingsConfig} className="h-[250px] w-full">
              <AreaChart data={savingsOverTime} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <defs><linearGradient id="fillSavings" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-savings)" stopOpacity={0.3} /><stop offset="95%" stopColor="var(--color-savings)" stopOpacity={0} /></linearGradient></defs>
                <Area type="monotone" dataKey="savings" stroke="var(--color-savings)" fill="url(#fillSavings)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Estimated Spending Over Time</CardTitle><CardDescription>Daily estimated spend by students</CardDescription></CardHeader>
          <CardContent>
            <ChartContainer config={spendingConfig} className="h-[250px] w-full">
              <AreaChart data={spendingOverTime} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <defs><linearGradient id="fillSpending" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-spending)" stopOpacity={0.3} /><stop offset="95%" stopColor="var(--color-spending)" stopOpacity={0} /></linearGradient></defs>
                <Area type="monotone" dataKey="spending" stroke="var(--color-spending)" fill="url(#fillSpending)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>User Activity by Day</CardTitle><CardDescription>Unique active students per day of week</CardDescription></CardHeader>
          <CardContent>
            <ChartContainer config={activityConfig} className="h-[250px] w-full">
              <BarChart data={activityByDay} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="active" fill="var(--color-active)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Brand Performance</CardTitle><CardDescription>Top brands by total redemptions</CardDescription></CardHeader>
          <CardContent>
            <ChartContainer config={brandConfig} className="h-[300px] w-full">
              <BarChart data={brandPerformanceData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} fontSize={12} width={100} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="redemptions" fill="var(--color-redemptions)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Category Performance</CardTitle><CardDescription>Redemptions by category</CardDescription></CardHeader>
          <CardContent>
            <ChartContainer config={categoryConfig} className="h-[300px] w-full">
              <PieChart>
                <Pie data={categoryData} dataKey="redemptions" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={60} paddingAngle={2}>
                  {categoryData.map((_, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recent Redemptions</CardTitle><CardDescription>Latest student redemptions</CardDescription></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead><TableHead>Brand</TableHead><TableHead>Category</TableHead><TableHead>Date</TableHead>
                    <TableHead className="text-right">Spent</TableHead><TableHead className="text-right">Saved</TableHead><TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRedemptions.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.studentName}</TableCell>
                      <TableCell>{r.brandName}</TableCell>
                      <TableCell>{r.categoryName}</TableCell>
                      <TableCell>{formatDate(r.date)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(r.discounted_price)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(r.amount_saved)}</TableCell>
                      <TableCell>
                        <Badge variant={r.status === "completed" ? "secondary" : r.status === "pending" ? "outline" : "destructive"}>{r.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top Brands</CardTitle><CardDescription>Highest performing brands</CardDescription></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Brand</TableHead><TableHead className="text-right">Redemptions</TableHead>
                    <TableHead className="text-right">Est. Spend</TableHead><TableHead className="text-right">Savings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brands.slice(0, 6).map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell className="text-right">{formatNumber(b.total_redemptions)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(b.estimated_spend)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(b.savings_generated)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[250px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function groupRedemptionAmountByDate<K extends string>(
  redemptions: Redemption[],
  selector: (redemption: Redemption) => number,
  valueKey: K
): ({ date: string } & Record<K, number>)[] {
  const grouped: Record<string, number> = {}

  redemptions.forEach((redemption) => {
    const day = redemption.date.split("T")[0]
    grouped[day] = (grouped[day] || 0) + selector(redemption)
  })

  return Object.entries(grouped)
    .map(([date, value]) => ({
      date,
      [valueKey]: Math.round(value * 100) / 100,
    } as { date: string } & Record<K, number>))
    .sort((a, b) => a.date.localeCompare(b.date))
}
