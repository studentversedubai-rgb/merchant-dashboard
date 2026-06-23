"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { KpiCard } from "@/components/kpi-card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatNumber } from "@/lib/formatters"
import { getCategories } from "@/services/data-service"
import type { Category } from "@/types"

const PIE_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"]

export default function CategoriesPage() {
  const [loading, setLoading] = React.useState(true)
  const [categories, setCategories] = React.useState<Category[]>([])

  React.useEffect(() => {
    let cancelled = false
    getCategories()
      .then((data) => { if (!cancelled) { setCategories(data); setLoading(false) } })
      .catch((err) => { console.error("Failed to load categories", err); if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const { topCat, highestSpend, highestSavings, avgRedemptions } = React.useMemo(() => {
    const topCat = [...categories].sort((a, b) => b.total_redemptions - a.total_redemptions)[0]
    const highestSpend = [...categories].sort((a, b) => b.estimated_spend - a.estimated_spend)[0]
    const highestSavings = [...categories].sort((a, b) => b.estimated_savings - a.estimated_savings)[0]
    const avgRedemptions = categories.length > 0 ? Math.round(categories.reduce((s, c) => s + c.total_redemptions, 0) / categories.length) : 0
    return { topCat, highestSpend, highestSavings, avgRedemptions }
  }, [categories])

  const config = { redemptions: { label: "Redemptions", color: "var(--color-chart-1)" } } satisfies ChartConfig

  if (loading) return <PageSkeleton />

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <p className="text-sm text-muted-foreground">Category performance and demand analysis</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard title="Total Categories" value={formatNumber(categories.length)} />
        <KpiCard title="Top Category" value={topCat?.name ?? ""} />
        <KpiCard title="Avg Redemptions/Category" value={formatNumber(avgRedemptions)} />
        <KpiCard title="Highest Spend" value={highestSpend?.name ?? ""} />
        <KpiCard title="Highest Savings" value={highestSavings?.name ?? ""} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Redemptions by Category</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={config} className="h-[300px] w-full">
              <PieChart>
                <Pie data={categories.map((c) => ({ name: c.name, value: c.total_redemptions }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={60}>
                  {categories.map((_, i) => (<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Spend vs Savings by Category</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{ spend: { label: "Est. Spend", color: "var(--color-chart-1)" }, savings: { label: "Est. Savings", color: "var(--color-chart-2)" } }} className="h-[300px] w-full">
              <BarChart data={categories} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="estimated_spend" fill="var(--color-spend)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="estimated_savings" fill="var(--color-savings)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>All Categories</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Total Redemptions</TableHead>
                  <TableHead className="text-right">Avg Redemptions</TableHead>
                  <TableHead className="text-right">Est. Spend</TableHead>
                  <TableHead className="text-right">Est. Savings</TableHead>
                  <TableHead>Top Brand</TableHead>
                  <TableHead>Top Nationality</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-right">{formatNumber(c.total_redemptions)}</TableCell>
                    <TableCell className="text-right">{formatNumber(c.average_redemptions)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(c.estimated_spend)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(c.estimated_savings)}</TableCell>
                    <TableCell>{c.top_brand}</TableCell>
                    <TableCell>{c.most_active_nationality}</TableCell>
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

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div><Skeleton className="h-8 w-40" /><Skeleton className="h-4 w-56 mt-2" /></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (<Card key={i}><CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-20" /></CardContent></Card>))}
      </div>
    </div>
  )
}
