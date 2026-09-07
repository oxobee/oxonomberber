import { requireBusinessOwner } from "@/app/_lib/auth-service"
import { db } from "@/app/_lib/prisma"
import { BusinessCalendarView } from "./_components/business-calendar-view"

export default async function IsletmeTakvimPage() {
  const user = await requireBusinessOwner()

  const business = await db.business.findFirst({
    where: { ownerId: user.id },
    include: {
      staff: true,
      services: true,
    },
  })

  if (!business) {
    return <div>İşletme bulunamadı.</div>
  }

  // Önümüzdeki 14 günün randevularını çek
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + 14)

  const bookings = await db.booking.findMany({
    where: {
      businessId: business.id,
      startAt: { gte: today, lte: endDate },
    },
    include: {
      customer: true,
      service: true,
      staff: true,
    },
    orderBy: { startAt: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-foreground">
          Randevu Takvimi
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Salonunuzun günlük ve haftalık randevu doluluğunu ve personel programını takip edin.
        </p>
      </div>

      <BusinessCalendarView
        initialBookings={JSON.parse(JSON.stringify(bookings))}
        staffList={JSON.parse(JSON.stringify(business.staff))}
      />
    </div>
  )
}
