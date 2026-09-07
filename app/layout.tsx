import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import NextTopLoader from "nextjs-toploader"

import { AuthProvider } from "./_providers/auth"
import { Footer } from "./_components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OxonomBerber | Kuaför & Berber Randevu Platformu",
  description: "Türkiye'nin en iyi berber, kuaför ve güzellik salonlarından saniyeler içinde 7/24 online randevu alın.",
  applicationName: "OxonomBerber",
  keywords: [
    "Berber Randevu",
    "Kuaför Randevu",
    "Erkek Kuaförü",
    "Güzellik Salonu",
    "İstanbul Berber",
    "Online Randevu",
    "OxonomBerber",
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" className="dark">
      <body className={inter.className}>
        <NextTopLoader color="#8161FF" showSpinner={false} />
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </AuthProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
