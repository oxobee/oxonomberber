import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { ScissorsIcon, SparklesIcon, CompassIcon, StoreIcon, ArrowRightIcon } from "lucide-react"

import { db } from "./_lib/prisma"
import { getCurrentUser } from "./_lib/auth-service"

import { Header } from "./_components/header"
import { Button } from "./_components/ui/button"
import { BarbershopItem } from "./_components/barbershop-item"
import { BookingItem } from "./_components/booking-item"
import { Search } from "./_components/search"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./_components/ui/carousel"

const turkishCategories = [
  { title: "Tümü", slug: "", icon: CompassIcon },
  { title: "Berber", slug: "barber", icon: ScissorsIcon },
  { title: "Kuaför", slug: "hairdresser", icon: SparklesIcon },
  { title: "Güzellik Salonu", slug: "beauty", icon: SparklesIcon },
]

export default async function Home() {
  const user = await getCurrentUser()
  const today = format(new Date(), "EEEE, d MMMM yyyy", { locale: tr })

  // Kullanıcının yaklaşan onaylı randevuları
  const confirmedBookings = user
    ? await db.booking.findMany({
        where: {
          customerId: user.id,
          status: "CONFIRMED",
          startAt: { gte: new Date() },
        },
        include: {
          business: true,
          service: true,
          staff: true,
        },
        orderBy: {
          startAt: "asc",
        },
        take: 5,
      })
    : []

  // İşletmeleri çek
  const recommendedBusinesses = await db.business.findMany({
    where: { active: true },
    include: {
      services: true,
      reviews: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 8,
  })

  const popularBusinesses = await db.business.findMany({
    where: { active: true },
    include: {
      services: true,
      reviews: true,
    },
    orderBy: {
      name: "asc",
    },
    take: 8,
  })

  return (
    <main className="min-h-screen pb-16">
      <Header />

      {/* Hero / Banner Alanı */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background pt-8 pb-12 px-5 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <span>Türkiye'nin Yeni Nesil Berber & Kuaför Platformu</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Yakınındaki En İyi <span className="text-primary">Berber ve Kuaförleri</span> Keşfet
          </h1>

          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            {user ? `Tekrar merhaba, ${user.name || "Kullanıcı"}!` : "Kolayca hizmetini seç, dilediğin personelden saniyeler içinde 7/24 randevunu al."}
          </p>

          {/* Arama Alanı */}
          <div className="max-w-xl mx-auto pt-2">
            <Search />
          </div>

          {/* Hızlı Kategori Seçimi */}
          <div className="flex justify-center items-center gap-2 pt-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {turkishCategories.map((category) => (
              <Button
                key={category.title}
                variant="secondary"
                size="sm"
                className="rounded-full gap-1.5 text-xs flex-shrink-0"
                asChild
              >
                <Link href={category.slug ? `/isletmeler?kategori=${category.slug}` : "/isletmeler"}>
                  <category.icon className="h-3.5 w-3.5 text-primary" />
                  {category.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 md:px-12 lg:px-24 space-y-10 mt-4">
        {/* Kullanıcının Yaklaşan Randevuları */}
        {confirmedBookings.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Yaklaşan Randevularınız
              </h2>
              <Button variant="ghost" size="sm" asChild className="text-xs text-primary gap-1">
                <Link href="/hesabim/randevularim">
                  Tümünü Gör <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </Button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
              {confirmedBookings.map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
              ))}
            </div>
          </section>
        )}

        {/* Tavsiye Edilen İşletmeler */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Öne Çıkan Salonlar</h2>
              <p className="text-xs text-muted-foreground">Müşteri puanı yüksek, doğrulanmış işletmeler</p>
            </div>
            <Button variant="outline" size="sm" asChild className="text-xs">
              <Link href="/isletmeler">Tümünü İncele</Link>
            </Button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden">
            {recommendedBusinesses.map((business) => (
              <BarbershopItem key={business.id} barbershop={business} />
            ))}
          </div>
        </section>

        {/* Popüler Kuaför ve Berberler */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Popüler İşletmeler</h2>
              <p className="text-xs text-muted-foreground">İstanbul'un en çok tercih edilen kuaförleri</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {popularBusinesses.map((business) => (
              <BarbershopItem key={business.id} barbershop={business} />
            ))}
          </div>
        </section>

        {/* İşletme Sahibi Çağrı Alanı (Call-to-Action) */}
        <section className="rounded-3xl p-6 md:p-10 bg-gradient-to-r from-primary/20 via-primary/10 to-background border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-bold text-foreground">İşletmenizi OxonomBerber'e Ekleyin</h3>
            <p className="text-sm text-muted-foreground max-w-lg">
              Müşterilerinize 7/24 online randevu alma kolaylığı sunun, çalışanlarınızı ve takviminizi tek panelden yönetin.
            </p>
          </div>
          <Button size="lg" className="gap-2 font-bold shadow-md flex-shrink-0" asChild>
            <Link href="/isletme-ekle">
              <StoreIcon className="h-5 w-5" />
              Ücretsiz İşletme Hesabı Aç
            </Link>
          </Button>
        </section>
      </div>
    </main>
  )
}
