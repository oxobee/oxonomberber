import { db } from "./prisma"
import { BookingStatus } from "@prisma/client"

export interface TimeSlot {
  time: string // "09:30"
  available: boolean
}

/**
 * Belirli bir tarih ve çalışan/hizmet için müsait saat dilimlerini hesaplar.
 */
export async function getAvailableSlots({
  businessId,
  serviceId,
  staffId,
  dateStr, // "YYYY-MM-DD"
}: {
  businessId: string
  serviceId: string
  staffId?: string
  dateStr: string
}): Promise<TimeSlot[]> {
  const service = await db.service.findUnique({
    where: { id: serviceId },
  })

  if (!service) {
    throw new Error("Hizmet bulunamadı.")
  }

  // Tarihi parse et (Europe/Istanbul)
  const targetDate = new Date(`${dateStr}T00:00:00.000Z`)
  const dayOfWeek = targetDate.getUTCDay() // 0 = Sunday, 1 = Monday...

  // 1. İşletme Çalışma Saatleri Kontrolü
  const bHours = await db.businessHours.findUnique({
    where: {
      businessId_dayOfWeek: {
        businessId,
        dayOfWeek,
      },
    },
  })

  if (!bHours || bHours.isClosed) {
    return [] // İşletme o gün kapalı
  }

  // 2. Çalışan Çalışma Saatleri & İzin Kontrolü
  let staffList = []
  if (staffId && staffId !== "any") {
    const s = await db.staff.findUnique({
      where: { id: staffId },
      include: {
        workingHours: { where: { dayOfWeek } },
        timeOff: true,
      },
    })
    if (s && s.active) staffList.push(s)
  } else {
    // "Fark etmez" seçildiyse o hizmeti veren tüm aktif çalışanlar
    const staffWithService = await db.staff.findMany({
      where: {
        businessId,
        active: true,
        staffServices: { some: { serviceId } },
      },
      include: {
        workingHours: { where: { dayOfWeek } },
        timeOff: true,
      },
    })
    staffList = staffWithService
  }

  if (staffList.length === 0) {
    return []
  }

  // O günkü mevcut randevular (CONFIRMED ve PENDING)
  const dayStart = new Date(`${dateStr}T00:00:00.000Z`)
  const dayEnd = new Date(`${dateStr}T23:59:59.999Z`)

  const existingBookings = await db.booking.findMany({
    where: {
      businessId,
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
      startAt: { gte: dayStart, lte: dayEnd },
    },
  })

  // Zaman aralıklarını oluştur (örn. 09:00 - 20:00, 30 dk aralıklarla)
  const [openHour, openMin] = bHours.openTime.split(":").map(Number)
  const [closeHour, closeMin] = bHours.closeTime.split(":").map(Number)

  const openMinutes = openHour * 60 + openMin
  const closeMinutes = closeHour * 60 + closeMin
  const serviceDuration = service.durationMinutes

  const slots: TimeSlot[] = []

  // Şimdiki zamanı al (geçmiş saatlere randevu verilmesin)
  const now = new Date()
  const isToday = now.toISOString().split("T")[0] === dateStr
  const currentMinutesToday = (now.getUTCHours() + 3) * 60 + now.getUTCMinutes() // Turkey UTC+3

  for (let m = openMinutes; m + serviceDuration <= closeMinutes; m += 30) {
    const slotHour = Math.floor(m / 60)
    const slotMin = m % 60
    const timeStr = `${String(slotHour).padStart(2, "0")}:${String(slotMin).padStart(2, "0")}`

    // Bugün ise geçmiş saatleri kapat
    if (isToday && m <= currentMinutesToday) {
      slots.push({ time: timeStr, available: false })
      continue
    }

    // Slot için başlangıç ve bitiş zamanı
    const slotStart = new Date(`${dateStr}T${timeStr}:00.000Z`)
    const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60 * 1000)

    // En az bir çalışan bu slotta tamamen müsait mi?
    let hasAvailableStaff = false

    for (const staff of staffList) {
      // Çalışanın çalışma saatleri var mı?
      const wh = staff.workingHours.find((w) => w.dayOfWeek === dayOfWeek)
      if (!wh || !wh.isWorking) continue

      const [sStartH, sStartM] = wh.startTime.split(":").map(Number)
      const [sEndH, sEndM] = wh.endTime.split(":").map(Number)
      const sStartMin = sStartH * 60 + sStartM
      const sEndMin = sEndH * 60 + sEndM

      if (m < sStartMin || m + serviceDuration > sEndMin) {
        continue // Çalışanın mesai saatleri dışı
      }

      // Çalışanın izni var mı?
      const onLeave = staff.timeOff.some(
        (to) => slotStart < to.endAt && slotEnd > to.startAt
      )
      if (onLeave) continue

      // Çalışanın çakışan randevusu var mı?
      const hasConflict = existingBookings.some(
        (b) => b.staffId === staff.id && slotStart < b.endAt && slotEnd > b.startAt
      )
      if (!hasConflict) {
        hasAvailableStaff = true
        break
      }
    }

    slots.push({ time: timeStr, available: hasAvailableStaff })
  }

  return slots
}

/**
 * Yarış durumlarını (race condition) ve çakışmayı önleyen güvenli randevu oluşturucu.
 */
export async function createBookingWithTransaction({
  customerId,
  businessId,
  serviceId,
  staffId,
  startAt,
  customerNote,
}: {
  customerId: string
  businessId: string
  serviceId: string
  staffId?: string
  startAt: Date
  customerNote?: string
}) {
  return await db.$transaction(async (tx) => {
    const service = await tx.service.findUnique({
      where: { id: serviceId },
    })

    if (!service) {
      throw new Error("Hizmet bulunamadı.")
    }

    const endAt = new Date(startAt.getTime() + service.durationMinutes * 60 * 1000)

    // Eğer staffId belirtilmemişse ("Fark etmez"), müsait olan ilk personeli seç
    let assignedStaffId = staffId

    if (!assignedStaffId || assignedStaffId === "any") {
      const availableStaffList = await tx.staff.findMany({
        where: {
          businessId,
          active: true,
          staffServices: { some: { serviceId } },
        },
      })

      if (availableStaffList.length === 0) {
        throw new Error("Bu hizmet için uygun personel bulunamadı.")
      }

      for (const s of availableStaffList) {
        const conflict = await tx.booking.findFirst({
          where: {
            staffId: s.id,
            status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
            startAt: { lt: endAt },
            endAt: { gt: startAt },
          },
        })

        if (!conflict) {
          assignedStaffId = s.id
          break
        }
      }

      if (!assignedStaffId || assignedStaffId === "any") {
        throw new Error("Seçilen saat diliminde müsait personel kalmadı.")
      }
    } else {
      // Seçilen personelin çakışmasını kilitleyerek kontrol et
      const conflict = await tx.booking.findFirst({
        where: {
          staffId: assignedStaffId,
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
          startAt: { lt: endAt },
          endAt: { gt: startAt },
        },
      })

      if (conflict) {
        throw new Error("Seçilen randevu saati başka bir müşteri tarafından rezerve edildi. Lütfen başka bir saat seçiniz.")
      }
    }

    // Randevuyu oluştur
    const booking = await tx.booking.create({
      data: {
        customerId,
        businessId,
        serviceId,
        staffId: assignedStaffId,
        startAt,
        endAt,
        priceSnapshot: service.price,
        durationSnapshot: service.durationMinutes,
        status: BookingStatus.CONFIRMED,
        customerNote: customerNote || null,
      },
      include: {
        business: true,
        service: true,
        staff: true,
      },
    })

    return booking
  })
}
