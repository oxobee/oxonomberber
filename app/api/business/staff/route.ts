import { NextResponse } from "next/server"
import { getCurrentUser } from "@/app/_lib/auth-service"
import { db } from "@/app/_lib/prisma"
import { z } from "zod"

const staffSchema = z.object({
  name: z.string().min(2, "Çalışan adı en az 2 karakter olmalıdır"),
  surname: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 })
    }

    const business = await db.business.findFirst({
      where: { ownerId: user.id },
      include: { services: true },
    })

    if (!business) {
      return NextResponse.json({ error: "İşletme bulunamadı." }, { status: 404 })
    }

    const body = await req.json()
    const validated = staffSchema.parse(body)

    const staff = await db.$transaction(async (tx) => {
      const created = await tx.staff.create({
        data: {
          businessId: business.id,
          name: validated.name,
          surname: validated.surname || null,
          phone: validated.phone || null,
          bio: validated.bio || null,
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        },
      })

      // Çalışma saatlerini varsayılan oluştur (Pzt-Cmt 09:00 - 19:00)
      for (let day = 0; day <= 6; day++) {
        await tx.staffWorkingHours.create({
          data: {
            staffId: created.id,
            dayOfWeek: day,
            startTime: "09:00",
            endTime: "19:00",
            isWorking: day !== 0,
          },
        })
      }

      // İşletmenin tüm mevcut hizmetlerine yetkilendir
      for (const service of business.services) {
        await tx.staffService.create({
          data: {
            staffId: created.id,
            serviceId: service.id,
          },
        })
      }

      return created
    })

    return NextResponse.json({ staff }, { status: 201 })
  } catch (error: any) {
    console.error("Create staff error:", error)
    return NextResponse.json({ error: error.message || "Personel eklenemedi." }, { status: 500 })
  }
}
