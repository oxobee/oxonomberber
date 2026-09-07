"use client"

import { useState } from "react"
import { Staff } from "@prisma/client"
import { toast } from "sonner"
import {
  UserIcon,
  PlusIcon,
  Trash2Icon,
  PhoneIcon,
  Loader2Icon,
} from "lucide-react"
import { Card } from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import { Textarea } from "@/app/_components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog"

export function StaffManager({ initialStaff }: { initialStaff: any[] }) {
  const [staffList, setStaffList] = useState<any[]>(initialStaff)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    phone: "",
    bio: "",
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/business/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Personel eklenemedi.")

      setStaffList((prev) => [...prev, data.staff])
      toast.success("Yeni personel eklendi.")
      setIsDialogOpen(false)
      setFormData({ name: "", surname: "", phone: "", bio: "" })
    } catch (err: any) {
      toast.error(err.message || "Bir hata oluştu.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu personeli silmek istediğinizden emin misiniz?")) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/business/staff/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Silme işlemi başarısız.")

      setStaffList((prev) => prev.filter((s) => s.id !== id))
      toast.success("Personel silindi.")
    } catch (err: any) {
      toast.error(err.message || "Bir hata oluştu.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-muted-foreground">
          Toplam {staffList.length} Çalışan
        </span>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 font-bold">
              <PlusIcon className="h-4 w-4" />
              Yeni Personel Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90%] max-w-[420px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Yeni Personel Tanımla</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="stName">Adı *</Label>
                  <Input
                    id="stName"
                    placeholder="Örn: Burak"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="stSurname">Soyadı</Label>
                  <Input
                    id="stSurname"
                    placeholder="Örn: Kaya"
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="stPhone">Telefon Numarası</Label>
                <Input
                  id="stPhone"
                  placeholder="+90 530 000 0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="stBio">Uzmanlık & Biyografi</Label>
                <Textarea
                  id="stBio"
                  placeholder="Fade kesim uzmanı, saç renklendirme ustası..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="h-20 text-xs"
                />
              </div>

              <Button type="submit" className="w-full font-bold mt-2" disabled={submitting}>
                {submitting && <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />}
                Personeli Kaydet
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {staffList.map((st) => (
          <Card key={st.id} className="p-4 rounded-2xl border-border/70 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 rounded-xl">
                <AvatarImage src={st.image || ""} />
                <AvatarFallback className="font-bold bg-primary/10 text-primary">
                  {st.name[0]}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-0.5">
                <h3 className="font-bold text-sm text-foreground">{st.name} {st.surname}</h3>
                <p className="text-xs text-muted-foreground">{st.bio || "Saç & Sakal Uzmanı"}</p>
                {st.phone && (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-0.5">
                    <PhoneIcon className="h-3 w-3 text-primary" /> {st.phone}
                  </p>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 flex-shrink-0"
              disabled={deletingId === st.id}
              onClick={() => handleDelete(st.id)}
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
