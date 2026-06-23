"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  RiDashboardLine,
  RiUserLine,
  RiCouponLine,
  RiStore2Line,
  RiAppsLine,
  RiWalletLine,
  RiLineChartLine,
  RiFileList2Line,
  RiSettingsLine,
} from "@remixicon/react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/layout/user-nav"

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: RiDashboardLine },
  { title: "Students", url: "/students", icon: RiUserLine },
  { title: "Redemptions", url: "/redemptions", icon: RiCouponLine },
  { title: "Brands", url: "/brands", icon: RiStore2Line },
  { title: "Categories", url: "/categories", icon: RiAppsLine },
  { title: "Spending Insights", url: "/spending-insights", icon: RiWalletLine },
  { title: "Activity Insights", url: "/activity-insights", icon: RiLineChartLine },
  { title: "Reports", url: "/reports", icon: RiFileList2Line },
  { title: "Settings", url: "/settings", icon: RiSettingsLine },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <RiDashboardLine className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Student Verse</span>
                  <span className="text-xs text-muted-foreground">Analytics</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
