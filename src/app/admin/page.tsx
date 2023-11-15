'use client'
import { setCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { toast } from "react-toastify";
import MyToastCotainer from "~/Components/MyToastCotainer";
import TextInput from "~/Components/TextInput";
import { api } from "~/trpc/server";

export default function AdminPage() {
  const router = useRouter()
  const [quizes, setQuizes] = useState<{id:string, name:string}[]>([])
  const [name, setName] = useState<string>('')
  const [refetch, setRefetch] = useState(0)
  useEffect(()=>{
    const f = async()=>{
      setQuizes(await api.quizes.getAll.query())
    }
    void f()
  },[refetch])
  async function CreateQuiz(e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>){
    e.preventDefault()
    await toast.promise(api.quizes.create.mutate({name}), {pending: "Tworzymy Quiz", success: "Quiz utworzony", error:"Coś poszło nie tak"})
    setName('')
    setRefetch((value)=>value+1)
  }

  function GoToQuiz(id:string){
    setCookie('quizID', id)
    router.push('/admin/quiz')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
    <button className="fixed top-1 left-1 bg-black bg-opacity-30 p-3 rounded-md" onClick={async()=>{
      await api.auth.logout.mutate()
      router.push('/')
    }}>Wyloguj</button>
      <div className="flex justify-around min-w-full">
        <div className="border border-black border-solid grid grid-cols-1 gap-4 p-2 rounded-md">
          <TextInput visibleName="Nazwa Quizu" onChange={(e)=>setName(e.target.value)} value={name}/>
          <button className="border border-black border-solid p-2 rounded-md bg-opacity-70 bg-black" onClick={CreateQuiz}>Stwórz</button>
        </div>
        <div className="border border-black border-solid grid gap-4 p-2 rounded-md grid-flow-row max-w-[50%] grid-cols-7">
          {quizes.length > 0 ?
          <>
          <div className="grid col-span-7 grid-cols-[subgrid] p-1 px-2">
              <div className="col-span-4">ID</div>
              <div className="col-span-2">Nazwa</div>
          </div>
          {quizes.map((value, index)=>{
            return (
            <div key={index} className="grid rounded-md bg-opacity-20 bg-black col-span-7 grid-cols-[subgrid] overflow-hidden">
              <button className="col-span-6 grid grid-cols-[subgrid] bg-opacity-10 bg-black rounded-lg items-center px-2 border border-solid border-black" onClick={()=>GoToQuiz(value.id)}>
                <div className="col-span-4">
                  {value.id}
                </div>
                <div className="col-span-2">
                  {value.name}
                </div>
              </button>
              <div className="flex justify-center">
                <button className="bg-red-600 aspect-square px-2 rounded-full m-2 mr-4" onClick={async()=>{
                  const t = async()=>{
                      if(await api.quizes.remove.mutate({id:value.id}))
                          return;
                      throw Error()
                  }
                  const f = t()
                  void toast.promise(f,{pending:"Usuwamy pytanie", error:"Coś poszło nie tak", success:"Usunięto poprawnie"})
                  await f
                  setRefetch(structuredClone(refetch+1))
                }}>x</button>
              </div>
            </div>
            )
          })}
          </> :
          <div>Brak quizów</div>}
        </div>
      </div>
      <MyToastCotainer/>
    </main>
  );
}