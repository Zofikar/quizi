'use client'
import { getCookie } from "cookies-next"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import MyToastCotainer from "~/Components/MyToastCotainer"
import { api } from "~/trpc/server"
export default function AdminQuizPage() {
    const router = useRouter()
  const [rerender, forcererender] = useState(0)
  const [quizID] = useState(getCookie("quizID"))
  const [questions, setQuestions] = useState<{
    id: string;
    question: string;
    quizID: string;
    MaxTimeMs: number;
    MaxPoints: number;
    Answers: {
        id: string;
        value: string;
        correct: boolean;
    }[];
  }[]>()
  const [entries, setEntries] = useState<{
    id: string;
    name: string;
    quizID: string;
    lastname: string;
    class: string;
    score: number;
  }[]>()
  const [name, setName] = useState("")
  useEffect(()=>{
    const f = async()=>{
        if(!quizID) return
        const rs = await api.quizes.get.query({id:quizID})
        if(!rs){
            toast.error("Nie znaleziono quizu")
            return
        }
        setEntries(rs.Entries)
        setQuestions(rs.Questions)
        setName(rs.name)
    }
    void f()
  },[quizID, rerender])

  if(!quizID) return (<main>Something went wrong</main>)
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white p-2 relative">
        <button className="fixed top-1 left-1 bg-black bg-opacity-30 p-3 rounded-md" onClick={()=>router.push('/admin')}>Powrót</button>
        <div className="flex justify-evenly gap-4 text-center pb-4">
            <div>{'ID: '+quizID }</div>
            <div>{'Nazwa: '+name }</div>
        </div>
        <div className="flex-grow flex justify-evenly min-w-full">
            <div className=" border border-black border-solid p-5 gap-4 flex flex-col rounded-md max-h-full">
                <div>Wyniki</div>
                <div className="flex flex-col gap-4 rounded-md flex-grow overflow-auto">
                    <div className="grid-cols-4 grid bg-black bg-opacity-50 max-h-10 rounded-md p-2 gap-4 text-center">
                        <div>Imie</div>
                        <div>Nazwisko</div>
                        <div>Klasa</div>
                        <div>Wynik</div>
                    </div>
                    {entries?.sort((a,b)=>b.score-a.score).map((value, index)=>{
                    return (
                    <div key={index} className="grid-cols-4 grid bg-black bg-opacity-20 max-h-10 rounded-md p-2 gap-4 text-center">
                        <div>{value.name}</div>
                        <div>{value.lastname}</div>
                        <div>{value.class}</div>
                        <div>{value.score}</div>
                    </div>
                    )
                })}
                </div>
            </div>
            <div className=" border border-black border-solid p-5 gap-4 flex flex-col rounded-md max-h-full">
                <div>Pytania</div>
                <div className="overflow-auto p-4 gap-4 flex flex-col">
                    {questions?.map((value, index)=>{
                        return (
                        <div key={index}>
                            <div className="grid grid-cols-3 gap-4 bg-black bg-opacity-20 rounded-md p-2 pb-5 relative">
                                <div>ID:</div>
                                <div className="col-span-2 flex">
                                    <div className="flex-grow">
                                        {value.id}
                                    </div>
                                    <button className="bg-red-600 aspect-square px-2 rounded-full" onClick={async()=>{
                                        const t = async()=>{
                                            if(await api.questions.remove.mutate({id: value.id}))
                                                return;
                                            throw Error()
                                        }
                                        const f = t()
                                        void toast.promise(f,{pending:"Usuwamy pytanie", error:"Coś poszło nie tak", success:"Usunięto poprawnie"})
                                        await f
                                        forcererender(rerender+1)
                                    }}>x</button>
                                </div>
                                <div>Pytanie:</div>
                                <input value={value.question} className="text-black px-1 py-0.5 rounded-md col-span-2" onChange={(e)=>{
                                    setQuestions((old)=>{
                                        if(old![index])
                                            old![index]!.question = e.target.value
                                        return structuredClone(old)
                                    })
                                }}></input>
                                <div>Punkty:</div>
                                <input type="number" value={value.MaxPoints} className="text-black px-1 py-0.5 rounded-md col-span-2" onChange={(e)=>{
                                    setQuestions((old)=>{
                                        if(old![index])
                                            old![index]!.MaxPoints = parseInt(e.target.value)
                                        return structuredClone(old)
                                    })
                                }}></input>
                                <div>Czas[s]:</div>
                                <input type="number" value={Math.round(value.MaxTimeMs/1000)} className="text-black px-1 py-0.5 rounded-md col-span-2" onChange={(e)=>{
                                    setQuestions((old)=>{
                                        if(old![index])
                                            old![index]!.MaxTimeMs = parseInt(e.target.value)*1000
                                        return structuredClone(old)
                                    })
                                }}></input>
                                <div className="pl-5">Odpowiedzi:</div>
                                <div className="flex flex-col gap-4 col-span-2 pl-5">
                                    {value.Answers.map((val, ind)=>{
                                        return (<div className="flex justify-evenly gap-4" key={ind}>
                                            <input className="text-black px-1 py-0.5 rounded-md" value={val.value} onChange={(e)=>{
                                                setQuestions((old)=>{
                                                    if(old![index]?.Answers[ind])
                                                        old![index]!.Answers[ind]!.value = e.target.value
                                                    return structuredClone(old)
                                                })
                                            }}></input>
                                            <input type="checkbox" checked={val.correct} className="text-black px-1 py-0.5 rounded-md" onChange={(e)=>{
                                                setQuestions((old)=>{
                                                    if(old![index]?.Answers[ind])
                                                        old![index]!.Answers[ind]!.correct = e.target.checked
                                                    return structuredClone(old)
                                                })
                                            }}></input>
                                            <button className="bg-red-600 aspect-square px-2 rounded-full" onClick={async()=>{
                                        const t = async()=>{
                                            if(await api.answers.remove.mutate({id: val.id}))
                                                return;
                                            throw Error()
                                        }
                                        const f = t()
                                        void toast.promise(f,{pending:"Usuwamy pytanie", error:"Coś poszło nie tak", success:"Usunięto poprawnie"})
                                        await f
                                        forcererender(rerender+1)
                                    }}>x</button>
                                        </div>)
                                    })}
                                    <div className='col-span-3 flex justify-center'><button className="bg-black bg-opacity-70 rounded-md p-2" onClick={async()=>{
                                        const t = async()=>{
                                            if(await api.answers.create.mutate({questionID: value.id, value:"Answer", correct: false})){
                                                return;
                                            }
                                            throw Error()
                                        }
                                        const f = t()
                                        void toast.promise(f, {pending: "Tworzymy pytanie", error:"Coś poszło nie tak", success:"Utworzono pytanie"})
                                        await f
                                        forcererender(rerender+1)
                                    }}>Dodaj odpowiedź</button></div>
                                </div>
                                <div className="col-span-3 flex justify-center ">
                                    <button className="bg-green-600 bg-opacity-70 rounded-md p-2 min-w-[50%] max-w-full" onClick={async()=>{
                                        const t = async()=>{
                                            let rs = await api.questions.update.mutate({question: value.question, MaxPoints:value.MaxPoints, questionID:value.id})
                                            await Promise.all(value.Answers.map(async(val)=>{
                                                if(!await api.answers.update.mutate({answerID:val.id, update:{correct:val.correct, value:val.value}}))
                                                    rs = false
                                            }))
                                            if(rs)
                                                return
                                            throw Error()
                                        }
                                        const f = t()
                                        void toast.promise(f, {pending: "Zapisujemy pytanie", error:"Coś poszło nie tak", success:"Zapisano pytanie"})
                                        await f
                                    }}>Zapisz</button>
                                </div>
                            </div>
                        </div>
                    )})}
                    <div className='col-span-3 flex justify-center'><button className="bg-black bg-opacity-70 rounded-md p-2" onClick={async()=>{
                        const t = async()=>{
                            if(await api.questions.create.mutate({question:"Example Question", MaxTimeMs:10000, MaxPoints:1000})){
                                return;
                            }
                            throw Error()
                        }
                        const f = t()
                        await toast.promise(f, {pending: "Tworzymy pytanie", error:"Coś poszło nie tak", success:"Utworzono pytanie"})
                        await f
                        forcererender(rerender+1)
                    }}>Dodaj pytanie</button></div>
                </div>
            </div>
        </div>
        <MyToastCotainer/>
    </main>
  )
}
