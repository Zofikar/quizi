import { cookies } from "next/headers";
import { z } from "zod";
import { CreateJWT } from "~/jwt";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

export const authRouter = createTRPCRouter({

  login: publicProcedure
  .input(z.object({password: z.string().min(1)}))
  .output(z.boolean().default(false))
  .mutation(async ({input})=>{
    if(input.password.trim() === "Aqua12345".trim()){
        cookies().set("Authorization", await CreateJWT())
        return true;
    }
    return false
  }),
  logout: privateProcedure
  .mutation(()=>{
    cookies().delete("Authorization")
  })
});
