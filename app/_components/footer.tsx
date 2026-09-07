import Link from "next/link"

export const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-card/50 py-10 px-5 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="text-base font-black text-foreground">
            Oxonom<span className="text-primary">Berber</span>
          </span>
          <p className="text-xs text-muted-foreground">
            Türkiye'nin Yeni Nesil Berber ve Kuaför Randevu Pazaryeri
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <Link href="/isletmeler" className="hover:text-foreground transition-colors">
            İşletmeler
          </Link>
          <Link href="/isletme-ekle" className="hover:text-foreground transition-colors">
            İşletmeni Ekle
          </Link>
          <Link href="/hesabim/randevularim" className="hover:text-foreground transition-colors">
            Randevularım
          </Link>
        </div>

        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} OxonomBerber. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  )
}
