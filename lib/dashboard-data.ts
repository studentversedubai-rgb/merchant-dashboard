import type {
  AnalyticsEvent,
  Brand,
  Category,
  Notification,
  Offer,
  Redemption,
  Report,
  Student,
} from "@/types"

export type DashboardResource =
  | "students"
  | "brands"
  | "categories"
  | "offers"
  | "redemptions"
  | "analytics-events"
  | "reports"
  | "notifications"

type DashboardDataMap = {
  students: Student[]
  brands: Brand[]
  categories: Category[]
  offers: Offer[]
  redemptions: Redemption[]
  "analytics-events": AnalyticsEvent[]
  reports: Report[]
  notifications: Notification[]
}

type DbUser = {
  id: string
  university: string | null
  nationality: string | null
  age: number | null
  created_at: string | null
  logged_in: boolean | null
  last_active_at: string | null
}

type DbMerchant = {
  id: string
  name: string
  city: string | null
  is_active: boolean | null
}

type DbCategory = {
  id: string
  name: string
  is_active: boolean | null
}

type DbOffer = {
  id: string
  merchant_id: string | null
  category_id: string | null
  title: string
  original_price: number | string | null
  discounted_price: number | string | null
  discount_value: string | null
  is_active: boolean | null
}

type DbRedemption = {
  id: string
  offer_id: string
  merchant_id: string
  user_id: string
  total_bill_amount: number | string
  discount_amount: number | string
  final_amount: number | string
  redeemed_at: string | null
  is_voided: boolean | null
}

type DbUserActivityEvent = {
  id: number
  user_id: string
  event_type: string
  event_data: Record<string, unknown> | null
  created_at: string | null
}

type DbAnalyticsEvent = {
  id: string
  event_type: string
  event_data: Record<string, unknown> | null
  created_at: string | null
}

type SupabaseTable =
  | "users"
  | "merchants"
  | "categories"
  | "offers"
  | "redemptions"
  | "user_activity_events"
  | "analytics_events"

const SUPABASE_URL = "https://ewhraukiawfzrnstxxqa.supabase.co"
const ACTIVE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000

const dashboardResources = new Set<DashboardResource>([
  "students",
  "brands",
  "categories",
  "offers",
  "redemptions",
  "analytics-events",
  "reports",
  "notifications",
])

const tableNames: Record<SupabaseTable, string> = {
  users: process.env.SUPABASE_TABLE_USERS ?? "users",
  merchants: process.env.SUPABASE_TABLE_MERCHANTS ?? "merchants",
  categories: process.env.SUPABASE_TABLE_CATEGORIES ?? "categories",
  offers: process.env.SUPABASE_TABLE_OFFERS ?? "offers",
  redemptions: process.env.SUPABASE_TABLE_REDEMPTIONS ?? "redemptions",
  user_activity_events:
    process.env.SUPABASE_TABLE_USER_ACTIVITY_EVENTS ?? "user_activity_events",
  analytics_events:
    process.env.SUPABASE_TABLE_ANALYTICS_EVENTS ?? "analytics_events",
}

export function isDashboardResource(
  value: string
): value is DashboardResource {
  return dashboardResources.has(value as DashboardResource)
}

export async function getDashboardResource<T extends DashboardResource>(
  resource: T
): Promise<DashboardDataMap[T]> {
  if (!getSupabaseKey()) {
    throw new MissingSupabaseKeyError()
  }

  const data = await loadDashboardData()
  return data[resource]
}

async function loadDashboardData(): Promise<DashboardDataMap> {
  const [
    users,
    merchants,
    categories,
    offers,
    redemptions,
    userActivityEvents,
    analyticsEvents,
  ] = await Promise.all([
    selectSupabase<DbUser>("users"),
    selectSupabase<DbMerchant>("merchants"),
    selectSupabase<DbCategory>("categories"),
    selectSupabase<DbOffer>("offers"),
    selectSupabase<DbRedemption>("redemptions"),
    selectSupabase<DbUserActivityEvent>("user_activity_events"),
    selectSupabase<DbAnalyticsEvent>("analytics_events"),
  ])

  const userById = new Map(users.map((user) => [user.id, user]))
  const merchantById = new Map(merchants.map((merchant) => [merchant.id, merchant]))
  const categoryById = new Map(categories.map((category) => [category.id, category]))
  const offerById = new Map(offers.map((offer) => [offer.id, offer]))

  const dashboardOffers = mapOffers(offers)
  const dashboardRedemptions = mapRedemptions(redemptions, offerById)
  const dashboardStudents = mapStudents(users, dashboardRedemptions)
  const dashboardBrands = mapBrands(
    merchants,
    categories,
    offers,
    dashboardRedemptions,
    userById,
    categoryById
  )
  const dashboardCategories = mapCategories(
    categories,
    offers,
    dashboardRedemptions,
    userById,
    merchantById
  )
  const dashboardAnalyticsEvents = mapAnalyticsEvents(
    userActivityEvents,
    analyticsEvents
  )
  return {
    students: dashboardStudents,
    brands: dashboardBrands,
    categories: dashboardCategories,
    offers: dashboardOffers,
    redemptions: dashboardRedemptions,
    "analytics-events": dashboardAnalyticsEvents,
    reports: [],
    notifications: [],
  }
}

