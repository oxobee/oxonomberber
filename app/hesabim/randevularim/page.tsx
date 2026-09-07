import { requireAuth } from "@/app/_lib/auth-service"
import { db } from "@/app/_lib/prisma"
import { Header } from "@/app/_components/header"
import { BookingItem } from "@/app/_components/booking-item"
import { Button } from "@/app/_components/ui/button"
import Link from "next/link"
import { CalendarIcon, CompassIcon } from "lucide-react"
import { BookingStatus } from "@prisma/client"

export default async function RandevularimPage() {
  const user = await requireAuth()

  const allBookings = await db.booking.findMany({
    where: { customerId: user.id },
    include: {
      business: true,
      service: true,
      staff: true,
    },
    orderBy: { startAt: "desc" },
  })

  const now = new Date()

  const upcomingBookings = allBookings.filter(
    (b) => b.startAt >= now && b.status === BookingStatus.CONFIRMED
  )

  const pastBookings = allBookings.filter(
    (b) => b.startAt < now && b.status !== BookingStatus.CANCELLED
  )

  const cancelledBookings = allBookings.filter(
    (b) => b.status === BookingStatus.CANCELLED
  )

  return (
    <div className="min-h-screen pb-16">
      <Header />

      <div className="max-w-5xl mx-auto px-5 md:px-12 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground">
              Randevularım
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Geçmiş ve yaklaşan tüm kuaför/berber randevularınızı buradan takip edebilirsiniz.
            </p>
          </div>

          <Button asChild className="gap-2 self-start sm:self-auto">
            <Link href="/isletmeler">
              <CompassIcon className="h-4 w-4" />
              Yeni Randevu Al
            </Link>
          </Button>
        </div>

        {allBookings.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border border-dashed border-border/80 bg-muted/20 space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-foreground">Henüz Randevunuz Yok</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Size en yakın salonları keşfedin ve saniyeler içinde ilk randevunuzu oluşturun.
              </p>
            </div>
            <Button asChild>
              <Link href="/isletmeler">Salonları Keşfet</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 1. Yaklaşan Randevular */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <h2 className="text-lg font-bold text-foreground">
                  Yaklaşan Randevular ({upcomingBookings.length})
                </h2>
              </div>

              {upcomingBookings.length === 0 ? (
                <p className="text-xs text-muted-foreground italic pl-4">
                  Yaklaşan bir randevunuz bulunmuyor.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingBookings.map((b) => (
                    <BookingItem key={b.id} booking={b} />
                  ))}
                </div>
              )}
            </section>

            {/* 2. Geçmiş Randevular */}
            {pastBookings.length > 0 && (
              <section className="space-y-4 pt-4 border-t border-border/40">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                  <h2 className="text-lg font-bold text-foreground">
                    Geçmiş Randevular ({pastBookings.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pastBookings.map((b) => (
                    <BookingItem key={b.id} booking={b} />
                  ))}
                </div>
              </section>
            )}

            {/* 3. İptal Edilen Randevular */}
            {cancelledBookings.length > 0 && (
              <section className="space-y-4 pt-4 border-t border-border/40">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-destructive" />
                  <h2 className="text-lg font-bold text-foreground">
                    İptal Edilenler ({cancelledBookings.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cancelledBookings.map((b) => (
                    <BookingItem key={b.id} booking={b} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
