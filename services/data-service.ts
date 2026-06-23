import type {
  Student,
  Brand,
  Category,
  Offer,
  Redemption,
  AnalyticsEvent,
  Report,
  Notification,
} from "@/types"

type DashboardResource =
  | "students"
  | "brands"
  | "categories"
  | "offers"
  | "redemptions"
  | "analytics-events"
  | "reports"
  | "notifications"

let hasShownSupabaseKeyAlert = false

async function fetchDashboardResource<T>(
  resource: DashboardResource
): Promise<T[]> {
  const response = await fetch(`/api/dashboard-data/${resource}`, {
    cache: "no-store",
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      code?: string
      error?: string
    } | null

    if (
      payload?.code === "SUPABASE_KEY_MISSING" &&
      typeof window !== "undefined" &&
      !hasShownSupabaseKeyAlert
    ) {
      hasShownSupabaseKeyAlert = true
      window.alert("Supabase API key is not configured.")
    }

    throw new Error(payload?.error ?? `Failed to load ${resource}`)
  }

  return (await response.json()) as T[]
}

export function getStudents(): Promise<Student[]> {
  return fetchDashboardResource<Student>("students")
}

export function getBrands(): Promise<Brand[]> {
  return fetchDashboardResource<Brand>("brands")
}

export function getCategories(): Promise<Category[]> {
  return fetchDashboardResource<Category>("categories")
}

export function getOffers(): Promise<Offer[]> {
  return fetchDashboardResource<Offer>("offers")
}

export function getRedemptions(): Promise<Redemption[]> {
  return fetchDashboardResource<Redemption>("redemptions")
}

export function getAnalyticsEvents(): Promise<AnalyticsEvent[]> {
  return fetchDashboardResource<AnalyticsEvent>("analytics-events")
}

export function getReports(): Promise<Report[]> {
  return fetchDashboardResource<Report>("reports")
}

export function getNotifications(): Promise<Notification[]> {
  return fetchDashboardResource<Notification>("notifications")
}

export function getActiveStudents(): Promise<Student[]> {
  return getStudents().then((students) =>
    students.filter((s) => s.is_active)
  )
}

export function getBrandById(id: string): Promise<Brand | undefined> {
  return getBrands().then((brands) => brands.find((b) => b.id === id))
}

export function getCategoryById(id: string): Promise<Category | undefined> {
  return getCategories().then((cats) => cats.find((c) => c.id === id))
}

export function getStudentById(id: string): Promise<Student | undefined> {
  return getStudents().then((students) => students.find((s) => s.id === id))
}

export function getRedemptionsByStudent(
  studentId: string
): Promise<Redemption[]> {
  return getRedemptions().then((rdms) =>
    rdms.filter((r) => r.student_id === studentId)
  )
}

export function getRedemptionsByBrand(brandId: string): Promise<Redemption[]> {
  return getRedemptions().then((rdms) =>
    rdms.filter((r) => r.brand_id === brandId)
  )
}

export function getRedemptionsByCategory(
  categoryId: string
): Promise<Redemption[]> {
  return getRedemptions().then((rdms) =>
    rdms.filter((r) => r.category_id === categoryId)
  )
}

export function getDashboardStats(): Promise<{
  totalStudents: number
  activeStudents: number
  totalRedemptions: number
  totalEstimatedSpend: number
  totalStudentSavings: number
  averageAge: number
  topNationality: string
  topBrand: string
}> {
  return Promise.all([
    getStudents(),
    getBrands(),
    getRedemptions(),
  ]).then(([students, brands, redemptions]) => {
    const activeStudents = students.filter((s) => s.is_active)
    const nationalityCount: Record<string, number> = {}
    students.forEach((s) => {
      nationalityCount[s.nationality] =
        (nationalityCount[s.nationality] || 0) + 1
    })
    const topNationality = Object.entries(nationalityCount).sort(
      (a, b) => b[1] - a[1]
    )[0][0]
    const totalAge = students.reduce((sum, s) => sum + s.age, 0)
    const totalEstimatedSpend = brands.reduce(
      (sum, b) => sum + b.estimated_spend,
      0
    )
    const totalSavings = brands.reduce(
      (sum, b) => sum + b.savings_generated,
      0
    )
    const topBrand = [...brands].sort(
      (a, b) => b.total_redemptions - a.total_redemptions
    )[0].name

    return {
      totalStudents: students.length,
      activeStudents: activeStudents.length,
      totalRedemptions: redemptions.length,
      totalEstimatedSpend,
      totalStudentSavings: totalSavings,
      averageAge: Math.round(totalAge / students.length),
      topNationality,
      topBrand,
    }
  })
}

export function getRedemptionsOverTime(): Promise<
  { date: string; redemptions: number }[]
> {
  return getRedemptions().then((rdms) => {
    const grouped: Record<string, number> = {}
    rdms.forEach((r) => {
      const day = r.date.split("T")[0]
      grouped[day] = (grouped[day] || 0) + 1
    })
    return Object.entries(grouped)
      .map(([date, redemptions]) => ({ date, redemptions }))
      .sort((a, b) => a.date.localeCompare(b.date))
  })
}

export function getActivityByDay(): Promise<
  { day: string; active: number }[]
> {
  return getAnalyticsEvents().then((events) => {
    const dayNames = [
      "Sunday", "Monday", "Tuesday", "Wednesday",
      "Thursday", "Friday", "Saturday",
    ]
    const grouped: Record<string, Set<string>> = {}
    events.forEach((e) => {
      const day = dayNames[new Date(e.date).getDay()]
      if (!grouped[day]) grouped[day] = new Set()
      grouped[day].add(e.student_id)
    })
    return dayNames
      .filter((d) => grouped[d])
      .map((day) => ({ day, active: grouped[day].size }))
  })
}
