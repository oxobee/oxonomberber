import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { db } from "@/app/_lib/prisma"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-posta ve şifre zorunludur." },
        { status: 400 }
      )
    }

    const cookieStore = cookies()

    // Sunucu tarafında cookie yönetimi
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
            } catch {
              // Server component write protection bypass
            }
          },
        },
      }
    )

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.session) {
      return NextResponse.json(
        { error: error?.message || "Giriş yapılamadı. Bilgilerinizi kontrol ediniz." },
        { status: 401 }
      )
    }

    // Prisma User profilini getir
    const user = await db.user.findFirst({
      where: {
        OR: [{ authUserId: data.user.id }, { email: data.user.email }],
      },
    })

    // Next.js response cookies
    const response = NextResponse.json({
      user: data.user,
      role: user?.role || "CUSTOMER",
      session: data.session,
    })

    return response
  } catch (error: any) {
    console.error("Server login error:", error)
    return NextResponse.json(
      { error: error.message || "Giriş işlemi sırasında sunucu hatası oluştu." },
      { status: 500 }
    )
  }
}
