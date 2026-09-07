import Image from "next/image"
import Link from "next/link"
import { Business, Service } from "@prisma/client"
import { StarIcon, MapPinIcon } from "lucide-react"

import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"

interface BarbershopItemProps {
  barbershop: Business & {
    services?: Service[]
    reviews?: { rating: number }[]
  }
}

export const BarbershopItem = ({ barbershop }: BarbershopItemProps) => {
  // Ortalama puan hesaplama
  const avgRating = barbershop.reviews && barbershop.reviews.length > 0
    ? (barbershop.reviews.reduce((acc, r) => acc + r.rating, 0) / barbershop.reviews.length).toFixed(1)
    : "5.0"

  // Başlangıç fiyatı
  const minPrice = barbershop.services && barbershop.services.length > 0
    ? Math.min(...barbershop.services.map(s => Number(s.price)))
    : null

  const imageSrc = barbershop.coverImage || barbershop.logo || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&auto=format&fit=crop&q=80"

  return (
    <Card className="min-w-[180px] max-w-[240px] rounded-2xl overflow-hidden border border-border/60 hover:shadow-md transition-shadow group flex-shrink-0">
      <CardContent className="p-0">
        <div className="relative h-[160px] w-full overflow-hidden">
          <Image
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            fill
            alt={barbershop.name}
            src={imageSrc}
          />
          <Badge
            className="absolute left-2 top-2 space-x-1 bg-background/80 backdrop-blur text-foreground border-none"
            variant="secondary"
          >
            <StarIcon size={12} className="fill-amber-400 text-amber-400" />
            <p className="text-xs font-bold">{avgRating}</p>
          </Badge>

          {barbershop.verified && (
            <Badge
              className="absolute right-2 top-2 bg-emerald-500/90 text-white border-none text-[10px]"
            >
              Onaylı
            </Badge>
          )}
        </div>

        <div className="p-3">
          <h3 className="truncate font-bold text-sm text-foreground">{barbershop.name}</h3>
          
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <MapPinIcon className="h-3 w-3 flex-shrink-0 text-primary" />
            <p className="truncate">{barbershop.district}, {barbershop.city}</p>
          </div>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/40">
            {minPrice ? (
              <div>
                <span className="text-[10px] text-muted-foreground block">Başlangıç</span>
                <span className="font-bold text-sm text-primary">₺{minPrice}</span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">Popüler İşletme</span>
            )}

            <Button size="sm" className="h-8 px-3 text-xs" asChild>
              <Link href={`/isletme/${barbershop.slug}`}>Randevu Al</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
