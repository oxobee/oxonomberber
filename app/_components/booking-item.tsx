"use client"

import { useState } from "react"
import Image from "next/image"
import { BookingStatus } from "@prisma/client"
import { format, isFuture } from "date-fns"
import { tr } from "date-fns/locale"
import { toast } from "sonner"
import { CalendarIcon, ClockIcon, UserIcon, MapPinIcon, PhoneIcon } from "lucide-react"

import { Card, CardContent } from "./ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog"

interface BookingItemProps {
  booking: any
  onCancelled?: () => void
}

export const BookingItem = ({ booking, onCancelled }: BookingItemProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const startDate = new Date(booking.startAt)
  const isUpcoming = isFuture(startDate) && booking.status !== BookingStatus.CANCELLED

  const getStatusBadge = () => {
    switch (booking.status) {
      case BookingStatus.CONFIRMED:
        return <Badge className="bg-emerald-600 hover:bg-emerald-600">Onaylandı</Badge>
      case BookingStatus.COMPLETED:
        return <Badge variant="secondary">Tamamlandı</Badge>
      case BookingStatus.CANCELLED:
        return <Badge variant="destructive">İptal Edildi</Badge>
      case BookingStatus.NO_SHOW:
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Gelmedi</Badge>
      default:
        return <Badge variant="secondary">Beklemede</Badge>
    }
  }

  const cancelBookingHandler = async () => {
    setIsCancelling(true)
    try {
      const res = await fetch(`/api/bookings/${booking.id}/cancel`, {
        method: "POST",
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "İptal işlemi başarısız oldu.")
      }

      toast.success("Randevunuz başarıyla iptal edildi.")
      setIsSheetOpen(false)
      if (onCancelled) {
        onCancelled()
      } else {
        window.location.reload()
      }
    } catch (error: any) {
      toast.error(error.message || "Randevu iptal edilirken bir hata oluştu.")
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Card className="min-w-[280px] max-w-[340px] cursor-pointer hover:border-primary/50 transition-colors flex-shrink-0">
          <CardContent className="flex justify-between p-0">
            <div className="flex flex-col gap-2 p-4">
              {getStatusBadge()}
              <h3 className="text-left font-bold text-sm line-clamp-1">
                {booking.service?.name}
              </h3>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={booking.business?.logo || booking.business?.coverImage} />
                  <AvatarFallback className="text-[10px]">
                    {booking.business?.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {booking.business?.name}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center border-l border-border/60 px-4 bg-muted/20">
              <p className="text-xs capitalize text-muted-foreground">
                {format(startDate, "MMMM", { locale: tr })}
              </p>
              <p className="text-xl font-black text-foreground">
                {format(startDate, "dd", { locale: tr })}
              </p>
              <p className="text-xs font-semibold text-primary">
                {format(startDate, "HH:mm")}
              </p>
            </div>
          </CardContent>
        </Card>
      </SheetTrigger>

      <SheetContent className="w-[90%] max-w-[420px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left font-bold">Randevu Detayı</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
            <Avatar className="h-12 w-12 rounded-xl">
              <AvatarImage src={booking.business?.logo || booking.business?.coverImage} />
              <AvatarFallback>{booking.business?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-bold text-sm">{booking.business?.name}</h4>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPinIcon className="h-3 w-3 text-primary" />
                {booking.business?.address}, {booking.business?.district}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border/60 space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-xs">Durum</span>
              {getStatusBadge()}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-xs">Hizmet</span>
              <span className="font-semibold">{booking.service?.name}</span>
            </div>

            {booking.staff && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs">Personel</span>
                <span className="font-medium flex items-center gap-1">
                  <UserIcon className="h-3.5 w-3.5 text-primary" />
                  {booking.staff.name} {booking.staff.surname}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-xs">Tarih</span>
              <span className="font-medium flex items-center gap-1">
                <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                {format(startDate, "d MMMM yyyy EEEE", { locale: tr })}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-xs">Saat & Süre</span>
              <span className="font-medium flex items-center gap-1">
                <ClockIcon className="h-3.5 w-3.5 text-primary" />
                {format(startDate, "HH:mm")} ({booking.durationSnapshot || 30} dk)
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-border/40 font-bold">
              <span>Toplam Tutar</span>
              <span className="text-primary text-base">₺{Number(booking.priceSnapshot)}</span>
            </div>
          </div>

          {booking.business?.phone && (
            <div className="flex items-center gap-2 p-3 rounded-lg border border-border/60 text-xs">
              <PhoneIcon className="h-4 w-4 text-primary" />
              <span>İşletme İletişim: <strong>{booking.business.phone}</strong></span>
            </div>
          )}
        </div>

        <SheetFooter className="mt-6 flex flex-col gap-2">
          {isUpcoming && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full" disabled={isCancelling}>
                  Randevuyu İptal Et
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="w-[90%] max-w-[400px]">
                <AlertDialogHeader>
                  <AlertDialogTitle>Randevuyu iptal etmek istiyor musunuz?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bu işlem geri alınamaz. İptal ettikten sonra tekrar uygun saat dilimi seçmeniz gerekebilir.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={cancelBookingHandler}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Evet, İptal Et
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              Kapat
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
