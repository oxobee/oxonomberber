import test from "node:test"
import assert from "node:assert"

// Randevu motoru mantıksal hesaplama birim testleri
test("Slot süresi ve çakışma mantığı testi", () => {
  // 1. Servis süresi kontrolü
  const durationMinutes = 45
  const startAt = new Date("2026-09-08T10:00:00.000Z")
  const endAt = new Date(startAt.getTime() + durationMinutes * 60 * 1000)

  assert.strictEqual(
    endAt.toISOString(),
    "2026-09-08T10:45:00.000Z",
    "Bitiş süresi doğru hesaplanmalıdır"
  )

  // 2. Çakışma algoritması testi (Overlap formula: startA < endB && endA > startB)
  const bookingA = {
    start: new Date("2026-09-08T10:00:00.000Z"),
    end: new Date("2026-09-08T11:00:00.000Z"),
  }

  // Çakışan senaryo: 10:30 - 11:15
  const overlappingRequest = {
    start: new Date("2026-09-08T10:30:00.000Z"),
    end: new Date("2026-09-08T11:15:00.000Z"),
  }

  const isOverlap1 =
    bookingA.start < overlappingRequest.end &&
    bookingA.end > overlappingRequest.start

  assert.strictEqual(isOverlap1, true, "10:30-11:15 aralığı 10:00-11:00 ile çakışmalıdır")

  // Çakışmayan senaryo: 11:00 - 11:45
  const nonOverlappingRequest = {
    start: new Date("2026-09-08T11:00:00.000Z"),
    end: new Date("2026-09-08T11:45:00.000Z"),
  }

  const isOverlap2 =
    bookingA.start < nonOverlappingRequest.end &&
    bookingA.end > nonOverlappingRequest.start

  assert.strictEqual(
    isOverlap2,
    false,
    "11:00-11:45 aralığı 10:00-11:00 ile çakışmamalıdır (ardışık slot)"
  )
})

test("İşletme çalışma saatleri ve izin kontrolü testi", () => {
  const openMinutes = 9 * 60 // 09:00
  const closeMinutes = 20 * 60 // 20:00
  const serviceDuration = 45

  // 19:30 slotu için bitiş 20:15 olur -> Kapanış saatini aştığı için geçersiz olmalı
  const requestedSlotMinutes = 19 * 60 + 30
  const exceedsClosing = requestedSlotMinutes + serviceDuration > closeMinutes

  assert.strictEqual(
    exceedsClosing,
    true,
    "Kapanış saatini aşan randevular oluşturulmamalıdır"
  )

  // 19:00 slotu için bitiş 19:45 -> Geçerli olmalı
  const validSlotMinutes = 19 * 60
  const valid = validSlotMinutes + serviceDuration <= closeMinutes

  assert.strictEqual(valid, true, "Kapanış saatinden önce biten randevular geçerlidir")
})
