"use server"

import { revalidatePath } from "next/cache"
import { db } from "../_lib/prisma"
import { getCurrentUser } from "../_lib/auth-service"
import { BookingStatus } from "@prisma/client"

export const deleteBooking = async (bookingId: string) => {
  const user = await getCurrentUser()
  if (!user) throw new Error("Giriş yapmalısınız")

  await db.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      status: BookingStatus.CANCELLED,
      cancelledAt: new Date(),
    },
  })
  revalidatePath("/hesabim/randevularim")
}
