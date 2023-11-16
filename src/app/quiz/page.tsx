'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import MyToastCotainer from "~/Components/MyToastCotainer"
import { api } from "~/trpc/server"

export default function QuizPage() {
  const router = useRouter()
  let lock = false
  const [time, setTime] = useState(Date.now())
  const [timeReaminin, setTimeRemaining] = useState(10000)
  const [question, setQuestion] = useState<{
    question: string;
    id: string;
    MaxTimeMs: number;
    MaxPoints: number;
    answers: {
        id: string;
        value: string;
        }[];
    }>()
  async function getQuestion(){
    const rs = await api.enties.question.query()
    if(typeof rs === 'boolean'){
        if(!rs) toast.error("Coś jest nie tak z twoim quizem")
        if(rs) router.push('/end')
    }else{
        setQuestion(rs)
        setTime(Date.now())
    }
  }
  useEffect(()=>{
    void getQuestion()
  }, [])
  useEffect(()=>{
    if(!question) return
    setTimeRemaining(question.MaxTimeMs)
    console.log("🚀 ~ file: page.tsx:39 ~ useEffect ~ MaxTimeMs:", question.MaxTimeMs)
    const interval = setInterval(()=>{
        setTimeRemaining((old)=>{
            const newTimeRemaining = old-1000
            if(newTimeRemaining <= 0){
                clearInterval(interval)
                void api.enties.outOfTime.mutate({questionID:question.id})
                void getQuestion()
            }
            return structuredClone(newTimeRemaining)
        })
    }, 1000)
    return ()=>clearInterval(interval)
  }, [question])
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
    {question ? 
    <div className="gap-4 flex flex-col min-w-full min-h-full sm:grid sm:grid-rows-1 sm:grid-cols-5">
        <div/>
        <div className="flex w-full justify-center p-2 rows-span-3 sm:col-span-3 sm:row-span-1">
            <div>
                <div className="text-center text-3xl">
                    {question.question}
                </div>
                <div className="grid grid-rows-4 grid-flow-col gap-6 p-4 md:grid-rows-2">
                    {question.answers.map((value, index)=>{
                        return <button key={index} className="aspect-video bg-black bg-opacity-40 p-4 rounded-md sm:p-8" onClick={async()=>{
                            if(lock) return
                            lock=true
                            await api.enties.answer.mutate({answerID: value.id, questionID:question.id, timeMs:Date.now()-time})
                            await getQuestion()
                            lock=false
                        }}>{value.value}</button>
                    })}
                </div>
            </div>
        </div>
        <div className="flex justify-center items-center">
            <div className="bg-red-500 flex items-center justify-center aspect-square rounded-full px-10">{Math.round(timeReaminin/1000)}</div>
        </div>
    </div> : 
    <div>Brak pytań, coś poszło nie tak</div>
    }
    <MyToastCotainer/>
  </main>
  )
}
