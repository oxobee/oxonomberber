import { NextResponse } from "next/server"
import { getCurrentUser } from "@/app/_lib/auth-service"
import { db } from "@/app/_lib/prisma"
import { BookingStatus, UserRole } from "@prisma/client"
import { z } from "zod"

const statusSchema = z.object({
  status: z.nativeEnum(BookingStatus),
})

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 })
    }

    const body = await req.json()
    const { status } = statusSchema.parse(body)

    const booking = await db.booking.findUnique({
      where: { id: params.id },
      include: { business: true },
    })

    if (!booking) {
      return NextResponse.json({ error: "Randevu bulunamadı." }, { status: 404 })
    }

    // Yalnızca işletme sahibi veya admin güncelleyebilir
    if (booking.business.ownerId !== user.id && user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Bu randevuyu güncelleme yetkiniz yok." }, { status: 403 })
    }

    const updated = await db.booking.update({
      where: { id: params.id },
      data: { status },
    })

    return NextResponse.json({ booking: updated })
  } catch (error: any) {
    console.error("Status update error:", error)
    return NextResponse.json({ error: error.message || "Güncelleme başarısız." }, { status: 500 })
  }
}
