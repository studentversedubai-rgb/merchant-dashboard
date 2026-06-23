# Hard-Coded Dashboard Report

Generated: 2026-06-16

## Summary

The dashboard no longer serves mock JSON data when Supabase is not configured. If the server has no Supabase key, `/api/dashboard-data/:resource` returns a `503` response with `SUPABASE_KEY_MISSING`, and the frontend shows a one-time alert: `Supabase API key is not configured.`

The removed hard-coded items include:
- mock JSON fallback data
- entitlement-as-redemption fallback data
- generated report records
- generated notification records
- fake KPI trend percentages
- count-based spend/savings chart formulas

## Still Hard-Coded

### Supabase project URL default

Location: `lib/dashboard-data.ts`

The Supabase URL defaults to:

```txt
https://ewhraukiawfzrnstxxqa.supabase.co
```

This can still be overridden with `SUPABASE_URL`.

Why kept: this dashboard is currently tied to this Supabase project.

### Active student window

Location: `lib/dashboard-data.ts`

`ACTIVE_WINDOW_MS` is hard-coded to 30 days.

Purpose: classifies users as active when `last_active_at` is within the last 30 days, or when `logged_in` is true.

Why kept: this is a business-rule default, not mock data.

Recommended follow-up: confirm the active-user definition and move it to config if needed.

### Student city fallback

Location: `lib/dashboard-data.ts`

Student `city` is set to `"Unknown"` because the provided `public.users` schema does not include a city column.

Why kept: the `Student` DTO and existing Students page require a city value.

Recommended follow-up: add a user city field, derive city from university, or remove the city chart.

### Defensive empty/fallback labels

Locations:
- `lib/dashboard-data.ts`
- `app/(authenticated)/redemptions/page.tsx`

Values like `"Unknown"`, `"Uncategorized"`, and `"N/A"` are still used when source fields or relationships are missing.

Why kept: these prevent broken UI when nullable Supabase fields are empty.

### Anonymous student display names

Locations:
- `app/(authenticated)/dashboard/page.tsx`
- `app/(authenticated)/redemptions/page.tsx`

Students are displayed as:

```ts
Student ${id.slice(-3)}
```

Why kept: this avoids exposing names/emails by default.

Recommended follow-up: use real names only if this dashboard has proper admin access control.

### Top-N chart limits

Locations:
- `app/(authenticated)/dashboard/page.tsx`
- `app/(authenticated)/brands/page.tsx`
- `app/(authenticated)/redemptions/page.tsx`
- `app/(authenticated)/spending-insights/page.tsx`

Several charts use fixed display limits like top 6, top 8, or first 10 rows.

Why kept: this is display behavior, not mock data.

Recommended follow-up: move these to named constants if the limits need to be tuned.

## Not Data Hard-Coding

These are hard-coded UI labels/branding, not mock business data:
- `Student Verse`
- route names like `Dashboard`, `Students`, `Brands`
- chart titles and table headings
- sidebar/search navigation items

