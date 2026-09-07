import { NextResponse } from "next/server"
import { getCurrentUser } from "@/app/_lib/auth-service"
import { db } from "@/app/_lib/prisma"
import { BookingStatus, UserRole } from "@prisma/client"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmalısınız." },
        { status: 401 }
      )
    }

    const bookingId = params.id
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { business: true },
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Randevu bulunamadı." },
        { status: 404 }
      )
    }

    // Yetki kontrolü: Randevunun sahibi olan müşteri veya randevunun ait olduğu işletmenin sahibi veya admin
    const isCustomer = booking.customerId === user.id
    const isOwner = booking.business.ownerId === user.id
    const isAdmin = user.role === UserRole.ADMIN

    if (!isCustomer && !isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Bu randevuyu iptal etme yetkiniz bulunmuyor." },
        { status: 403 }
      )
    }

    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: isCustomer ? "Müşteri tarafından iptal edildi" : "İşletme tarafından iptal edildi",
      },
    })

    return NextResponse.json({ booking: updatedBooking })
  } catch (error: any) {
    console.error("Cancel booking error:", error)
    return NextResponse.json(
      { error: error.message || "Randevu iptal edilemedi." },
      { status: 500 }
    )
  }
}
