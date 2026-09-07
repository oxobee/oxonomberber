"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "../_providers/auth"
import { MenuIcon, LogInIcon, CalendarIcon, StoreIcon, UserIcon, LogOutIcon } from "lucide-react"

import { Sidebar } from "./sidebar"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Sheet, SheetTrigger } from "./ui/sheet"
import { Dialog } from "./ui/dialog"
import { SignInModal } from "./sign-in-modal"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

export const Header = () => {
  const { user, signOut } = useAuth()
  const [signInModalIsOpen, setSignInModalIsOpen] = useState(false)

  return (
    <>
      <Card className="rounded-none border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardContent className="flex flex-row items-center justify-between p-4 px-5 md:px-12 lg:px-24">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-lg shadow-sm">
              Ö
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight leading-none text-foreground">
                Oxonom<span className="text-primary">Berber</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
                Randevu Platformu
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" asChild className="gap-2">
              <Link href="/isletmeler">
                İşletmeleri Keşfet
              </Link>
            </Button>

            <Button variant="outline" asChild className="gap-2 border-primary/30 hover:border-primary">
              <Link href="/isletme-ekle">
                <StoreIcon className="h-4 w-4 text-primary" />
                İşletmeni Ekle
              </Link>
            </Button>

            {user ? (
              <div className="flex items-center gap-3">
                <Button variant="secondary" asChild className="gap-2">
                  <Link href="/hesabim/randevularim">
                    <CalendarIcon className="h-4 w-4" />
                    Randevularım
                  </Link>
                </Button>

                <Button variant="ghost" asChild className="gap-2">
                  <Link href="/isletme-paneli">
                    İşletme Paneli
                  </Link>
                </Button>

                {user.email === "admin@oxonomberber.com" && (
                  <Button variant="destructive" size="sm" asChild className="gap-1.5 text-xs font-bold">
                    <Link href="/admin">
                      Admin Paneli
                    </Link>
                  </Button>
                )}

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.user_metadata?.avatar_url || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {user.email?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </SheetTrigger>
                  <Sidebar />
                </Sheet>
              </div>
            ) : (
              <Button onClick={() => setSignInModalIsOpen(true)} className="gap-2 shadow-sm">
                <LogInIcon className="h-4 w-4" />
                Giriş Yap
              </Button>
            )}
          </div>

          {/* Mobile version menu trigger */}
          <div className="md:hidden flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="h-9 w-9">
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <Sidebar />
            </Sheet>
          </div>
        </CardContent>
      </Card>

      {/* Giriş Yap / Kayıt Ol Modal */}
      <Dialog
        open={signInModalIsOpen}
        onOpenChange={(open) => setSignInModalIsOpen(open)}
      >
        <SignInModal onSuccess={() => setSignInModalIsOpen(false)} />
      </Dialog>
    </>
  )
}
