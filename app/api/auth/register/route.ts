import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { db } from "@/app/_lib/prisma"
import { UserRole } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-posta ve şifre zorunludur." },
        { status: 400 }
      )
    }

    const cookieStore = cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message || "Kayıt işlemi başarısız oldu." },
        { status: 400 }
      )
    }

    // Prisma User kaydını oluştur
    await db.user.upsert({
      where: { email },
      update: {
        authUserId: data.user.id,
        name: name || email.split("@")[0],
      },
      create: {
        authUserId: data.user.id,
        email,
        name: name || email.split("@")[0],
        role: UserRole.CUSTOMER,
      },
    })

    return NextResponse.json({ user: data.user })
  } catch (error: any) {
    console.error("Server register error:", error)
    return NextResponse.json(
      { error: error.message || "Kayıt sırasında hata oluştu." },
      { status: 500 }
    )
  }
}
