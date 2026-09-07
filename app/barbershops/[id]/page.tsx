import { redirect, notFound } from "next/navigation"
import { db } from "@/app/_lib/prisma"

interface BarbershopLegacyProps {
  params: { id: string }
}

export default async function LegacyBarbershopRedirect({ params }: BarbershopLegacyProps) {
  const business = await db.business.findFirst({
    where: {
      OR: [{ id: params.id }, { slug: params.id }],
    },
  })

  if (!business) {
    notFound()
  }

  redirect(`/isletme/${business.slug}`)
}
