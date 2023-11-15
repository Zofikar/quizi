import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { Answers, Questions } from '../../db/schema';

export const questionsRouter = createTRPCRouter({
  create: privateProcedure
    .input(z.object({ MaxPoints: z.number().min(100).default(1000), MaxTimeMs:z.coerce.number().min(100), question: z.string().min(1) }))
    .output(z.boolean())
    .mutation(async ({ ctx, input }) => {
      const quizID = cookies().get('quizID')?.value
      if(!quizID) return false;
      await ctx.db.insert(Questions).values({
        MaxPoints: input.MaxPoints,
        MaxTimeMs: input.MaxTimeMs,
        quizID,
        question: input.question
      });
      return true;
    }),

  get: privateProcedure
    .input(z.object({id:z.string().min(1)}))
    .query(({ctx, input}) => {
      return ctx.db.select().from(Questions).where(eq(Questions.id, input.id)).innerJoin(Answers, eq(Answers.questionID, input.id))
    }),

  getAnswers: privateProcedure
    .input(z.object({id:z.string().min(1)}))
    .query(({ctx, input}) => {
      return ctx.db.select({id: Answers.id, correct: Answers.correct, value:Answers.value }).from(Answers).where(eq(Questions.id, input.id)).innerJoin(Answers, eq(Answers.questionID, input.id))
    }),
  
  update: privateProcedure
    .input(z.object({ MaxPoints: z.number().min(10).optional(), MaxTimeMs:z.coerce.number().min(100).optional(), question: z.string().min(1).optional(), questionID: z.string() }))
    .output(z.boolean())
    .mutation(async ({ ctx, input }) => {
      const quizID = cookies().get('quizID')
      if(!quizID) return false;
      const vals = await ctx.db.update(Questions).set({MaxPoints:input.MaxPoints, MaxTimeMs: input.MaxTimeMs, question:input.question}).where(eq(Questions.id, input.questionID));
      if(vals.changes > 0)
        return true;
      return false;
    }),
  
  remove: privateProcedure
    .input(z.object({id:z.string()}))
    .output(z.boolean())
    .mutation(async ({ ctx, input }) => {
        const quizID = cookies().get('quizID')
        if(!quizID) return false;
        let vals = (await ctx.db.delete(Questions).where(and(eq(Questions.id, input.id), eq(Questions.quizID, quizID.value)))).changes
        vals += (await ctx.db.delete(Answers).where(and(eq(Answers.questionID, input.id)))).changes
        if(vals > 0)
            return true;
        return false
    })
});
