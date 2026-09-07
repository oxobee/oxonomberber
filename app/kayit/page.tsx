"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/app/_lib/supabase/client"
import { Header } from "@/app/_components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import { toast } from "sonner"
import Link from "next/link"
import { Loader2Icon } from "lucide-react"

export default function KayitPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      })

      if (error) throw error

      toast.success("Hesabınız oluşturuldu! Yönlendiriliyorsunuz...")
      router.push("/")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Kayıt işlemi başarısız.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pb-16">
      <Header />

      <div className="max-w-md mx-auto px-5 py-16">
        <Card className="rounded-3xl border-border/70 shadow-lg">
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 font-black text-xl">
              Ö
            </div>
            <CardTitle className="text-2xl font-black">Hesap Oluştur</CardTitle>
            <CardDescription className="text-xs">
              OxonomBerber'e ücretsiz üye olarak dilediğiniz salondan anında randevu alın.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Adınız Soyadınız</Label>
                <Input
                  id="name"
                  placeholder="Ahmet Yılmaz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

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
                <Label htmlFor="password">Şifre (En az 6 karakter)</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              <Button type="submit" className="w-full font-bold" disabled={loading}>
                {loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                Ücretsiz Kayıt Ol
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-4">
              Zaten hesabınız var mı?{" "}
              <Link href="/giris" className="text-primary font-bold hover:underline">
                Giriş Yapın
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
