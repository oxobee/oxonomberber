import { requireBusinessOwner } from "@/app/_lib/auth-service"
import { db } from "@/app/_lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import {
  CalendarIcon,
  UsersIcon,
  BanknoteIcon,
  ClockIcon,
  CheckCircle2Icon,
  UserIcon,
} from "lucide-react"
import { BookingStatus } from "@prisma/client"
import Link from "next/link"
import { Button } from "@/app/_components/ui/button"

export default async function IsletmePaneliOverview() {
  const user = await requireBusinessOwner()

  const business = await db.business.findFirst({
    where: { ownerId: user.id },
    include: {
      services: true,
      staff: true,
    },
  })

  if (!business) {
    return <div>İşletme bulunamadı.</div>
  }

  // Tarih filtreleri
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const weekEnd = new Date()
  weekEnd.setDate(weekEnd.getDate() + 7)

  // Bugünkü randevular
  const todayBookings = await db.booking.findMany({
    where: {
      businessId: business.id,
      startAt: { gte: todayStart, lte: todayEnd },
    },
    include: {
      customer: true,
      service: true,
      staff: true,
    },
    orderBy: { startAt: "asc" },
  })

  // Bu haftaki randevular
  const weekBookings = await db.booking.findMany({
    where: {
      businessId: business.id,
      startAt: { gte: todayStart, lte: weekEnd },
      status: { not: BookingStatus.CANCELLED },
    },
  })

  // Tüm tamamlanan ve onaylı randevuların cirosu
  const revenueBookings = await db.booking.findMany({
    where: {
      businessId: business.id,
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
    },
  })
  const totalRevenue = revenueBookings.reduce((sum, b) => sum + Number(b.priceSnapshot), 0)

  // Benzersiz müşteri sayısı
  const uniqueCustomersCount = new Set(revenueBookings.map((b) => b.customerId)).size

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-foreground">
          Hoş Geldiniz, {business.name}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {format(new Date(), "d MMMM yyyy, EEEE", { locale: tr })} • İşletme yönetim özeti
        </p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">
              Bugünkü Randevular
            </CardTitle>
            <ClockIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{todayBookings.length}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {todayBookings.filter((b) => b.status === "CONFIRMED").length} onaylı seans
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">
              Bu Haftaki Randevular
            </CardTitle>
            <CalendarIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{weekBookings.length}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Önümüzdeki 7 gün</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">
              Toplam Müşteri
            </CardTitle>
            <UsersIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{uniqueCustomersCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Randevu alan tekil müşteri</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">
              Tahmini Ciro
            </CardTitle>
            <BanknoteIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-primary">₺{totalRevenue.toLocaleString("tr-TR")}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Onaylanan & tamamlanan</p>
          </CardContent>
        </Card>
      </div>

      {/* Bugünkü Randevular Tablosu */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Günün Randevuları</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/isletme-paneli/randevular">Tüm Randevuları Gör</Link>
          </Button>
        </div>

        {todayBookings.length === 0 ? (
          <Card className="p-8 text-center rounded-2xl border-dashed bg-muted/20 text-muted-foreground text-sm">
            Bugün için henüz planlanmış bir randevu bulunmuyor.
          </Card>
        ) : (
          <div className="space-y-3">
            {todayBookings.map((b) => (
              <Card key={b.id} className="p-4 rounded-2xl border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-primary/10 text-primary font-black text-sm min-w-[64px]">
                    <ClockIcon className="h-4 w-4 mb-0.5" />
                    {format(new Date(b.startAt), "HH:mm")}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-foreground">{b.customer.name || "Misafir"}</h3>
                      <span className="text-xs text-muted-foreground">• {b.customer.phone || b.customer.email}</span>
                    </div>
                    <p className="text-xs font-semibold text-primary">{b.service.name} ({b.durationSnapshot} dk)</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <UserIcon className="h-3 w-3" /> Personel: {b.staff.name} {b.staff.surname}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="font-bold text-sm text-foreground">₺{Number(b.priceSnapshot)}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary font-medium">
                    {b.status === "CONFIRMED" ? "Onaylı" : b.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
