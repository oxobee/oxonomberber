import { NextResponse } from "next/server"
import { getCurrentUser } from "@/app/_lib/auth-service"
import { db } from "@/app/_lib/prisma"

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 })
    }

    const staff = await db.staff.findUnique({
      where: { id: params.id },
      include: { business: true },
    })

    if (!staff) {
      return NextResponse.json({ error: "Personel bulunamadı." }, { status: 404 })
    }

    if (staff.business.ownerId !== user.id) {
      return NextResponse.json({ error: "Bu işlemi yapmaya yetkiniz yok." }, { status: 403 })
    }

    await db.staff.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Delete staff error:", error)
    return NextResponse.json({ error: error.message || "Personel silinemedi." }, { status: 500 })
  }
}
