import { requireBusinessOwner } from "@/app/_lib/auth-service"
import { db } from "@/app/_lib/prisma"
import Link from "next/link"
import {
  LayoutDashboardIcon,
  CalendarDaysIcon,
  CalendarCheckIcon,
  ScissorsIcon,
  UsersIcon,
  StoreIcon,
  ArrowLeftIcon,
  ExternalLinkIcon,
} from "lucide-react"
import { Button } from "@/app/_components/ui/button"

export default async function IsletmePaneliLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireBusinessOwner()

  const business = await db.business.findFirst({
    where: { ownerId: user.id },
  })

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Sol Sidebar */}
      <aside className="w-full md:w-64 border-r border-border/60 bg-card flex flex-col justify-between p-4 md:p-6 flex-shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-sm">
              Ö
            </div>
            <div className="flex flex-col">
              <span className="font-black text-base text-foreground leading-none">
                İşletme Paneli
              </span>
              <span className="text-[10px] text-muted-foreground truncate max-w-[140px] mt-0.5">
                {business?.name || "Yönetim"}
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            <Button variant="ghost" className="w-full justify-start gap-3 text-sm font-semibold" asChild>
              <Link href="/isletme-paneli">
                <LayoutDashboardIcon className="h-4 w-4 text-primary" />
                Genel Bakış
              </Link>
            </Button>

            <Button variant="ghost" className="w-full justify-start gap-3 text-sm font-semibold" asChild>
              <Link href="/isletme-paneli/randevular">
                <CalendarCheckIcon className="h-4 w-4 text-primary" />
                Randevular
              </Link>
            </Button>

            <Button variant="ghost" className="w-full justify-start gap-3 text-sm font-semibold" asChild>
              <Link href="/isletme-paneli/takvim">
                <CalendarDaysIcon className="h-4 w-4 text-primary" />
                Takvim
              </Link>
            </Button>

            <Button variant="ghost" className="w-full justify-start gap-3 text-sm font-semibold" asChild>
              <Link href="/isletme-paneli/hizmetler">
                <ScissorsIcon className="h-4 w-4 text-primary" />
                Hizmetler
              </Link>
            </Button>

            <Button variant="ghost" className="w-full justify-start gap-3 text-sm font-semibold" asChild>
              <Link href="/isletme-paneli/calisanlar">
                <UsersIcon className="h-4 w-4 text-primary" />
                Çalışanlar
              </Link>
            </Button>
          </nav>
        </div>

        <div className="pt-6 border-t border-border/60 space-y-2 mt-6">
          {business && (
            <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs" asChild>
              <Link href={`/isletme/${business.slug}`} target="_blank">
                <ExternalLinkIcon className="h-3.5 w-3.5" />
                İşletme Sayfamı Gör
              </Link>
            </Button>
          )}

          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-xs text-muted-foreground" asChild>
            <Link href="/">
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              Ana Sayfaya Dön
            </Link>
          </Button>
        </div>
      </aside>

      {/* Ana İçerik */}
      <main className="flex-1 p-5 md:p-10 overflow-y-auto max-w-6xl">
        {children}
      </main>
    </div>
  )
}
