import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { Answers } from '../../db/schema';

export const answersRouter = createTRPCRouter({
  create: privateProcedure
    .input(z.object({questionID:z.string().min(1), value: z.string().min(1), correct: z.boolean().default(false)}))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.insert(Answers).values(input).returning({id:Answers.id})
    }),
  
  update: privateProcedure
    .output(z.boolean())
    .input(z.object({
        answerID: z.string().min(1),
        update: z.object({value: z.string().min(1).optional(), correct: z.boolean().optional()})
    }))
    .mutation(async ({ ctx, input }) => {
        const val = await ctx.db.update(Answers).set(input.update).where(eq(Answers.id, input.answerID))
        if(val.changes > 0) return true
        return false
    }),
  
  remove: privateProcedure
    .input(z.object({id:z.string()}))
    .output(z.boolean())
    .mutation(async ({ ctx, input }) => {
        const val = await ctx.db.delete(Answers).where(eq(Answers.id, input.id)) 
        if(val.changes > 0) return true
        return false
    })
});
