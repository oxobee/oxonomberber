import { NextResponse, type NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Supabase auth cookie kontrolü (sb-*-auth-token)
  const path = request.nextUrl.pathname
  const isProtectedPath = path.startsWith("/hesabim") || path.startsWith("/isletme-paneli")

  if (isProtectedPath) {
    const hasAuthCookie = request.cookies
      .getAll()
      .some((c) => c.name.includes("auth-token") || c.name.includes("supabase"))

    if (!hasAuthCookie) {
      const redirectUrl = new URL("/giris", request.url)
      redirectUrl.searchParams.set("next", path)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
