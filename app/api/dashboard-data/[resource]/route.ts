import {
  getDashboardResource,
  isDashboardResource,
  MissingSupabaseKeyError,
} from "@/lib/dashboard-data"

export const dynamic = "force-dynamic"

export async function GET(
  _request: Request,
  context: { params: Promise<{ resource: string }> }
) {
  const { resource } = await context.params

  if (!isDashboardResource(resource)) {
    return Response.json({ error: "Unknown dashboard resource" }, { status: 404 })
  }

  try {
    const data = await getDashboardResource(resource)
    return Response.json(data)
  } catch (error) {
    if (error instanceof MissingSupabaseKeyError) {
      return Response.json(
        {
          code: "SUPABASE_KEY_MISSING",
          error: "Supabase API key is not configured.",
        },
        { status: 503 }
      )
    }

    console.error(error)
    return Response.json(
      { error: "Failed to load dashboard data" },
      { status: 500 }
    )
  }
}
