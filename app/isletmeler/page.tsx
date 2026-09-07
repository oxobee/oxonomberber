import { Header } from "../_components/header"
import { BarbershopItem } from "../_components/barbershop-item"
import { Search } from "../_components/search"
import { db } from "../_lib/prisma"
import { BusinessType } from "@prisma/client"
import Link from "next/link"
import { Button } from "../_components/ui/button"

interface IsletmelerPageProps {
  searchParams: {
    q?: string
    ilce?: string
    kategori?: string
  }
}

export default async function IsletmelerPage({ searchParams }: IsletmelerPageProps) {
  const query = searchParams.q?.trim() || ""
  const district = searchParams.ilce?.trim() || ""
  const categoryParam = searchParams.kategori?.trim() || ""

  let typeFilter: BusinessType | undefined
  if (categoryParam === "barber") typeFilter = BusinessType.BARBER
  if (categoryParam === "hairdresser") typeFilter = BusinessType.HAIRDRESSER
  if (categoryParam === "beauty") typeFilter = BusinessType.BEAUTY_SALON

  const businesses = await db.business.findMany({
    where: {
      active: true,
      ...(typeFilter && { type: typeFilter }),
      ...(district && { district: { contains: district, mode: "insensitive" } }),
      ...(query && {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { district: { contains: query, mode: "insensitive" } },
          {
            services: {
              some: { name: { contains: query, mode: "insensitive" } },
            },
          },
        ],
      }),
    },
    include: {
      services: true,
      reviews: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const popularDistricts = ["Tümü", "Kadıköy", "Beşiktaş", "Şişli", "Üsküdar", "Bakırköy"]

  return (
    <div className="min-h-screen pb-16">
      <Header />

      <div className="max-w-7xl mx-auto px-5 md:px-12 lg:px-24 py-8 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {query ? `"${query}" için arama sonuçları` : "Tüm Kuaför ve Berberler"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {businesses.length} işletme listeleniyor
          </p>
        </div>

        {/* Filtre ve Arama */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-96">
            <Search />
          </div>

          {/* İlçe Filtreleri */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 [&::-webkit-scrollbar]:hidden">
            {popularDistricts.map((d) => {
              const isSelected = (!district && d === "Tümü") || district === d
              return (
                <Button
                  key={d}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className="rounded-full text-xs flex-shrink-0"
                  asChild
                >
                  <Link
                    href={`/isletmeler?${new URLSearchParams({
                      ...(query && { q: query }),
                      ...(categoryParam && { kategori: categoryParam }),
                      ...(d !== "Tümü" && { ilce: d }),
                    }).toString()}`}
                  >
                    {d}
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>

        {/* İşletme Listesi */}
        {businesses.length === 0 ? (
          <div className="text-center py-16 border rounded-2xl bg-muted/20 space-y-3">
            <p className="text-lg font-semibold text-foreground">Uygun işletme bulunamadı.</p>
            <p className="text-sm text-muted-foreground">
              Arama kriterlerinizi değiştirerek tekrar deneyebilirsiniz.
            </p>
            <Button variant="outline" asChild>
              <Link href="/isletmeler">Filtreleri Temizle</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {businesses.map((business) => (
              <BarbershopItem key={business.id} barbershop={business} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
