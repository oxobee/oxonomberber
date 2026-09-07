"use server"

import { getCurrentUser } from "../_lib/auth-service"
import { db } from "../_lib/prisma"
import { BookingStatus } from "@prisma/client"

export const getFinalizedBookings = async () => {
  const user = await getCurrentUser()
  if (!user) return []

  return await db.booking.findMany({
    where: {
      customerId: user.id,
      OR: [
        { startAt: { lt: new Date() } },
        { status: BookingStatus.COMPLETED },
      ],
      status: { not: BookingStatus.CANCELLED },
    },
    include: {
      business: true,
      service: true,
      staff: true,
    },
    orderBy: { startAt: "desc" },
  })
}
