import { requireBusinessOwner } from "@/app/_lib/auth-service"
import { db } from "@/app/_lib/prisma"
import { StaffManager } from "./_components/staff-manager"

export default async function IsletmeCalisanlarPage() {
  const user = await requireBusinessOwner()

  const business = await db.business.findFirst({
    where: { ownerId: user.id },
    include: {
      staff: {
        include: {
          staffServices: { include: { service: true } },
        },
      },
    },
  })

  if (!business) {
    return <div>İşletme bulunamadı.</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-foreground">
          Çalışan Yönetimi
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Salonunuzdaki berber, kuaför ve uzman personellerinizi yönetin.
        </p>
      </div>

      <StaffManager initialStaff={JSON.parse(JSON.stringify(business.staff))} />
    </div>
  )
}
