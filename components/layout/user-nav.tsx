"use client"

import * as React from "react"
import { RiUserLine, RiSettingsLine, RiLogoutCircleLine } from "@remixicon/react"
import { useRouter } from "next/navigation"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function NavUser() {
  const router = useRouter()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5 leading-none text-left">
                <span className="font-semibold text-sm">Admin User</span>
                <span className="text-xs text-muted-foreground">admin@studenverse.com</span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="right"
            align="start"
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          >
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <RiSettingsLine data-icon="inline-start" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/login")}>
              <RiLogoutCircleLine data-icon="inline-start" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
