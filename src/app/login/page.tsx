'use client'

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import MyToastCotainer from "~/Components/MyToastCotainer";
import { api } from "~/trpc/server";

export default function LoginPage() {
const [pass, setPass] = useState<string>("")
  const router = useRouter();
  async function Login(){
    console.log(pass)
    const rs = await api.auth.login.mutate({password: pass})
    console.log(rs)
    if(rs)
        router.push("../admin")
    else
        toast.error("Failed to log in")
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container grid grid-rows-1 items-center justify-center gap-12 px-4 py-16 ">
          <input value={pass} type="password" onChange={(e)=>{
            setPass(e.target.value)
          }} className="rounded-md px-1 py-0.5 text-black"/>
          <button type="submit" className="bg-black rounded-md" onClick={Login}>Zaloguj</button>
      </div>
      <MyToastCotainer/>
    </main>
  );
}
