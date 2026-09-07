"use client"

import { useState } from "react"
import Image from "next/image"
import { useAuth } from "../_providers/auth"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { ClockIcon } from "lucide-react"
import { Dialog } from "./ui/dialog"
import { SignInModal } from "./sign-in-modal"

interface ServiceItemProps {
  service: any
  barbershop?: any
}

export const ServiceItem = ({ service, barbershop }: ServiceItemProps) => {
  const { user } = useAuth()
  const [signInModalIsOpen, setSignInModalIsOpen] = useState(false)

  return (
    <>
      <Card className="rounded-2xl border-border/70 overflow-hidden">
        <CardContent className="flex items-center gap-3 p-3">
          {service.imageUrl && (
            <div className="relative h-20 w-20 rounded-xl overflow-hidden flex-shrink-0">
              <Image
                className="object-cover"
                fill
                src={service.imageUrl}
                alt={service.name}
              />
            </div>
          )}

          <div className="w-full space-y-1">
            <h3 className="text-sm font-bold text-foreground">{service.name}</h3>
            {service.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {service.description}
              </p>
            )}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-primary">
                  ₺{Number(service.price)}
                </span>
                <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                  <ClockIcon className="h-3 w-3" />
                  {service.durationMinutes || 30} dk
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={signInModalIsOpen}
        onOpenChange={(open) => setSignInModalIsOpen(open)}
      >
        <SignInModal onSuccess={() => setSignInModalIsOpen(false)} />
      </Dialog>
    </>
  )
}
