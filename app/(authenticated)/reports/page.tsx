"use client"

import * as React from "react"
import { RiArrowRightLine, RiFileList2Line } from "@remixicon/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDate } from "@/lib/formatters"
import { getReports } from "@/services/data-service"
import type { Report } from "@/types"
import { toast } from "sonner"

export default function ReportsPage() {
  const [loading, setLoading] = React.useState(true)
  const [reports, setReports] = React.useState<Report[]>([])

  React.useEffect(() => {
    let cancelled = false
    getReports()
      .then((data) => { if (!cancelled) { setReports(data); setLoading(false) } })
      .catch((err) => { console.error("Failed to load reports", err); if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (loading) return <PageSkeleton />

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">Sellable reports for company clients</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <RiFileList2Line className="size-8 text-primary" />
                <Badge variant={report.status === "ready" ? "secondary" : "outline"}>{report.status}</Badge>
              </div>
              <CardTitle className="mt-2 text-base">{report.name}</CardTitle>
              <CardDescription>Target: {report.target_company_type}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3">
              <div className="flex flex-wrap gap-1">
                {report.data_included.map((item) => (
                  <Badge key={item} variant="outline" className="text-xs">{item}</Badge>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between pt-3">
                <span className="text-lg font-bold">{formatCurrency(report.estimated_value)}</span>
                <Button size="sm" variant="outline" onClick={() => toast("Report export started")}>
                  Export <RiArrowRightLine data-icon="inline-end" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>All Reports</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Target Company</TableHead>
                  <TableHead>Data Included</TableHead>
                  <TableHead className="text-right">Est. Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.target_company_type}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{r.data_included.join(", ")}</TableCell>
                    <TableCell className="text-right">{formatCurrency(r.estimated_value)}</TableCell>
                    <TableCell><Badge variant={r.status === "ready" ? "secondary" : "outline"}>{r.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">Actions</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast("Viewing report")}>View</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast("Download started")}>Download</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast("Export started")}>Export</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div><Skeleton className="h-8 w-32" /><Skeleton className="h-4 w-48 mt-2" /></div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => (<Card key={i}><CardHeader><Skeleton className="h-8 w-24 mb-2" /><Skeleton className="h-5 w-40" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>))}</div>
    </div>
  )
}
