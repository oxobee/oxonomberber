"use client"

import { useState } from "react"
import { Service } from "@prisma/client"
import { toast } from "sonner"
import {
  ScissorsIcon,
  PlusIcon,
  Trash2Icon,
  ClockIcon,
  Loader2Icon,
} from "lucide-react"
import { Card } from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import { Textarea } from "@/app/_components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog"

export function ServicesManager({ initialServices }: { initialServices: Service[] }) {
  const [services, setServices] = useState<Service[]>(initialServices)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    durationMinutes: "30",
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/business/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          durationMinutes: Number(formData.durationMinutes),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Hizmet eklenemedi.")

      setServices((prev) => [...prev, data.service])
      toast.success("Yeni hizmet eklendi.")
      setIsDialogOpen(false)
      setFormData({ name: "", description: "", price: "", durationMinutes: "30" })
    } catch (err: any) {
      toast.error(err.message || "Bir hata oluştu.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu hizmeti silmek istediğinizden emin misiniz?")) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/business/services/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Silme işlemi başarısız.")

      setServices((prev) => prev.filter((s) => s.id !== id))
      toast.success("Hizmet silindi.")
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
          Toplam {services.length} Hizmet
        </span>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 font-bold">
              <PlusIcon className="h-4 w-4" />
              Yeni Hizmet Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90%] max-w-[420px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Yeni Hizmet Tanımla</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="sName">Hizmet Adı *</Label>
                <Input
                  id="sName"
                  placeholder="Örn: Cilt Bakımı & Buhar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="sPrice">Fiyat (₺) *</Label>
                  <Input
                    id="sPrice"
                    type="number"
                    placeholder="400"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sDuration">Süre (Dk) *</Label>
                  <Input
                    id="sDuration"
                    type="number"
                    placeholder="30"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sDesc">Açıklama (Opsiyonel)</Label>
                <Textarea
                  id="sDesc"
                  placeholder="Hizmet detayları ve kapsamı..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="h-20 text-xs"
                />
              </div>

              <Button type="submit" className="w-full font-bold mt-2" disabled={submitting}>
                {submitting && <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />}
                Hizmeti Kaydet
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <Card key={service.id} className="p-4 rounded-2xl border-border/70 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-base text-foreground">{service.name}</h3>
              {service.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{service.description}</p>
              )}
              <div className="flex items-center gap-3 pt-1 text-xs">
                <span className="font-black text-primary text-sm">₺{Number(service.price)}</span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <ClockIcon className="h-3 w-3" />
                  {service.durationMinutes} dakika
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 flex-shrink-0"
              disabled={deletingId === service.id}
              onClick={() => handleDelete(service.id)}
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
