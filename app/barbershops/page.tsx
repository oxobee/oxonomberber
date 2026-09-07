import { redirect } from "next/navigation"

interface BarbershopsPageProps {
  searchParams: {
    title?: string
    service?: string
    q?: string
  }
}

export default function BarbershopsLegacyRedirect({ searchParams }: BarbershopsPageProps) {
  const q = searchParams.title || searchParams.service || searchParams.q || ""
  if (q) {
    redirect(`/isletmeler?q=${encodeURIComponent(q)}`)
  }
  redirect("/isletmeler")
}
