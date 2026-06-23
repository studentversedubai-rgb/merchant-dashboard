"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
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
import { KpiCard } from "@/components/kpi-card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatNumber } from "@/lib/formatters"
import { getBrands } from "@/services/data-service"
import type { Brand } from "@/types"

export default function BrandsPage() {
  const [loading, setLoading] = React.useState(true)
  const [brands, setBrands] = React.useState<Brand[]>([])

  React.useEffect(() => {
    let cancelled = false
    getBrands()
      .then((data) => { if (!cancelled) { setBrands(data); setLoading(false) } })
      .catch((err) => { console.error("Failed to load brands", err); if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const { topRedeem, topSpend, topSavings, avgRedemptions } = React.useMemo(() => {
    const topRedeem = [...brands].sort((a, b) => b.total_redemptions - a.total_redemptions)[0]
    const topSpend = [...brands].sort((a, b) => b.estimated_spend - a.estimated_spend)[0]
    const topSavings = [...brands].sort((a, b) => b.savings_generated - a.savings_generated)[0]
    const avgRedemptions = brands.length > 0 ? Math.round(brands.reduce((s, b) => s + b.total_redemptions, 0) / brands.length) : 0
    return { topRedeem, topSpend, topSavings, avgRedemptions }
  }, [brands])

  const config = { redemptions: { label: "Redemptions", color: "var(--color-chart-1)" }, spend: { label: "Est. Spend", color: "var(--color-chart-2)" }, savings: { label: "Savings", color: "var(--color-chart-3)" } } satisfies ChartConfig

  if (loading) return <PageSkeleton />

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Brands</h1>
        <p className="text-sm text-muted-foreground">Brand performance analysis</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard title="Total Brands" value={formatNumber(brands.length)} />
        <KpiCard title="Top by Redemptions" value={topRedeem?.name ?? ""} />
        <KpiCard title="Top by Est. Spend" value={topSpend?.name ?? ""} />
        <KpiCard title="Top by Savings" value={topSavings?.name ?? ""} />
        <KpiCard title="Avg Redemptions/Brand" value={formatNumber(avgRedemptions)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Brand Redemptions</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={config} className="h-[300px] w-full">
              <BarChart data={brands.map((b) => ({ name: b.name.length > 14 ? b.name.slice(0, 14) + "..." : b.name, redemptions: b.total_redemptions }))} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={120} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="redemptions" fill="var(--color-redemptions)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Brand Est. Spend vs Savings</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={config} className="h-[300px] w-full">
              <BarChart data={brands.slice(0, 8).map((b) => ({ name: b.name.length > 14 ? b.name.slice(0, 14) + "..." : b.name, spend: b.estimated_spend, savings: b.savings_generated }))} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="spend" fill="var(--color-spend)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="savings" fill="var(--color-savings)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>All Brands</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Redemptions</TableHead>
                  <TableHead className="text-right">Est. Spend</TableHead>
                  <TableHead className="text-right">Savings</TableHead>
                  <TableHead className="text-right">Avg Discount</TableHead>
                  <TableHead>Top Nationality</TableHead>
                  <TableHead>Top University</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell>{b.category}</TableCell>
                    <TableCell className="text-right">{formatNumber(b.total_redemptions)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(b.estimated_spend)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(b.savings_generated)}</TableCell>
                    <TableCell className="text-right">{b.average_discount}%</TableCell>
                    <TableCell>{b.most_active_nationality}</TableCell>
                    <TableCell>{b.most_active_university}</TableCell>
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
      <div><Skeleton className="h-8 w-32" /><Skeleton className="h-4 w-48 mt-2" /></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (<Card key={i}><CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-20" /></CardContent></Card>))}
      </div>
    </div>
  )
}
