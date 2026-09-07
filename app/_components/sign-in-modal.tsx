"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { toast } from "sonner"
import { Loader2, ShieldCheckIcon, StoreIcon, UserIcon } from "lucide-react"

interface SignInModalProps {
  onSuccess?: () => void
}

export const SignInModal = ({ onSuccess }: SignInModalProps) => {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAuth = async (e: React.FormEvent, customEmail?: string, customPassword?: string) => {
    if (e) e.preventDefault()
    setLoading(true)

    const targetEmail = customEmail || email
    const targetPassword = customPassword || password

    try {
      if (isRegister) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: targetEmail, password: targetPassword, name }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Kayıt işlemi başarısız.")
        toast.success("Hesabınız oluşturuldu! Şimdi giriş yapabilirsiniz.")
        setIsRegister(false)
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: targetEmail, password: targetPassword }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Giriş yapılamadı.")

        toast.success("Başarıyla giriş yapıldı!")
        if (onSuccess) {
          onSuccess()
        }
        window.location.reload()
      }
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  const quickFill = (qEmail: string, qPass: string) => {
    setEmail(qEmail)
    setPassword(qPass)
    handleAuth(null as any, qEmail, qPass)
  }

  return (
    <DialogContent className="w-[92%] max-w-[420px] rounded-3xl p-6">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">
          {isRegister ? "Hesap Oluştur" : "Giriş Yap"}
        </DialogTitle>
        <DialogDescription className="text-xs">
          {isRegister
            ? "Randevularınızı yönetmek için hemen ücretsiz kayıt olun."
            : "Randevu almak ve seanslarınızı yönetmek için giriş yapın."}
        </DialogDescription>
      </DialogHeader>

      {/* Hızlı Demo Giriş Butonları (Sadece Giriş Modunda) */}
      {!isRegister && (
        <div className="space-y-1.5 p-3 rounded-2xl bg-muted/40 border border-border/70 my-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block text-center">
            ⚡ Hızlı Test Girişi (Otomatik)
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-xs hover:border-destructive hover:bg-destructive/10 h-8"
              onClick={() => quickFill("admin@oxonomberber.com", "Admin123456!")}
              disabled={loading}
            >
              <ShieldCheckIcon className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
              <span className="truncate">🛡️ Süper Admin Girişi</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-xs hover:border-primary hover:bg-primary/10 h-8"
              onClick={() => quickFill("isletme@oxonomberber.com", "Isletme123456!")}
              disabled={loading}
            >
              <StoreIcon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span className="truncate">💈 İşletme Sahibi Girişi</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-xs hover:border-foreground/40 hover:bg-muted h-8"
              onClick={() => quickFill("musteri@oxonomberber.com", "Musteri123456!")}
              disabled={loading}
            >
              <UserIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <span className="truncate">🧑‍🦱 Müşteri Girişi</span>
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={(e) => handleAuth(e)} className="flex flex-col gap-3">
        {isRegister && (
          <div className="flex flex-col gap-1">
            <Label htmlFor="name" className="text-xs">Ad Soyad</Label>
            <Input
              id="name"
              type="text"
              placeholder="Ahmet Yılmaz"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}

        <div className="flex flex-col gap-1">
          <Label htmlFor="email" className="text-xs">E-posta</Label>
          <Input
            id="email"
            type="email"
            placeholder="ornek@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="password" className="text-xs">Şifre</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full mt-2 font-bold" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isRegister ? "Hesap Oluştur" : "Giriş Yap"}
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground mt-1">
        {isRegister ? (
          <p>
            Zaten hesabınız var mı?{" "}
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className="text-primary font-semibold hover:underline"
            >
              Giriş Yap
            </button>
          </p>
        ) : (
          <p>
            Henüz hesabınız yok mu?{" "}
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className="text-primary font-semibold hover:underline"
            >
              Kayıt Ol
            </button>
          </p>
        )}
      </div>
    </DialogContent>
  )
}
