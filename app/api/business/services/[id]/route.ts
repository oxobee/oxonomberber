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

    const service = await db.service.findUnique({
      where: { id: params.id },
      include: { business: true },
    })

    if (!service) {
      return NextResponse.json({ error: "Hizmet bulunamadı." }, { status: 404 })
    }

    if (service.business.ownerId !== user.id) {
      return NextResponse.json({ error: "Bu işlemi yapmaya yetkiniz yok." }, { status: 403 })
    }

    await db.service.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Delete service error:", error)
    return NextResponse.json({ error: error.message || "Hizmet silinemedi." }, { status: 500 })
  }
}