export class MissingSupabaseKeyError extends Error {
  constructor() {
    super("Supabase API key is not configured.")
    this.name = "MissingSupabaseKeyError"
  }
}

async function selectSupabase<T>(table: SupabaseTable): Promise<T[]> {
  const key = getSupabaseKey()

  if (!key) {
    throw new Error("Supabase key is not configured")
  }

  const baseUrl = process.env.SUPABASE_URL ?? SUPABASE_URL
  const tableName = tableNames[table]
  const url = new URL(`/rest/v1/${tableName}`, baseUrl)
  url.searchParams.set("select", "*")

  const response = await fetch(url, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Range: "0-9999",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(
      `Supabase ${tableName} query failed: ${response.status} ${message}`
    )
  }

  return (await response.json()) as T[]
}

function getSupabaseKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

function mapStudents(users: DbUser[], redemptions: Redemption[]): Student[] {
  const now = Date.now()

  return users.map((user) => {
    const userRedemptions = redemptions.filter(
      (redemption) => redemption.student_id === user.id
    )
    const monthlyRedemptions = userRedemptions.filter((redemption) => {
      const redeemedAt = new Date(redemption.date).getTime()
      return Number.isFinite(redeemedAt) && now - redeemedAt <= ACTIVE_WINDOW_MS
    })

    return {
      id: user.id,
      age: user.age ?? 0,
      nationality: user.nationality ?? "Unknown",
      university: user.university ?? "Unknown",
      city: "Unknown",
      total_redemptions: userRedemptions.length,
      estimated_monthly_spend: sumBy(
        monthlyRedemptions,
        (redemption) => redemption.discounted_price
      ),
      estimated_monthly_savings: sumBy(
        monthlyRedemptions,
        (redemption) => redemption.amount_saved
      ),
      created_at: user.created_at ?? new Date(0).toISOString(),
      is_active: Boolean(user.logged_in) || isRecent(user.last_active_at, now),
    }
  })
}

function mapBrands(
  merchants: DbMerchant[],
  categories: DbCategory[],
  offers: DbOffer[],
  redemptions: Redemption[],
  userById: Map<string, DbUser>,
  categoryById: Map<string, DbCategory>
): Brand[] {
  const offerByMerchant = groupBy(offers, (offer) => offer.merchant_id ?? "")

  return merchants.map((merchant) => {
    const merchantOffers = offerByMerchant.get(merchant.id) ?? []
    const merchantRedemptions = redemptions.filter(
      (redemption) => redemption.brand_id === merchant.id
    )
    const categoryId = mostCommon(
      merchantOffers.map((offer) => offer.category_id).filter(Boolean) as string[]
    )
    const totalOriginal = sumBy(
      merchantRedemptions,
      (redemption) => redemption.original_price
    )
    const totalSavings = sumBy(
      merchantRedemptions,
      (redemption) => redemption.amount_saved
    )

    return {
      id: merchant.id,
      name: merchant.name,
      category:
        categories.find((category) => category.id === categoryId)?.name ??
        categoryById.get(categoryId)?.name ??
        "Uncategorized",
      city: merchant.city ?? "Unknown",
      total_redemptions: merchantRedemptions.length,
      estimated_spend: sumBy(
        merchantRedemptions,
        (redemption) => redemption.discounted_price
      ),
      savings_generated: totalSavings,
      average_discount:
        totalOriginal > 0 ? Math.round((totalSavings / totalOriginal) * 100) : 0,
      most_active_nationality: mostCommonForRedemptions(
        merchantRedemptions,
        userById,
        (user) => user.nationality
      ),
      most_active_university: mostCommonForRedemptions(
        merchantRedemptions,
        userById,
        (user) => user.university
      ),
    }
  })
}

function mapCategories(
  categories: DbCategory[],
  offers: DbOffer[],
  redemptions: Redemption[],
  userById: Map<string, DbUser>,
  merchantById: Map<string, DbMerchant>
): Category[] {
  return categories.map((category) => {
    const categoryOffers = offers.filter((offer) => offer.category_id === category.id)
    const merchantIds = new Set(categoryOffers.map((offer) => offer.merchant_id))
    const categoryRedemptions = redemptions.filter(
      (redemption) => redemption.category_id === category.id
    )
    const brandId = mostCommon(categoryRedemptions.map((redemption) => redemption.brand_id))

    return {
      id: category.id,
      name: category.name,
      total_redemptions: categoryRedemptions.length,
      average_redemptions:
        merchantIds.size > 0
          ? Math.round(categoryRedemptions.length / merchantIds.size)
          : categoryRedemptions.length,
      estimated_spend: sumBy(
        categoryRedemptions,
        (redemption) => redemption.discounted_price
      ),
      estimated_savings: sumBy(
        categoryRedemptions,
        (redemption) => redemption.amount_saved
      ),
      top_brand: merchantById.get(brandId)?.name ?? "N/A",
      most_active_nationality: mostCommonForRedemptions(
        categoryRedemptions,
        userById,
        (user) => user.nationality
      ),
    }
  })
}

