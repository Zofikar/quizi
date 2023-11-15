'use client'
const resoultCheme = z.object({quizname:z.string().min(1), score: z.number(), name:z.string().min(1), lastName:z.string().min(1), class:z.string().min(1)})
type resoultType = z.infer<typeof resoultCheme>
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { z } from "zod"
import MyToastCotainer from "~/Components/MyToastCotainer"
import { api } from "~/trpc/server"

export default function ThankYouPage() {
  const [result, setResoult] = useState<resoultType>()
  useEffect(()=>{
    const t = async()=>{
        const rs = await api.quizes.getFromCookie.query()
        if(rs) setResoult(rs)
        else toast.error("Nie powinno cię tu być")
    }
    void t()
  },
  [])
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        {result ? <div>
            <div>{result.name} {result.lastName} twój wynik w {result.quizname} to {result.score}</div>
        </div> : <div>Nie powinno cię tu być</div>}
        <MyToastCotainer/>
    </main>
  )
}
