import { NextResponse } from "next/server"
import { getCurrentUser } from "@/app/_lib/auth-service"
import { db } from "@/app/_lib/prisma"
import { z } from "zod"

const serviceSchema = z.object({
  name: z.string().min(2, "Hizmet adı en az 2 karakter olmalıdır"),
  description: z.string().optional(),
  price: z.number().positive("Fiyat 0'dan büyük olmalıdır"),
  durationMinutes: z.number().positive("Süre 0'dan büyük olmalıdır"),
})

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 })
    }

    const business = await db.business.findFirst({
      where: { ownerId: user.id },
      include: { staff: true },
    })

    if (!business) {
      return NextResponse.json({ error: "İşletme bulunamadı." }, { status: 404 })
    }

    const body = await req.json()
    const validated = serviceSchema.parse(body)

    const service = await db.service.create({
      data: {
        businessId: business.id,
        name: validated.name,
        description: validated.description || null,
        price: validated.price,
        durationMinutes: validated.durationMinutes,
      },
    })

    // İşletmenin çalışanlarına bu hizmeti otomatik ata
    for (const st of business.staff) {
      await db.staffService.create({
        data: {
          staffId: st.id,
          serviceId: service.id,
        },
      })
    }

    return NextResponse.json({ service }, { status: 201 })
  } catch (error: any) {
    console.error("Create service error:", error)
    return NextResponse.json({ error: error.message || "Hizmet eklenemedi." }, { status: 500 })
  }
}
