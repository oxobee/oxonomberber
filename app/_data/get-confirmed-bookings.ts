"use server"

import { getCurrentUser } from "../_lib/auth-service"
import { db } from "../_lib/prisma"
import { BookingStatus } from "@prisma/client"

export const getConfirmedBookings = async () => {
  const user = await getCurrentUser()
  if (!user) return []

  return await db.booking.findMany({
    where: {
      customerId: user.id,
      status: BookingStatus.CONFIRMED,
      startAt: { gte: new Date() },
    },
    include: {
      business: true,
      service: true,
      staff: true,
    },
    orderBy: { startAt: "asc" },
  })
}
