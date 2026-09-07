"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "../_lib/auth-service"
import { createBookingWithTransaction } from "../_lib/booking-engine"

interface CreateBookingParams {
  businessId: string
  serviceId: string
  staffId?: string
  date: Date
  customerNote?: string
}

export const createBooking = async (params: CreateBookingParams) => {
  const user = await getCurrentUser()
  if (!user) throw new Error("Giriş yapmalısınız")

  await createBookingWithTransaction({
    customerId: user.id,
    businessId: params.businessId,
    serviceId: params.serviceId,
    staffId: params.staffId,
    startAt: params.date,
    customerNote: params.customerNote,
  })

  revalidatePath("/hesabim/randevularim")
  revalidatePath("/isletmeler")
}