function mapOffers(offers: DbOffer[]): Offer[] {
  return offers.map((offer) => {
    const originalPrice = toNumber(offer.original_price)
    const discountedPrice = toNumber(offer.discounted_price)
    const discountPercent =
      originalPrice > 0
        ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
        : parseDiscountPercent(offer.discount_value)

    return {
      id: offer.id,
      brand_id: offer.merchant_id ?? "",
      category_id: offer.category_id ?? "",
      title: offer.title,
      original_price: originalPrice,
      discounted_price: discountedPrice,
      discount_percent: discountPercent,
    }
  })
}

function mapRedemptions(
  redemptions: DbRedemption[],
  offerById: Map<string, DbOffer>
): Redemption[] {
  return redemptions.map((redemption) => {
    const offer = offerById.get(redemption.offer_id)

    return {
      id: redemption.id,
      student_id: redemption.user_id,
      offer_id: redemption.offer_id,
      brand_id: redemption.merchant_id,
      category_id: offer?.category_id ?? "",
      date: redemption.redeemed_at ?? new Date(0).toISOString(),
      original_price: toNumber(redemption.total_bill_amount),
      discounted_price: toNumber(redemption.final_amount),
      amount_saved: toNumber(redemption.discount_amount),
      status: redemption.is_voided ? "cancelled" : "completed",
    }
  })
}

function mapAnalyticsEvents(
  userActivityEvents: DbUserActivityEvent[],
  analyticsEvents: DbAnalyticsEvent[]
): AnalyticsEvent[] {
  const userEvents = userActivityEvents.map((event) => ({
    id: String(event.id),
    student_id: event.user_id,
    type: normalizeEventType(event.event_type),
    brand_id: getStringValue(event.event_data, "merchant_id"),
    category_id: getStringValue(event.event_data, "category_id"),
    date: event.created_at ?? new Date(0).toISOString(),
  }))

  const genericEvents = analyticsEvents.map((event) => ({
    id: event.id,
    student_id: getStringValue(event.event_data, "user_id"),
    type: normalizeEventType(event.event_type),
    brand_id: getStringValue(event.event_data, "merchant_id"),
    category_id: getStringValue(event.event_data, "category_id"),
    date: event.created_at ?? new Date(0).toISOString(),
  }))

  return [...userEvents, ...genericEvents].filter((event) => event.student_id)
}

function mostCommonForRedemptions(
  redemptions: Redemption[],
  userById: Map<string, DbUser>,
  selector: (user: DbUser) => string | null
) {
  return (
    mostCommon(
      redemptions
        .map((redemption) => userById.get(redemption.student_id))
        .filter((user): user is DbUser => Boolean(user))
        .map(selector)
        .filter(Boolean) as string[]
    ) || "Unknown"
  )
}

function normalizeEventType(eventType: string): AnalyticsEvent["type"] {
  const value = eventType.toLowerCase()

  if (value.includes("redeem")) return "redeem"
  if (value.includes("click")) return "click"
  if (value.includes("save") || value.includes("favorite")) return "save"
  return "view"
}

function parseDiscountPercent(value: string | null) {
  if (!value) return 0

  const match = value.match(/\d+(\.\d+)?/)
  return match ? Math.round(Number(match[0])) : 0
}

function getStringValue(
  data: Record<string, unknown> | null,
  key: string
): string {
  const value = data?.[key]
  return typeof value === "string" ? value : ""
}

function isRecent(value: string | null, now: number) {
  if (!value) return false

  const time = new Date(value).getTime()
  return Number.isFinite(time) && now - time <= ACTIVE_WINDOW_MS
}

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value
  if (typeof value === "string") return Number(value) || 0
  return 0
}

function sumBy<T>(items: T[], selector: (item: T) => number) {
  return Math.round(
    items.reduce((total, item) => total + selector(item), 0) * 100
  ) / 100
}

function groupBy<T>(items: T[], selector: (item: T) => string) {
  const grouped = new Map<string, T[]>()

  for (const item of items) {
    const key = selector(item)
    grouped.set(key, [...(grouped.get(key) ?? []), item])
  }

  return grouped
}

function mostCommon(values: string[]) {
  const counts = new Map<string, number>()

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? ""
}
