"use client"

import { useState, useEffect } from "react"
import { format, addDays } from "date-fns"
import { tr } from "date-fns/locale"
import { Service, Staff, Business } from "@prisma/client"
import { useAuth } from "@/app/_providers/auth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CheckCircle2Icon,
  Loader2Icon,
  SparklesIcon,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog"
import { Button } from "@/app/_components/ui/button"
import { Label } from "@/app/_components/ui/label"
import { Textarea } from "@/app/_components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar"
import { SignInModal } from "@/app/_components/sign-in-modal"

interface BookingDialogProps {
  business: Business & { staff: Staff[] }
  service: Service
}

export function BookingDialog({ business, service }: BookingDialogProps) {
  const { user } = useAuth()
  const router = useRouter()

  const [isOpen, setIsOpen] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)

  // Form durumları
  const [selectedStaffId, setSelectedStaffId] = useState<string>("any")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [customerNote, setCustomerNote] = useState<string>("")

  // Slot yükleme
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const dateStr = format(selectedDate, "yyyy-MM-dd")

  // Tarih veya personel değiştiğinde müsait saatleri getir
  useEffect(() => {
    if (!isOpen) return

    async function fetchSlots() {
      setLoadingSlots(true)
      setSelectedTime("")
      try {
        const url = `/api/bookings/available-slots?businessId=${business.id}&serviceId=${service.id}&date=${dateStr}&staffId=${selectedStaffId}`
        const res = await fetch(url)
        const data = await res.json()
        if (res.ok && data.slots) {
          setSlots(data.slots)
        } else {
          setSlots([])
        }
      } catch (err) {
        console.error("Slot fetch error:", err)
        setSlots([])
      } finally {
        setLoadingSlots(false)
      }
    }

    fetchSlots()
  }, [isOpen, business.id, service.id, dateStr, selectedStaffId])

  const handleBookingSubmit = async () => {
    if (!user) {
      setShowSignIn(true)
      return
    }

    if (!selectedTime) {
      toast.error("Lütfen bir randevu saati seçiniz.")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business.id,
          serviceId: service.id,
          staffId: selectedStaffId === "any" ? undefined : selectedStaffId,
          date: dateStr,
          time: selectedTime,
          customerNote,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Randevu oluşturulamadı.")
      }

      toast.success("Randevunuz başarıyla onaylandı!")
      setIsOpen(false)
      router.push("/hesabim/randevularim")
    } catch (err: any) {
      toast.error(err.message || "Bir hata oluştu.")
    } finally {
      setSubmitting(false)
    }
  }

  // Gelecek 7 günü listele
  const availableDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i))

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="font-semibold">
            Randevu Al
          </Button>
        </DialogTrigger>

        <DialogContent className="w-[92%] max-w-[480px] max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Randevu Oluştur</DialogTitle>
          </DialogHeader>

          {/* Hizmet Özeti */}
          <div className="p-3 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-foreground">{service.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <ClockIcon className="h-3 w-3 text-primary" />
                {service.durationMinutes} dakika • {business.name}
              </p>
            </div>
            <span className="font-black text-primary text-base">₺{Number(service.price)}</span>
          </div>

          {/* 1. Personel Seçimi */}
          <div className="space-y-2 mt-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              Personel Seçimi
            </Label>
            <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => setSelectedStaffId("any")}
                className={`flex items-center gap-2 p-2 px-3 rounded-xl border text-xs font-semibold flex-shrink-0 transition-all ${
                  selectedStaffId === "any"
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border/60 hover:bg-muted/40 text-muted-foreground"
                }`}
              >
                <SparklesIcon className="h-4 w-4" />
                Fark Etmez
              </button>

              {business.staff.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStaffId(st.id)}
                  className={`flex items-center gap-2 p-1.5 px-3 rounded-xl border text-xs font-semibold flex-shrink-0 transition-all ${
                    selectedStaffId === st.id
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border/60 hover:bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={st.image || ""} />
                    <AvatarFallback className="text-[10px]">{st.name[0]}</AvatarFallback>
                  </Avatar>
                  <span>{st.name} {st.surname?.[0]}.</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Tarih Seçimi */}
          <div className="space-y-2 mt-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              Tarih Seçimi
            </Label>
            <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
              {availableDays.map((d) => {
                const isSelected = format(d, "yyyy-MM-dd") === dateStr
                return (
                  <button
                    key={d.toISOString()}
                    type="button"
                    onClick={() => setSelectedDate(d)}
                    className={`flex flex-col items-center justify-center p-2.5 min-w-[62px] rounded-xl border text-center transition-all ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground font-bold shadow-sm"
                        : "border-border/60 hover:bg-muted/40 text-foreground"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-medium">
                      {format(d, "EEE", { locale: tr })}
                    </span>
                    <span className="text-lg font-black leading-none my-0.5">
                      {format(d, "dd")}
                    </span>
                    <span className="text-[10px] opacity-80">
                      {format(d, "MMM", { locale: tr })}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3. Müsait Saat Seçimi */}
          <div className="space-y-2 mt-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center justify-between">
              <span>Müsait Saatler</span>
              {loadingSlots && <span className="text-[10px] lowercase text-primary">yükleniyor...</span>}
            </Label>

            {loadingSlots ? (
              <div className="flex items-center justify-center py-6 text-muted-foreground text-xs gap-2">
                <Loader2Icon className="h-4 w-4 animate-spin" />
                Uygun saatler kontrol ediliyor...
              </div>
            ) : slots.length === 0 ? (
              <div className="py-4 text-center rounded-xl bg-muted/20 border text-xs text-muted-foreground">
                Bu tarihte işletme kapalı veya randevu saati bulunmuyor.
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1">
                {slots.map((slot) => {
                  const isSelected = selectedTime === slot.time
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                        !slot.available
                          ? "opacity-30 cursor-not-allowed bg-muted/20 line-through border-transparent"
                          : isSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border/60 hover:border-primary/50 text-foreground"
                      }`}
                    >
                      {slot.time}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* 4. Not Ekleme */}
          <div className="space-y-1.5 mt-2">
            <Label htmlFor="note" className="text-xs text-muted-foreground">
              İşletmeye Notunuz (Opsiyonel)
            </Label>
            <Textarea
              id="note"
              placeholder="Örn: Saç yıkaması da istiyorum, sakal tıraşı için özel tercihim var..."
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              className="h-16 text-xs"
            />
          </div>

          {/* 5. Onay Butonu */}
          <div className="mt-4 pt-3 border-t border-border/60">
            <Button
              className="w-full font-bold gap-2"
              onClick={handleBookingSubmit}
              disabled={!selectedTime || submitting || loadingSlots}
            >
              {submitting && <Loader2Icon className="h-4 w-4 animate-spin" />}
              {selectedTime
                ? `${selectedTime} için Randevuyu Onayla (₺${Number(service.price)})`
                : "Lütfen Saat Seçiniz"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Oturum Açma Modalı */}
      <Dialog open={showSignIn} onOpenChange={setShowSignIn}>
        <SignInModal onSuccess={() => setShowSignIn(false)} />
      </Dialog>
    </>
  )
}
