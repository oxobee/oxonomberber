import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Card, CardContent } from "./ui/card"

interface BookingSummaryProps {
  service: { name: string; price: number | any }
  barbershop: { name: string }
  selectedDate: Date
}

export const BookingSummary = ({
  service,
  barbershop,
  selectedDate,
}: BookingSummaryProps) => {
  return (
    <Card className="rounded-2xl border-border/70">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-foreground">{service.name}</h2>
          <p className="text-base font-black text-primary">
            ₺{Number(service.price)}
          </p>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Tarih</span>
          <span className="font-medium text-foreground">
            {format(selectedDate, "d MMMM yyyy, EEEE", { locale: tr })}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Saat</span>
          <span className="font-bold text-foreground">
            {format(selectedDate, "HH:mm")}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">İşletme</span>
          <span className="font-medium text-foreground">{barbershop.name}</span>
        </div>
      </CardContent>
    </Card>
  )
}
