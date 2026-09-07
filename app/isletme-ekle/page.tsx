"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/_providers/auth"
import { Header } from "@/app/_components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import { Textarea } from "@/app/_components/ui/textarea"
import { toast } from "sonner"
import { SignInModal } from "@/app/_components/sign-in-modal"
import { Dialog } from "@/app/_components/ui/dialog"
import { StoreIcon, ScissorsIcon, ClockIcon, UserIcon, ArrowRightIcon, Loader2Icon } from "lucide-react"

export default function IsletmeEklePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showSignIn, setShowSignIn] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form alanları
  const [formData, setFormData] = useState({
    name: "",
    type: "BARBER",
    phone: "",
    email: "",
    city: "İstanbul",
    district: "Kadıköy",
    address: "",
    description: "",
    openTime: "09:00",
    closeTime: "20:00",
    serviceName: "Klasik Saç Kesimi",
    servicePrice: "450",
    serviceDuration: "45",
    staffName: "Usta Berber",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setShowSignIn(true)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/business/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          phone: formData.phone,
          email: formData.email,
          city: formData.city,
          district: formData.district,
          address: formData.address,
          description: formData.description,
          openTime: formData.openTime,
          closeTime: formData.closeTime,
          initialService: {
            name: formData.serviceName,
            price: Number(formData.servicePrice),
            durationMinutes: Number(formData.serviceDuration),
          },
          initialStaff: {
            name: formData.staffName,
          },
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "İşletme kaydedilemedi.")
      }

      toast.success("İşletmeniz başarıyla oluşturuldu! Yönetim paneline yönlendiriliyorsunuz.")
      router.push("/isletme-paneli")
    } catch (err: any) {
      toast.error(err.message || "Bir hata oluştu.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <div className="max-w-3xl mx-auto px-5 md:px-8 py-10">
        <Card className="rounded-3xl border-border/70 shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
              <StoreIcon className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-black">
              İşletmenizi OxonomBerber'e Ekleyin
            </CardTitle>
            <CardDescription className="max-w-md mx-auto text-xs md:text-sm">
              Dakikalar içinde işletme profilinizi oluşturun, hizmetlerinizi listeleyin ve online randevu almaya başlayın.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 1. Temel İşletme Bilgileri */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b pb-2">
                  <StoreIcon className="h-4 w-4 text-primary" />
                  İşletme Bilgileri
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">İşletme / Salon Adı *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Örn: Klasik Makas Berber Salonu"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="type">İşletme Türü *</Label>
                    <select
                      id="type"
                      name="type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={formData.type}
                      onChange={handleChange}
                    >
                      <option value="BARBER">Berber (Erkek Kuaförü)</option>
                      <option value="HAIRDRESSER">Kuaför / Saç Tasarım</option>
                      <option value="BEAUTY_SALON">Güzellik Salonu</option>
                      <option value="NAIL_SALON">Tırnak & Bakım</option>
                      <option value="OTHER">Diğer</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Telefon Numarası *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="+90 532 000 0000"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email">İşletme E-posta</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="isletme@ornek.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="city">Şehir *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="district">İlçe *</Label>
                    <Input
                      id="district"
                      name="district"
                      placeholder="Örn: Kadıköy, Beşiktaş, Şişli..."
                      value={formData.district}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address">Açık Adres *</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Mahalle, Cadde/Sokak, Kapı No"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description">İşletme Açıklaması</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Salonunuz, uzmanlıklarınız ve sunduğunuz ortam hakkında kısa bilgi verin."
                    value={formData.description}
                    onChange={handleChange}
                    className="h-20"
                  />
                </div>
              </div>

              {/* 2. Çalışma Saatleri */}
              <div className="space-y-4 pt-2">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b pb-2">
                  <ClockIcon className="h-4 w-4 text-primary" />
                  Çalışma Saatleri
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="openTime">Açılış Saati</Label>
                    <Input
                      id="openTime"
                      name="openTime"
                      type="time"
                      value={formData.openTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="closeTime">Kapanış Saati</Label>
                    <Input
                      id="closeTime"
                      name="closeTime"
                      type="time"
                      value={formData.closeTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 3. İlk Hizmet */}
              <div className="space-y-4 pt-2">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b pb-2">
                  <ScissorsIcon className="h-4 w-4 text-primary" />
                  İlk Hizmetinizi Belirleyin
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="serviceName">Hizmet Adı *</Label>
                    <Input
                      id="serviceName"
                      name="serviceName"
                      placeholder="Klasik Saç Kesimi"
                      value={formData.serviceName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="servicePrice">Fiyat (₺) *</Label>
                    <Input
                      id="servicePrice"
                      name="servicePrice"
                      type="number"
                      placeholder="450"
                      value={formData.servicePrice}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="serviceDuration">Süre (Dakika) *</Label>
                    <Input
                      id="serviceDuration"
                      name="serviceDuration"
                      type="number"
                      placeholder="45"
                      value={formData.serviceDuration}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 4. İlk Personel */}
              <div className="space-y-4 pt-2">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b pb-2">
                  <UserIcon className="h-4 w-4 text-primary" />
                  İlk Personelinizi Ekleyin
                </h3>

                <div className="space-y-1.5">
                  <Label htmlFor="staffName">Personel Adı Soyadı *</Label>
                  <Input
                    id="staffName"
                    name="staffName"
                    placeholder="Örn: Ahmet Usta veya Kendiniz"
                    value={formData.staffName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full font-bold text-base gap-2 shadow-md"
                  disabled={submitting}
                >
                  {submitting && <Loader2Icon className="h-5 w-5 animate-spin" />}
                  İşletmeyi Kaydet ve Panele Git
                  <ArrowRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showSignIn} onOpenChange={setShowSignIn}>
        <SignInModal onSuccess={() => setShowSignIn(false)} />
      </Dialog>
    </div>
  )
}
