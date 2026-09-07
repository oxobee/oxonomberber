import { requireAdmin } from "@/app/_lib/auth-service"
import { db } from "@/app/_lib/prisma"
import { Header } from "@/app/_components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card"
import { Badge } from "@/app/_components/ui/badge"
import { Button } from "@/app/_components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import {
  ShieldCheckIcon,
  StoreIcon,
  UsersIcon,
  CalendarIcon,
  BanknoteIcon,
  ExternalLinkIcon,
  CheckCircle2Icon,
} from "lucide-react"

export default async function AdminDashboardPage() {
  const admin = await requireAdmin()

  const [businesses, users, bookings] = await Promise.all([
    db.business.findMany({
      include: {
        owner: true,
        services: true,
        staff: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.booking.findMany({
      include: {
        business: true,
        service: true,
      },
    }),
  ])

  const totalRevenue = bookings.reduce(
    (sum, b) => sum + Number(b.priceSnapshot),
    0
  )

  return (
    <div className="min-h-screen pb-20 bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-5 md:px-12 py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-destructive/10 text-destructive">
              <ShieldCheckIcon className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-foreground">
                  Süper Admin Paneli
                </h1>
                <Badge variant="destructive">Platform Yönetimi</Badge>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Giriş yapan yönetici: <strong>{admin.email}</strong> ({admin.name})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/isletmeler" target="_blank">
                Pazaryerini Görüntüle
              </Link>
            </Button>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-border/70">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground">
                Toplam İşletme
              </CardTitle>
              <StoreIcon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-foreground">{businesses.length}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Kayıtlı kuaför/berber salonu</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/70">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground">
                Toplam Kullanıcı
              </CardTitle>
              <UsersIcon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-foreground">{users.length}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Müşteri ve işletme sahipleri</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/70">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground">
                Toplam Randevu
              </CardTitle>
              <CalendarIcon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-foreground">{bookings.length}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Oluşturulan randevu adedi</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/70">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground">
                Platform İşlem Hacmi
              </CardTitle>
              <BanknoteIcon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-primary">
                ₺{totalRevenue.toLocaleString("tr-TR")}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Toplam randevu cirosu</p>
            </CardContent>
          </Card>
        </div>

        {/* İşletmeler Tablosu */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Kayıtlı İşletmeler</h2>
            <span className="text-xs text-muted-foreground">{businesses.length} Salon</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {businesses.map((b) => (
              <Card key={b.id} className="p-4 rounded-2xl border-border/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base text-foreground">{b.name}</h3>
                    {b.verified ? (
                      <Badge className="bg-emerald-600 gap-1 text-[11px]">
                        <CheckCircle2Icon className="h-3 w-3" /> Doğrulanmış
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-500 border-amber-500 text-[11px]">
                        Beklemede
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      ({b.district}, {b.city})
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Sahibi: <strong>{b.owner.name || b.owner.email}</strong> • Tel: {b.phone || "Belirtilmemiş"}
                  </p>
                  <p className="text-xs text-primary font-medium">
                    {b.services.length} Hizmet • {b.staff.length} Personel
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5" asChild>
                    <Link href={`/isletme/${b.slug}`} target="_blank">
                      <ExternalLinkIcon className="h-3.5 w-3.5" />
                      İncele
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Kullanıcılar Listesi */}
        <div className="space-y-4 pt-6 border-t border-border/60">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Son Kayıt Olan Kullanıcılar</h2>
            <span className="text-xs text-muted-foreground">{users.length} Kullanıcı</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {users.map((u) => (
              <Card key={u.id} className="p-4 rounded-2xl border-border/70 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-foreground truncate">{u.name || "İsimsiz"}</h4>
                  <Badge variant={u.role === "ADMIN" ? "destructive" : u.role === "BUSINESS_OWNER" ? "default" : "secondary"} className="text-[10px]">
                    {u.role}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                <p className="text-[10px] text-muted-foreground pt-1">
                  Kayıt: {format(new Date(u.createdAt), "dd.MM.yyyy HH:mm", { locale: tr })}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
