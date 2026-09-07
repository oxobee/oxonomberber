import { NextResponse } from "next/server"
import { getCurrentUser } from "@/app/_lib/auth-service"
import { db } from "@/app/_lib/prisma"
import { BusinessType, UserRole } from "@prisma/client"
import { z } from "zod"

const createBusinessSchema = z.object({
  name: z.string().min(2, "İşletme adı en az 2 karakter olmalıdır"),
  type: z.nativeEnum(BusinessType),
  phone: z.string().min(10, "Geçerli bir telefon numarası giriniz"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz").optional().or(z.literal("")),
  city: z.string().default("İstanbul"),
  district: z.string().min(2, "İlçe belirtiniz"),
  address: z.string().min(5, "Açık adres belirtiniz"),
  description: z.string().optional(),
  openTime: z.string().default("09:00"),
  closeTime: z.string().default("20:00"),
  initialService: z.object({
    name: z.string().min(2),
    price: z.number().positive(),
    durationMinutes: z.number().positive(),
  }),
  initialStaff: z.object({
    name: z.string().min(2),
    surname: z.string().optional(),
    phone: z.string().optional(),
  }),
})

function slugify(text: string) {
  const trMap: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i",
    ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  }
  return text
    .split("")
    .map((c) => trMap[c] || c)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: "İşletme eklemek için lütfen giriş yapınız." },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validated = createBusinessSchema.parse(body)

    let slug = slugify(validated.name)
    // Slug çakışması kontrolü
    const existingSlug = await db.business.findUnique({ where: { slug } })
    if (existingSlug) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`
    }

    const business = await db.$transaction(async (tx) => {
      // 1. İşletmeyi oluştur
      const createdBusiness = await tx.business.create({
        data: {
          ownerId: user.id,
          name: validated.name,
          slug,
          type: validated.type,
          phone: validated.phone,
          email: validated.email || null,
          city: validated.city,
          district: validated.district,
          address: validated.address,
          description: validated.description || null,
          coverImage: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&auto=format&fit=crop&q=80",
          logo: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&auto=format&fit=crop&q=80",
          active: true,
          verified: true,
        },
      })

      // 2. Kullanıcı rolünü BUSINESS_OWNER yap
      await tx.user.update({
        where: { id: user.id },
        data: { role: UserRole.BUSINESS_OWNER },
      })

      // 3. Çalışma saatlerini ekle (Haftanın her günü)
      for (let day = 0; day <= 6; day++) {
        await tx.businessHours.create({
          data: {
            businessId: createdBusiness.id,
            dayOfWeek: day,
            openTime: validated.openTime,
            closeTime: validated.closeTime,
            isClosed: day === 0, // Pazar günleri varsayılan kapalı
          },
        })
      }

      // 4. İlk hizmeti oluştur
      const service = await tx.service.create({
        data: {
          businessId: createdBusiness.id,
          name: validated.initialService.name,
          price: validated.initialService.price,
          durationMinutes: validated.initialService.durationMinutes,
        },
      })

      // 5. İlk çalışanı oluştur
      const staff = await tx.staff.create({
        data: {
          businessId: createdBusiness.id,
          name: validated.initialStaff.name,
          surname: validated.initialStaff.surname || null,
          phone: validated.initialStaff.phone || null,
          image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
        },
      })

      // Çalışma saatleri
      for (let day = 0; day <= 6; day++) {
        await tx.staffWorkingHours.create({
          data: {
            staffId: staff.id,
            dayOfWeek: day,
            startTime: validated.openTime,
            endTime: validated.closeTime,
            isWorking: day !== 0,
          },
        })
      }

      // Çalışan-Hizmet ilişkisi
      await tx.staffService.create({
        data: {
          staffId: staff.id,
          serviceId: service.id,
        },
      })

      return createdBusiness
    })

    return NextResponse.json({ business }, { status: 201 })
  } catch (error: any) {
    console.error("Create business error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || "İşletme oluşturulurken hata oluştu." },
      { status: 500 }
    )
  }
}
