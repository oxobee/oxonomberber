"use client"

import { useState } from "react"
import { BookingStatus } from "@prisma/client"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { toast } from "sonner"
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CheckCircle2Icon,
  XCircleIcon,
  AlertCircleIcon,
} from "lucide-react"
import { Card } from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import { Badge } from "@/app/_components/ui/badge"

export function BookingStatusManager({ initialBookings }: { initialBookings: any[] }) {
  const [bookings, setBookings] = useState(initialBookings)
  const [activeFilter, setActiveFilter] = useState<string>("ALL")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const updateStatus = async (id: string, status: BookingStatus) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/business/bookings/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) throw new Error("Durum güncellenemedi.")

      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      )
      toast.success("Randevu durumu güncellendi.")
    } catch (err: any) {
      toast.error(err.message || "Bir hata oluştu.")
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredBookings = bookings.filter((b) => {
    if (activeFilter === "ALL") return true
    return b.status === activeFilter
  })

  return (
    <div className="space-y-4">
      {/* Filtre Butonları */}
      <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
        {[
          { label: "Tümü", value: "ALL" },
          { label: "Onaylı", value: BookingStatus.CONFIRMED },
          { label: "Tamamlanan", value: BookingStatus.COMPLETED },
          { label: "İptal Edilen", value: BookingStatus.CANCELLED },
          { label: "Gelmedi", value: BookingStatus.NO_SHOW },
        ].map((f) => (
          <Button
            key={f.value}
            variant={activeFilter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(f.value)}
            className="rounded-full text-xs"
          >
            {f.label}
          </Button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground text-sm bg-muted/20 border-dashed">
          Seçili filtrede randevu bulunamadı.
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((b) => {
            const startDate = new Date(b.startAt)
            return (
              <Card key={b.id} className="p-4 rounded-2xl border-border/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-muted text-foreground min-w-[70px]">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                      {format(startDate, "MMM", { locale: tr })}
                    </span>
                    <span className="text-xl font-black">{format(startDate, "dd")}</span>
                    <span className="text-xs font-bold text-primary">{format(startDate, "HH:mm")}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base text-foreground">
                        {b.customer.name || "Misafir"}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        ({b.customer.phone || b.customer.email})
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-primary">
                      {b.service.name} • ₺{Number(b.priceSnapshot)} ({b.durationSnapshot} dk)
                    </p>

                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <UserIcon className="h-3 w-3" /> Personel: {b.staff.name} {b.staff.surname}
                    </p>

                    {b.customerNote && (
                      <p className="text-xs bg-muted/40 p-2 rounded-lg border text-muted-foreground mt-1 italic">
                        Not: "{b.customerNote}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                  <Badge
                    variant={
                      b.status === "CONFIRMED"
                        ? "default"
                        : b.status === "COMPLETED"
                        ? "secondary"
                        : b.status === "CANCELLED"
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {b.status === "CONFIRMED"
                      ? "Onaylı"
                      : b.status === "COMPLETED"
                      ? "Tamamlandı"
                      : b.status === "CANCELLED"
                      ? "İptal Edildi"
                      : "Gelmedi"}
                  </Badge>

                  {b.status === "CONFIRMED" && (
                    <div className="flex gap-1.5 mt-2 sm:mt-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                        disabled={updatingId === b.id}
                        onClick={() => updateStatus(b.id, BookingStatus.COMPLETED)}
                      >
                        <CheckCircle2Icon className="h-3.5 w-3.5 mr-1" />
                        Tamamla
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
                        disabled={updatingId === b.id}
                        onClick={() => updateStatus(b.id, BookingStatus.NO_SHOW)}
                      >
                        <AlertCircleIcon className="h-3.5 w-3.5 mr-1" />
                        Gelmedi
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
                        disabled={updatingId === b.id}
                        onClick={() => updateStatus(b.id, BookingStatus.CANCELLED)}
                      >
                        <XCircleIcon className="h-3.5 w-3.5 mr-1" />
                        İptal
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
