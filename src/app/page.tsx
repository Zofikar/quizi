'use client'
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import MyToastCotainer from "~/Components/MyToastCotainer";
import TextInput from "~/Components/TextInput";
import { api } from "~/trpc/server";

export default function MainPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [lastname, setLastName] = useState('')
  const [clas, setClas] = useState('')
  const [Quiz, setQuiz] = useState('')
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="flex w-full justify-end p-2">
        <a href="/login">
          <div>
            Admin
          </div>
        </a>
      </div>
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 w-full flex-grow">
        <div className="grid relative grid-flow-row gap-4">
          <TextInput name='Imie' value={name} onChange={(e)=>setName(e.target.value)}/>
          <TextInput name='Nazwisko' value={lastname} onChange={(e)=>setLastName(e.target.value)}/>
          <TextInput name='Klasa' value={clas} onChange={(e)=>setClas(e.target.value)}/>
          <TextInput name='Quiz' value={Quiz} onChange={(e)=>setQuiz(e.target.value)}/>
          <button className="bg-black rounded-md" onClick={async()=>{
            if(await api.quizes.checkIfExists.query({name: Quiz})){
              const rs = await api.enties.start.mutate({name: name, lastname, class:clas})
              if(rs) router.push("/quiz")
              else toast.error("Chyba brałeś już udział w tym quizie")
            }else toast.error("Taki quiz nie istnieje")
          }}>Rozpocznij</button>
        </div>
      </div>
      <MyToastCotainer/>
    </main>
  );
}
