import { notFound } from "next/navigation"
import Image from "next/image"
import { db } from "@/app/_lib/prisma"
import { Header } from "@/app/_components/header"
import { Badge } from "@/app/_components/ui/badge"
import { Card, CardContent } from "@/app/_components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar"
import { BookingDialog } from "./_components/booking-dialog"
import {
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  CheckCircle2Icon,
  ScissorsIcon,
  UserIcon,
} from "lucide-react"
import { Metadata } from "next"

interface IsletmePageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: IsletmePageProps): Promise<Metadata> {
  const business = await db.business.findFirst({
    where: {
      OR: [{ slug: params.slug }, { id: params.slug }],
    },
  })

  if (!business) {
    return { title: "İşletme Bulunamadı | OxonomBerber" }
  }

  return {
    title: `${business.name} - ${business.district}, ${business.city} | Online Randevu`,
    description: `${business.name} salonunda saç kesimi, sakal tıraşı ve bakım hizmetleri için hemen online randevu alın.`,
  }
}

export default async function IsletmeDetailPage({ params }: IsletmePageProps) {
  const business = await db.business.findFirst({
    where: {
      OR: [{ slug: params.slug }, { id: params.slug }],
    },
    include: {
      services: { where: { active: true }, orderBy: { price: "asc" } },
      staff: { where: { active: true } },
      businessHours: { orderBy: { dayOfWeek: "asc" } },
      reviews: { include: { customer: true }, orderBy: { createdAt: "desc" }, take: 10 },
    },
  })

  if (!business) {
    notFound()
  }

  const daysName = [
    "Pazar",
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi",
  ]

  const avgRating = business.reviews.length > 0
    ? (business.reviews.reduce((acc, r) => acc + r.rating, 0) / business.reviews.length).toFixed(1)
    : "5.0"

  const coverImg = business.coverImage || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&auto=format&fit=crop&q=80"

  return (
    <div className="min-h-screen pb-20">
      <Header />

      {/* Kapak Görseli ve Hero */}
      <div className="relative h-64 md:h-96 w-full overflow-hidden bg-muted">
        <Image
          src={coverImg}
          alt={business.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-5 md:px-12 -mt-20 relative z-10 space-y-8">
        {/* İşletme Başlık Kartı */}
        <Card className="rounded-3xl border-border/80 shadow-lg backdrop-blur bg-background/95 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 rounded-2xl border-2 border-primary/20 shadow-md flex-shrink-0">
                <AvatarImage src={business.logo || coverImg} />
                <AvatarFallback className="font-bold text-2xl bg-primary/10 text-primary">
                  {business.name[0]}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-black text-foreground">
                    {business.name}
                  </h1>
                  {business.verified && (
                    <Badge className="bg-emerald-600 gap-1">
                      <CheckCircle2Icon className="h-3 w-3" />
                      Doğrulanmış
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <StarIcon className="h-4 w-4 fill-amber-500" />
                    <span>{avgRating} ({business.reviews.length} değerlendirme)</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <MapPinIcon className="h-4 w-4 text-primary" />
                    <span>{business.address}, {business.district} / {business.city}</span>
                  </div>
                </div>

                {business.description && (
                  <p className="text-xs md:text-sm text-muted-foreground pt-1 max-w-2xl">
                    {business.description}
                  </p>
                )}
              </div>
            </div>

            {business.phone && (
              <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 border-border/60">
                <span className="text-xs text-muted-foreground">İletişim & Randevu</span>
                <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <PhoneIcon className="h-4 w-4 text-primary" />
                  {business.phone}
                </span>
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Kolon: Hizmetler ve Çalışanlar */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hizmetler */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <ScissorsIcon className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Hizmetlerimiz</h2>
              </div>

              <div className="space-y-3">
                {business.services.map((service) => (
                  <Card
                    key={service.id}
                    className="p-4 rounded-2xl border-border/60 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="font-bold text-base text-foreground">{service.name}</h3>
                        {service.description && (
                          <p className="text-xs text-muted-foreground">{service.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                          <span className="flex items-center gap-1 font-medium">
                            <ClockIcon className="h-3.5 w-3.5 text-primary" />
                            {service.durationMinutes} dakika
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="text-lg font-black text-primary">
                          ₺{Number(service.price)}
                        </span>
                        <BookingDialog business={business} service={service} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {/* Çalışanlar */}
            {business.staff.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">Ekibimiz</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {business.staff.map((st) => (
                    <Card key={st.id} className="p-4 rounded-2xl border-border/60 flex items-center gap-3">
                      <Avatar className="h-12 w-12 rounded-xl">
                        <AvatarImage src={st.image || ""} />
                        <AvatarFallback className="font-bold">{st.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-bold text-sm">{st.name} {st.surname}</h4>
                        <p className="text-xs text-muted-foreground">{st.bio || "Saç & Sakal Uzmanı"}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Yorumlar */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StarIcon className="h-5 w-5 fill-amber-500 text-amber-500" />
                  <h2 className="text-xl font-bold text-foreground">Müşteri Yorumları</h2>
                </div>
                <span className="text-xs text-muted-foreground">{business.reviews.length} yorum</span>
              </div>

              {business.reviews.length === 0 ? (
                <div className="p-6 text-center rounded-2xl border bg-muted/20 text-xs text-muted-foreground">
                  Bu işletme için henüz bir değerlendirme yapılmamış.
                </div>
              ) : (
                <div className="space-y-3">
                  {business.reviews.map((r) => (
                    <Card key={r.id} className="p-4 rounded-xl border-border/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={r.customer.avatar || ""} />
                            <AvatarFallback className="text-[10px]">{r.customer.name?.[0] || "M"}</AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-xs">{r.customer.name || "Misafir Kullanıcı"}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <StarIcon key={i} className="h-3 w-3 fill-amber-500 text-amber-500" />
                          ))}
                        </div>
                      </div>
                      {r.comment && <p className="text-xs text-muted-foreground">{r.comment}</p>}
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sağ Kolon: Çalışma Saatleri & Konum */}
          <div className="space-y-6">
            <Card className="p-6 rounded-3xl border-border/80 shadow-sm space-y-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-primary" />
                Çalışma Saatleri
              </h3>

              <div className="space-y-2 text-xs">
                {business.businessHours.map((bh) => (
                  <div key={bh.id} className="flex justify-between items-center py-1 border-b border-border/40 last:border-none">
                    <span className="font-medium text-foreground">{daysName[bh.dayOfWeek]}</span>
                    <span className={bh.isClosed ? "text-destructive font-semibold" : "text-muted-foreground"}>
                      {bh.isClosed ? "Kapalı" : `${bh.openTime} - ${bh.closeTime}`}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 rounded-3xl border-border/80 shadow-sm space-y-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-primary" />
                Konum ve Adres
              </h3>
              <p className="text-xs text-muted-foreground">{business.address}</p>
              <p className="text-xs font-semibold text-foreground">{business.district} / {business.city}</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
