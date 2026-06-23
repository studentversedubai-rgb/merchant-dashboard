export interface Student {
  id: string
  age: number
  nationality: string
  university: string
  city: string
  total_redemptions: number
  estimated_monthly_spend: number
  estimated_monthly_savings: number
  created_at: string
  is_active: boolean
}

export interface Brand {
  id: string
  name: string
  category: string
  city: string
  total_redemptions: number
  estimated_spend: number
  savings_generated: number
  average_discount: number
  most_active_nationality: string
  most_active_university: string
}

export interface Category {
  id: string
  name: string
  total_redemptions: number
  average_redemptions: number
  estimated_spend: number
  estimated_savings: number
  top_brand: string
  most_active_nationality: string
}

export interface Offer {
  id: string
  brand_id: string
  category_id: string
  title: string
  original_price: number
  discounted_price: number
  discount_percent: number
}

export interface Redemption {
  id: string
  student_id: string
  offer_id: string
  brand_id: string
  category_id: string
  date: string
  original_price: number
  discounted_price: number
  amount_saved: number
  status: "completed" | "pending" | "cancelled"
}

export interface AnalyticsEvent {
  id: string
  student_id: string
  type: "view" | "click" | "save" | "redeem"
  brand_id: string
  category_id: string
  date: string
}

export interface Report {
  id: string
  name: string
  target_company_type: string
  data_included: string[]
  estimated_value: number
  status: "draft" | "ready" | "sold"
}

export interface Notification {
  id: string
  title: string
  description: string
  type: "brand" | "category" | "savings" | "nationality" | "activity" | "report"
  created_at: string
  read: boolean
}

export interface DashboardKPI {
  label: string
  value: string | number
  trend?: number
  trendLabel?: string
  icon?: string
}

export interface ChartDataPoint {
  [key: string]: string | number
}

export type RedemptionStatus = "completed" | "pending" | "cancelled"
