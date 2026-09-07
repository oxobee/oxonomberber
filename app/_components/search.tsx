"use client"

import { useRouter } from "next/navigation"
import { SearchIcon, MapPinIcon } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Form, FormControl, FormField, FormItem } from "./ui/form"

const formSchema = z.object({
  query: z.string().optional(),
})

export const Search = () => {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  })

  const onSubmitHandler = (formData: z.infer<typeof formSchema>) => {
    if (formData.query && formData.query.trim().length > 0) {
      router.push(`/isletmeler?q=${encodeURIComponent(formData.query.trim())}`)
    } else {
      router.push("/isletmeler")
    }
  }

  return (
    <Form {...form}>
      <form
        className="flex gap-2 w-full"
        onSubmit={form.handleSubmit(onSubmitHandler)}
      >
        <FormField
          name="query"
          control={form.control}
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <div className="relative w-full">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="w-full pl-9 bg-background/80 backdrop-blur"
                    placeholder="Hizmet, berber veya kuaför ara..."
                    {...field}
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" className="px-5 font-semibold">
          Ara
        </Button>
      </form>
    </Form>
  )
}
