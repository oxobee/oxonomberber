"use client"

import { useState } from "react"
import { format, addDays, isSameDay } from "date-fns"
import { tr } from "date-fns/locale"
import { Staff } from "@prisma/client"
import { Card } from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import { Badge } from "@/app/_components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/_components/ui/dialog"
import {
  ClockIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"

export function BusinessCalendarView({
  initialBookings,
  staffList,
}: {
  initialBookings: any[]
  staffList: Staff[]
}) {
  const [selectedDayOffset, setSelectedDayOffset] = useState(0)
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>("ALL")
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null)

  const activeDate = addDays(new Date(), selectedDayOffset)

  // Seçili güne ait randevular
  const dayBookings = initialBookings.filter((b) => {
    const bookingDate = new Date(b.startAt)
    const matchesDay = isSameDay(bookingDate, activeDate)
    const matchesStaff = selectedStaffFilter === "ALL" || b.staffId === selectedStaffFilter
    return matchesDay && matchesStaff
  })

  // 7 günlük hızlı tarih butonları
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i))

  return (
    <div className="space-y-6">
      {/* Üst Tarih ve Filtre Barı */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/70">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedDayOffset((prev) => Math.max(0, prev - 1))}
            disabled={selectedDayOffset === 0}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>

          <span className="font-bold text-base text-foreground min-w-[200px] text-center">
            {format(activeDate, "d MMMM yyyy, EEEE", { locale: tr })}
          </span>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedDayOffset((prev) => prev + 1)}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Personel Filtresi */}
        <div className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          <Button
            variant={selectedStaffFilter === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStaffFilter("ALL")}
            className="rounded-full text-xs"
          >
            Tüm Ekip
          </Button>
          {staffList.map((st) => (
            <Button
              key={st.id}
              variant={selectedStaffFilter === st.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStaffFilter(st.id)}
              className="rounded-full text-xs"
            >
              {st.name} {st.surname?.[0]}.
            </Button>
          ))}
        </div>
      </div>

      {/* Haftalık Gün Çubuğu */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((d, index) => {
          const isSelected = selectedDayOffset === index
          const countForDay = initialBookings.filter((b) =>
            isSameDay(new Date(b.startAt), d)
          ).length

          return (
            <button
              key={d.toISOString()}
              onClick={() => setSelectedDayOffset(index)}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center ${
                isSelected
                  ? "border-primary bg-primary text-primary-foreground font-bold shadow-md"
                  : "border-border/60 hover:bg-muted/40 text-foreground"
              }`}
            >
              <span className="text-[10px] uppercase font-semibold">
                {format(d, "EEE", { locale: tr })}
              </span>
              <span className="text-xl font-black my-0.5">{format(d, "dd")}</span>
              <span className="text-[10px] opacity-80">
                {countForDay > 0 ? `${countForDay} randevu` : "Boş"}
              </span>
            </button>
          )
        })}
      </div>

      {/* Günlük Zaman Çizelgesi */}
      <div className="space-y-3">
        <h3 className="font-bold text-base text-foreground">
          {format(activeDate, "d MMMM", { locale: tr })} Randevuları ({dayBookings.length})
        </h3>

        {dayBookings.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground text-sm bg-muted/20 border-dashed rounded-3xl">
            Bu gün için planlanmış randevu bulunmuyor.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dayBookings.map((b) => (
              <Card
                key={b.id}
                onClick={() => setSelectedBooking(b)}
                className="p-4 rounded-2xl border-border/70 hover:border-primary/50 cursor-pointer transition-all hover:shadow-md space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-primary text-base flex items-center gap-1.5">
                    <ClockIcon className="h-4 w-4" />
                    {format(new Date(b.startAt), "HH:mm")} - {format(new Date(b.endAt), "HH:mm")}
                  </span>
                  <Badge
                    variant={
                      b.status === "CONFIRMED"
                        ? "default"
                        : b.status === "COMPLETED"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {b.status === "CONFIRMED"
                      ? "Onaylı"
                      : b.status === "COMPLETED"
                      ? "Tamamlandı"
                      : b.status}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-foreground">{b.customer.name || "Misafir"}</h4>
                  <p className="text-xs text-muted-foreground">{b.service.name}</p>
                </div>

                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Personel: {b.staff.name}</span>
                  <span className="font-bold text-foreground">₺{Number(b.priceSnapshot)}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Randevu Detay Modalı */}
      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        {selectedBooking && (
          <DialogContent className="w-[90%] max-w-[420px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Randevu Detayı</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-sm">
              <div className="p-3 rounded-xl bg-muted/40 border space-y-1">
                <p className="font-bold text-base text-foreground">{selectedBooking.customer.name || "Misafir"}</p>
                {selectedBooking.customer.phone && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <PhoneIcon className="h-3 w-3 text-primary" />
                    {selectedBooking.customer.phone}
                  </p>
                )}
                {selectedBooking.customer.email && (
                  <p className="text-xs text-muted-foreground">{selectedBooking.customer.email}</p>
                )}
              </div>

              <div className="space-y-2 border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-xs">Hizmet:</span>
                  <span className="font-semibold">{selectedBooking.service.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-xs">Personel:</span>
                  <span className="font-semibold">{selectedBooking.staff.name} {selectedBooking.staff.surname}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-xs">Saat:</span>
                  <span className="font-semibold">
                    {format(new Date(selectedBooking.startAt), "HH:mm")} ({selectedBooking.durationSnapshot} dk)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-xs">Tutar:</span>
                  <span className="font-black text-primary">₺{Number(selectedBooking.priceSnapshot)}</span>
                </div>
              </div>

              {selectedBooking.customerNote && (
                <div className="p-2.5 rounded-lg bg-muted/30 border text-xs text-muted-foreground">
                  <strong>Müşteri Notu:</strong> "{selectedBooking.customerNote}"
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
