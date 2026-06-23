"use client"

import * as React from "react"
import { RiSunLine, RiMoonLine, RiContrastLine } from "@remixicon/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import { toast } from "sonner"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and application preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Admin Profile</CardTitle><CardDescription>Manage your personal information</CardDescription></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">AD</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">Change avatar</Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" defaultValue="Admin User" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="admin@studenverse.com" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" defaultValue="Administrator" disabled />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => toast("Profile updated")}>Save changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Theme Settings</CardTitle><CardDescription>Customize your dashboard appearance</CardDescription></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Theme mode</Label>
                <div className="flex gap-2">
                  <Button variant={theme === "light" ? "default" : "outline"} size="sm" onClick={() => setTheme("light")} className="gap-2">
                    <RiSunLine data-icon="inline-start" /> Light
                  </Button>
                  <Button variant={theme === "dark" ? "default" : "outline"} size="sm" onClick={() => setTheme("dark")} className="gap-2">
                    <RiMoonLine data-icon="inline-start" /> Dark
                  </Button>
                  <Button variant={theme === "system" ? "default" : "outline"} size="sm" onClick={() => setTheme("system")} className="gap-2">
                    <RiContrastLine data-icon="inline-start" /> System
                  </Button>
                </div>
              </div>
              <Separator />
              <p className="text-sm text-muted-foreground">The theme is applied instantly and synced across all pages.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Preferences</CardTitle><CardDescription>Language and currency settings</CardDescription></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger id="language"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="currency">Currency</Label>
                    <Select defaultValue="aed">
                    <SelectTrigger id="currency"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aed">Dirhams (UAE)</SelectItem>
                      <SelectItem value="usd">USD (USA)</SelectItem>
                      <SelectItem value="eur">EUROS (European)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => toast("Preferences saved")}>Save preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Role Permissions</CardTitle><CardDescription>Manage access levels (read-only preview)</CardDescription></CardHeader>
            <CardContent>
              <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">Available roles in future releases:</p>
                <ul className="list-inside list-disc space-y-1">
                  <li><strong>Admin</strong> — Full access to all pages and settings</li>
                  <li><strong>Analyst</strong> — View all data, export reports, no settings access</li>
                  <li><strong>Viewer</strong> — Read-only access to dashboards</li>
                </ul>
                <p className="mt-3 text-xs">Role-based access control will be available after Supabase migration.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
