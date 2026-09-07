"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "../_providers/auth"
import {
  CalendarIcon,
  HomeIcon,
  LogInIcon,
  LogOutIcon,
  StoreIcon,
  UserIcon,
  CompassIcon,
  ScissorsIcon,
  SparklesIcon,
} from "lucide-react"

import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { SheetClose, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet"
import { Dialog } from "./ui/dialog"
import { SignInModal } from "./sign-in-modal"

const trCategories = [
  { title: "Berber", slug: "barber", icon: ScissorsIcon },
  { title: "Kuaför", slug: "hairdresser", icon: SparklesIcon },
  { title: "Güzellik Salonu", slug: "beauty", icon: SparklesIcon },
]

export const Sidebar = () => {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [signInModalIsOpen, setSignInModalIsOpen] = useState(false)

  const goToBookings = () => {
    if (user) {
      router.push("/hesabim/randevularim")
    } else {
      setSignInModalIsOpen(true)
    }
  }

  return (
    <>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left font-bold text-lg">Menü</SheetTitle>
        </SheetHeader>

        <div className="flex items-center justify-between gap-3 border-b border-border/60 py-5">
          {user ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.user_metadata?.avatar_url ?? ""} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {user.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col truncate">
                <p className="font-bold text-sm truncate">
                  {user.user_metadata?.name || user.email?.split("@")[0]}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="font-bold text-sm">Hoş geldiniz!</p>
                <p className="text-xs text-muted-foreground">
                  Giriş yaparak randevularınızı yönetin.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setSignInModalIsOpen(true)}
                className="gap-1.5"
              >
                <LogInIcon className="h-4 w-4" />
                Giriş
              </Button>
            </div>
          )}
        </div>

        {/* Ana Navigasyon */}
        <div className="flex flex-col gap-1 border-b border-border/60 py-4">
          <SheetClose asChild>
            <Button className="justify-start gap-2.5" variant="ghost" asChild>
              <Link href="/">
                <HomeIcon className="h-4 w-4 text-primary" />
                Ana Sayfa
              </Link>
            </Button>
          </SheetClose>

          <SheetClose asChild>
            <Button className="justify-start gap-2.5" variant="ghost" asChild>
              <Link href="/isletmeler">
                <CompassIcon className="h-4 w-4 text-primary" />
                Tüm İşletmeler
              </Link>
            </Button>
          </SheetClose>

          <SheetClose asChild>
            <Button
              className="justify-start gap-2.5"
              variant="ghost"
              onClick={goToBookings}
            >
              <CalendarIcon className="h-4 w-4 text-primary" />
              Randevularım
            </Button>
          </SheetClose>

          <SheetClose asChild>
            <Button className="justify-start gap-2.5" variant="ghost" asChild>
              <Link href="/isletme-ekle">
                <StoreIcon className="h-4 w-4 text-primary" />
                İşletmeni Ekle (Ortak Ol)
              </Link>
            </Button>
          </SheetClose>

          {user && (
            <SheetClose asChild>
              <Button className="justify-start gap-2.5" variant="ghost" asChild>
                <Link href="/isletme-paneli">
                  <StoreIcon className="h-4 w-4 text-primary" />
                  İşletme Yönetim Paneli
                </Link>
              </Button>
            </SheetClose>
          )}
        </div>

        {/* Kategoriler */}
        <div className="flex flex-col gap-1 border-b border-border/60 py-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-1">
            Kategoriler
          </span>
          {trCategories.map((category) => (
            <SheetClose key={category.slug} asChild>
              <Button className="justify-start gap-2.5" variant="ghost" asChild>
                <Link href={`/isletmeler?kategori=${category.slug}`}>
                  <category.icon className="h-4 w-4 text-muted-foreground" />
                  {category.title}
                </Link>
              </Button>
            </SheetClose>
          ))}
        </div>

        {user && (
          <div className="flex flex-col gap-1 py-4">
            <Button
              className="justify-start gap-2.5 text-destructive hover:text-destructive hover:bg-destructive/10"
              variant="ghost"
              onClick={signOut}
            >
              <LogOutIcon className="h-4 w-4" />
              Çıkış Yap
            </Button>
          </div>
        )}
      </SheetContent>

      {/* Sign In Modal */}
      <Dialog
        open={signInModalIsOpen}
        onOpenChange={(open) => setSignInModalIsOpen(open)}
      >
        <SignInModal onSuccess={() => setSignInModalIsOpen(false)} />
      </Dialog>
    </>
  )
}
