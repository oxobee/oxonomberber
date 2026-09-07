import { NextResponse } from "next/server"
import { getAvailableSlots } from "@/app/_lib/booking-engine"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const businessId = searchParams.get("businessId")
    const serviceId = searchParams.get("serviceId")
    const staffId = searchParams.get("staffId") || undefined
    const dateStr = searchParams.get("date") // "YYYY-MM-DD"

    if (!businessId || !serviceId || !dateStr) {
      return NextResponse.json(
        { error: "businessId, serviceId ve date parametreleri zorunludur." },
        { status: 400 }
      )
    }

    const slots = await getAvailableSlots({
      businessId,
      serviceId,
      staffId: staffId === "any" ? undefined : staffId,
      dateStr,
    })

    return NextResponse.json({ slots })
  } catch (error: any) {
    console.error("available-slots error:", error)
    return NextResponse.json(
      { error: error.message || "Müsait saatler alınamadı." },
      { status: 500 }
    )
  }
}
