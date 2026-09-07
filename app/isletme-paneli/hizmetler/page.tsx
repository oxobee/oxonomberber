import { requireBusinessOwner } from "@/app/_lib/auth-service"
import { db } from "@/app/_lib/prisma"
import { ServicesManager } from "./_components/services-manager"

export default async function IsletmeHizmetlerPage() {
  const user = await requireBusinessOwner()

  const business = await db.business.findFirst({
    where: { ownerId: user.id },
    include: {
      services: { orderBy: { price: "asc" } },
    },
  })

  if (!business) {
    return <div>İşletme bulunamadı.</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-foreground">
          Hizmet Yönetimi
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Salonunuzda sunduğunuz saç kesimi, sakal tıraşı ve bakım hizmetlerini yönetin.
        </p>
      </div>

      <ServicesManager initialServices={JSON.parse(JSON.stringify(business.services))} />
    </div>
  )
}
