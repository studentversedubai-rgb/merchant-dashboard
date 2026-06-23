"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, ComposedChart, Line, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { KpiCard } from "@/components/kpi-card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/formatters"
import { getRedemptions, getStudents, getBrands, getCategories } from "@/services/data-service"
import type { Redemption, Student, Brand, Category } from "@/types"

export default function SpendingInsightsPage() {
  const [loading, setLoading] = React.useState(true)
  const [redemptions, setRedemptions] = React.useState<Redemption[]>([])
  const [students, setStudents] = React.useState<Student[]>([])
  const [brands, setBrands] = React.useState<Brand[]>([])
  const [categories, setCategories] = React.useState<Category[]>([])

  React.useEffect(() => {
    let cancelled = false
    Promise.all([getRedemptions(), getStudents(), getBrands(), getCategories()])
      .then(([r, s, b, c]) => { if (!cancelled) { setRedemptions(r); setStudents(s); setBrands(b); setCategories(c); setLoading(false) } })
      .catch((err) => { console.error("Failed to load spending data", err); if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const { completed, totalSpent, totalSaved, totalOriginal, avgMonthlySpend, avgMonthlySavings, spendByNation, savingsByCat, spentSavingsData } = React.useMemo(() => {
    const completed = redemptions.filter((r) => r.status === "completed")
    const totalSpent = completed.reduce((s, r) => s + r.discounted_price, 0)
    const totalSaved = completed.reduce((s, r) => s + r.amount_saved, 0)
    const totalOriginal = completed.reduce((s, r) => s + r.original_price, 0)
    const activeStudents = students.filter((s) => s.is_active).length || 1
    const avgMonthlySpend = totalSpent / activeStudents
    const avgMonthlySavings = totalSaved / activeStudents

    const spendByNation: Record<string, number> = {}
    const savingsByCat: Record<string, number> = {}

    completed.forEach((r) => {
      const student = students.find((s) => s.id === r.student_id)
      const cat = categories.find((c) => c.id === r.category_id)
      if (student) spendByNation[student.nationality] = (spendByNation[student.nationality] || 0) + r.discounted_price
      if (cat) savingsByCat[cat.name] = (savingsByCat[cat.name] || 0) + r.amount_saved
    })

    const spentSavingsData = completed.slice(0, 10).map((r, i) => ({
      label: `#${i + 1}`,
      spent: r.discounted_price,
      saved: r.amount_saved,
      potential: r.original_price,
    }))

    return { completed, totalSpent, totalSaved, totalOriginal, avgMonthlySpend, avgMonthlySavings, spendByNation, savingsByCat, spentSavingsData }
  }, [redemptions, students, categories])

  const config = { spend: { label: "Spent ($)", color: "var(--color-chart-1)" }, savings: { label: "Saved ($)", color: "var(--color-chart-2)" }, potential: { label: "Could Have Spent ($)", color: "var(--color-chart-3)" } } satisfies ChartConfig

  if (loading) return <PageSkeleton />

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Spending Insights</h1>
        <p className="text-sm text-muted-foreground">Student spending and saving behavior analysis</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard title="Avg Monthly Spend" value={formatCurrency(avgMonthlySpend)} />
        <KpiCard title="Avg Monthly Savings" value={formatCurrency(avgMonthlySavings)} />
        <KpiCard title="Total Market Spend" value={formatCurrency(totalSpent)} />
        <KpiCard title="Total Student Savings" value={formatCurrency(totalSaved)} />
        <KpiCard title="Could Have Spent" value={formatCurrency(totalOriginal)} />
      </div>

      <Card>
        <CardHeader><CardTitle>Potential vs Actual Spend</CardTitle><CardDescription>"Could have spent" vs "Spent" vs "Saved" per redemption</CardDescription></CardHeader>
        <CardContent>
          <ChartContainer config={config} className="h-[300px] w-full">
            <ComposedChart data={spentSavingsData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="potential" fill="var(--color-potential)" radius={[4, 4, 0, 0]} opacity={0.3} />
              <Bar dataKey="spent" fill="var(--color-spend)" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="saved" stroke="var(--color-savings)" strokeWidth={2} />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Spend by Nationality</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={config} className="h-[250px] w-full">
              <BarChart data={Object.entries(spendByNation).map(([name, value]) => ({ name, value }))} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-spend)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Savings by Category</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={config} className="h-[250px] w-full">
              <BarChart data={Object.entries(savingsByCat).map(([name, value]) => ({ name, value }))} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-savings)" radius={[4, 4, 0, 0]} />
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (<Card key={i}><CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-20" /></CardContent></Card>))}
      </div>
    </div>
  )
}
