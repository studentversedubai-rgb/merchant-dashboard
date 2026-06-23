"use client"

import * as React from "react"
import { RiMenuLine } from "@remixicon/react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { useRouter } from "next/navigation"

export function Navbar() {
  const router = useRouter()

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b px-4 bg-background">
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger>
          <RiMenuLine />
        </SidebarTrigger>
        <Separator orientation="vertical" className="h-6" />
      </div>
      <div className="hidden md:block">
        <SidebarTrigger />
      </div>
      <Separator orientation="vertical" className="hidden h-6 md:block" />
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Separator orientation="vertical" className="h-6" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  AD
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/login")}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
