"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/app/_components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import { toast } from "sonner"
import Link from "next/link"
import { Loader2Icon, ShieldCheckIcon, StoreIcon, UserIcon } from "lucide-react"

function GirisForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next")

  const handleLogin = async (e: React.FormEvent, customEmail?: string, customPassword?: string) => {
    if (e) e.preventDefault()
    setLoading(true)

    const targetEmail = customEmail || email
    const targetPassword = customPassword || password

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, password: targetPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Giriş yapılamadı.")
      }

      toast.success(`Hoş geldiniz! (${data.role})`)

      if (next) {
        window.location.href = next
      } else if (data.role === "ADMIN") {
        window.location.href = "/admin"
      } else if (data.role === "BUSINESS_OWNER") {
        window.location.href = "/isletme-paneli"
      } else {
        window.location.href = "/hesabim/randevularim"
      }
    } catch (err: any) {
      toast.error(err.message || "Giriş yapılamadı. Bilgilerinizi kontrol ediniz.")
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = (qEmail: string, qPass: string) => {
    setEmail(qEmail)
    setPassword(qPass)
    handleLogin(null as any, qEmail, qPass)
  }

  return (
    <Card className="rounded-3xl border-border/70 shadow-lg overflow-hidden">
      <CardHeader className="text-center pb-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 font-black text-xl">
          Ö
        </div>
        <CardTitle className="text-2xl font-black">Giriş Yap</CardTitle>
        <CardDescription className="text-xs">
          OxonomBerber hesabınıza giriş yaparak randevularınızı yönetin.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Hızlı Demo Giriş Butonları */}
        <div className="space-y-2 p-3.5 rounded-2xl bg-muted/40 border border-border/70">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block text-center">
            ⚡ Hızlı Test Girişi (Otomatik Doldur & Giriş)
          </span>

          <div className="grid grid-cols-1 gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-xs font-semibold hover:border-destructive hover:bg-destructive/10"
              onClick={() => quickLogin("admin@oxonomberber.com", "Admin123456!")}
              disabled={loading}
            >
              <ShieldCheckIcon className="h-4 w-4 text-destructive flex-shrink-0" />
              <span className="truncate">🛡️ Süper Admin Girişi</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-xs font-semibold hover:border-primary hover:bg-primary/10"
              onClick={() => quickLogin("isletme@oxonomberber.com", "Isletme123456!")}
              disabled={loading}
            >
              <StoreIcon className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="truncate">💈 İşletme Sahibi Girişi</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-xs font-semibold hover:border-foreground/40 hover:bg-muted"
              onClick={() => quickLogin("musteri@oxonomberber.com", "Musteri123456!")}
              disabled={loading}
            >
              <UserIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">🧑‍🦱 Müşteri Girişi</span>
            </Button>
          </div>
        </div>

        <div className="relative text-center text-xs text-muted-foreground after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-card px-2">veya manuel e-posta ile</span>
        </div>

        {/* Manuel Form */}
        <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-posta Adresi</Label>
            <Input
              id="email"
              type="email"
              placeholder="ornek@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Şifre</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full font-bold" disabled={loading}>
            {loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Giriş Yap
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground pt-2">
          Henüz hesabınız yok mu?{" "}
          <Link href="/kayit" className="text-primary font-bold hover:underline">
            Hemen Kayıt Olun
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

export default function GirisPage() {
  return (
    <div className="min-h-screen pb-16">
      <Header />
      <div className="max-w-md mx-auto px-5 py-12">
        <Suspense fallback={<div className="text-center py-10 text-xs">Yükleniyor...</div>}>
          <GirisForm />
        </Suspense>
      </div>
    </div>
  )
}
