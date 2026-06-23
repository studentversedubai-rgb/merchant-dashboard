"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { RiDashboardLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("admin@studenverse.com")
  const [password, setPassword] = React.useState("password")

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <RiDashboardLine className="size-6" />
          </div>
          <CardTitle className="text-xl">Student Verse</CardTitle>
          <CardDescription>
            Sign in to your analytics dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@studenverse.com"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
          <Separator className="my-4" />
          <p className="text-center text-xs text-muted-foreground">
            Demo credentials are pre-filled. Click sign in to continue.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
