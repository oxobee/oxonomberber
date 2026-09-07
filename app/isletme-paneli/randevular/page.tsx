import { requireBusinessOwner } from "@/app/_lib/auth-service"
import { db } from "@/app/_lib/prisma"
import { BookingStatusManager } from "./_components/booking-status-manager"

export default async function IsletmeRandevularPage() {
  const user = await requireBusinessOwner()

  const business = await db.business.findFirst({
    where: { ownerId: user.id },
  })

  if (!business) {
    return <div>İşletme bulunamadı.</div>
  }

  const bookings = await db.booking.findMany({
    where: { businessId: business.id },
    include: {
      customer: true,
      service: true,
      staff: true,
    },
    orderBy: { startAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-foreground">
          Randevu Yönetimi
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tüm müşteri randevularınızı görüntüleyin, onaylayın veya tamamlandı olarak işaretleyin.
        </p>
      </div>

      <BookingStatusManager initialBookings={JSON.parse(JSON.stringify(bookings))} />
    </div>
  )
}
