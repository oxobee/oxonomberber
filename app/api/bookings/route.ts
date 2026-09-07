import { NextResponse } from "next/server"
import { getCurrentUser } from "@/app/_lib/auth-service"
import { createBookingWithTransaction } from "@/app/_lib/booking-engine"
import { z } from "zod"

const bookingSchema = z.object({
  businessId: z.string().uuid(),
  serviceId: z.string().uuid(),
  staffId: z.string().optional(),
  date: z.string(), // "2026-09-08"
  time: z.string(), // "14:30"
  customerNote: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: "Randevu oluşturmak için lütfen önce giriş yapınız." },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validated = bookingSchema.parse(body)

    const startAt = new Date(`${validated.date}T${validated.time}:00.000Z`)

    // Geçmiş zamana randevu alınamaz
    if (startAt.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "Geçmiş bir tarihe veya saate randevu oluşturulamaz." },
        { status: 400 }
      )
    }

    const booking = await createBookingWithTransaction({
      customerId: user.id,
      businessId: validated.businessId,
      serviceId: validated.serviceId,
      staffId: validated.staffId,
      startAt,
      customerNote: validated.customerNote,
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error: any) {
    console.error("Booking creation error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Geçersiz form verisi." }, { status: 400 })
    }
    return NextResponse.json(
      { error: error.message || "Randevu oluşturulurken bir hata meydana geldi." },
      { status: 400 }
    )
  }
}
