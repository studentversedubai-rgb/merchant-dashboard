"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  Legend,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { KpiCard } from "@/components/kpi-card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatNumber, formatDate } from "@/lib/formatters"
import { getRedemptions, getBrands, getCategories, getStudents } from "@/services/data-service"
import type { Redemption, Brand, Category, Student } from "@/types"

const PIE_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"]

export default function RedemptionsPage() {
  const [loading, setLoading] = React.useState(true)
  const [redemptions, setRedemptions] = React.useState<Redemption[]>([])
  const [brands, setBrands] = React.useState<Brand[]>([])
  const [categories, setCategories] = React.useState<Category[]>([])
  const [students, setStudents] = React.useState<Student[]>([])
  const [filterBrand, setFilterBrand] = React.useState("all")
  const [filterCategory, setFilterCategory] = React.useState("all")

  React.useEffect(() => {
    let cancelled = false
    Promise.all([getRedemptions(), getBrands(), getCategories(), getStudents()])
      .then(([r, b, c, s]) => {
        if (cancelled) return; setRedemptions(r); setBrands(b); setCategories(c); setStudents(s); setLoading(false)
      })
      .catch((err) => { console.error("Failed to load redemptions", err); if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const filtered = React.useMemo(() =>
    redemptions.filter((r) => {
      if (filterBrand !== "all" && r.brand_id !== filterBrand) return false
      if (filterCategory !== "all" && r.category_id !== filterCategory) return false
      return true
    }), [redemptions, filterBrand, filterCategory])

  const brandMap = React.useMemo(() => Object.fromEntries(brands.map((b) => [b.id, b.name])), [brands])
  const catMap = React.useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.name])), [categories])
  const dayNames = React.useMemo(() => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], [])

  const derivedData = React.useMemo(() => {
    const completed = filtered.filter((r) => r.status === "completed")
    const totalCompleted = completed.length
    const avgValue = totalCompleted > 0 ? completed.reduce((s, r) => s + r.discounted_price, 0) / totalCompleted : 0

    const brandCount: Record<string, number> = {}
    const catCount: Record<string, number> = {}
    const dayCount: Record<string, number> = {}
    let maxBrandId = ""; let maxBrandCount = 0
    let maxCatId = ""; let maxCatCount = 0

    filtered.forEach((r) => {
      brandCount[r.brand_id] = (brandCount[r.brand_id] || 0) + 1
      catCount[r.category_id] = (catCount[r.category_id] || 0) + 1
      const day = dayNames[new Date(r.date).getDay()]
      dayCount[day] = (dayCount[day] || 0) + 1
      if (brandCount[r.brand_id] > maxBrandCount) { maxBrandCount = brandCount[r.brand_id]; maxBrandId = r.brand_id }
      if (catCount[r.category_id] > maxCatCount) { maxCatCount = catCount[r.category_id]; maxCatId = r.category_id }
    })

    const brandChartData = Object.entries(brandCount)
      .map(([id, count]) => ({ name: brandMap[id] || id, redemptions: count }))
      .sort((a, b) => b.redemptions - a.redemptions).slice(0, 8)

    const catChartData = Object.entries(catCount)
      .map(([id, count]) => ({ name: catMap[id] || id, redemptions: count }))

    const weekdayData = dayNames.map((day) => ({ day, redemptions: dayCount[day] || 0 }))

    const grouped: Record<string, number> = {}
    filtered.forEach((r) => {
      const d = r.date.split("T")[0]
      grouped[d] = (grouped[d] || 0) + 1
    })
    const timeData = Object.entries(grouped).map(([date, redemptions]) => ({ date, redemptions })).sort((a, b) => a.date.localeCompare(b.date))

    return {
      completed, totalCompleted, avgValue,
      brandChartData, catChartData, weekdayData, timeData,
      topBrandName: brandMap[maxBrandId] || "N/A",
      topCatName: catMap[maxCatId] || "N/A",
    }
  }, [filtered, brandMap, catMap, dayNames])

  const { completed, totalCompleted, avgValue, brandChartData, catChartData, weekdayData, timeData, topBrandName, topCatName } = derivedData

  const config = { redemptions: { label: "Redemptions", color: "var(--color-chart-1)" } } satisfies ChartConfig

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div><Skeleton className="h-8 w-40" /><Skeleton className="h-4 w-56 mt-2" /></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (<Card key={i}><CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-20" /></CardContent></Card>))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Redemptions</h1>
        <p className="text-sm text-muted-foreground">Track what students are redeeming</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard title="Total Redemptions" value={formatNumber(filtered.length)} />
        <KpiCard title="Completed" value={formatNumber(totalCompleted)} />
        <KpiCard title="Top Brand" value={topBrandName} />
        <KpiCard title="Top Category" value={topCatName} />
        <KpiCard title="Avg Redemption Value" value={formatCurrency(avgValue)} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={filterBrand} onValueChange={setFilterBrand}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Brands" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map((b) => (<SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Redemptions Over Time</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={config} className="h-[250px] w-full">
              <LineChart data={timeData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="redemptions" stroke="var(--color-redemptions)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Redemptions by Weekday</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={config} className="h-[250px] w-full">
              <BarChart data={weekdayData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="redemptions" fill="var(--color-redemptions)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Redemptions by Brand</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={config} className="h-[250px] w-full">
              <BarChart data={brandChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
          <CardHeader><CardTitle>Redemptions by Category</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={config} className="h-[250px] w-full">
              <PieChart>
                <Pie data={catChartData} dataKey="redemptions" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                  {catChartData.map((_, i) => (<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>All Redemptions</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Original</TableHead>
                  <TableHead className="text-right">Discounted</TableHead>
                  <TableHead className="text-right">Saved</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice().reverse().map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.id}</TableCell>
                    <TableCell>{`Student ${r.student_id.slice(-3)}`}</TableCell>
                    <TableCell>{brandMap[r.brand_id] || r.brand_id}</TableCell>
                    <TableCell>{catMap[r.category_id] || r.category_id}</TableCell>
                    <TableCell>{formatDate(r.date)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(r.original_price)}</TableCell>
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
    </div>
  )
}


