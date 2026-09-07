import { createClient } from "./supabase/server"
import { db } from "./prisma"
import { UserRole } from "@prisma/client"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    return null
  }

  // Prisma User kaydını bul veya oluştur
  let user = await db.user.findFirst({
    where: {
      OR: [
        { authUserId: authUser.id },
        { email: authUser.email || "" },
      ],
    },
    include: {
      ownedBusinesses: true,
    },
  })

  if (!user && authUser.email) {
    user = await db.user.create({
      data: {
        authUserId: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name || authUser.email.split("@")[0],
        avatar: authUser.user_metadata?.avatar_url,
        role: UserRole.CUSTOMER,
      },
      include: {
        ownedBusinesses: true,
      },
    })
  } else if (user && !user.authUserId) {
    // authUserId henüz bağlanmamışsa bağla
    user = await db.user.update({
      where: { id: user.id },
      data: { authUserId: authUser.id },
      include: {
        ownedBusinesses: true,
      },
    })
  }

  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/giris")
  }
  return user
}

export async function requireBusinessOwner() {
  const user = await requireAuth()
  if (user.role !== UserRole.BUSINESS_OWNER && user.role !== UserRole.ADMIN) {
    redirect("/isletme-ekle")
  }
  return user
}
