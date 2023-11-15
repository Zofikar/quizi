import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure, quizProcedure } from "~/server/api/trpc";
import { Answers, Entries, EntriesToQuestions, Questions, Quizes } from '../../db/schema';

export const quizesRouter = createTRPCRouter({

  create: privateProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const val = (await ctx.db.insert(Quizes).values({
        name: input.name,
      }).returning())[0];
      if(val)
        cookies().set('quizID', val.id)
    }),

  get: privateProcedure
    .input(z.object({id:z.string().min(1)}))
    .query(async({ctx, input}) => {
      const quiz = await ctx.db.query.Quizes.findFirst({where: eq(Quizes.id, input.id)})
      if(!quiz) return;
      const rawQuestions = await ctx.db.select().from(Questions).where(eq(Questions.quizID, input.id))
      const question = await Promise.all(rawQuestions.map(async(value)=>{
        const answer = await ctx.db.select().from(Answers).where(eq(Answers.questionID, value.id))
        return {
          ...value,
          Answers: answer
        }
      }))
      return {
        ...quiz,
        Questions: question,
        Entries: await ctx.db.select().from(Entries).where(eq(Entries.quizID, input.id)),
      }
    }),

    getFromCookie: quizProcedure
      .output(z.union([z.undefined(), z.object({quizname:z.string().min(1), score: z.number(), name:z.string().min(1), lastName:z.string().min(1), class:z.string().min(1) })]))
      .query(({ctx}) => {
        if(!ctx.quiz || !ctx.entry) return;
        return {quizname:ctx.quiz.name, score:ctx.entry.score, name:ctx.entry.name, lastName: ctx.entry.lastname, class:ctx.entry.class}
      }),

    getByName: privateProcedure
      .input(z.object({name:z.string().min(1)}))
      .query(async({ctx, input}) => {
        const quiz = await ctx.db.query.Quizes.findFirst({where: eq(Quizes.name, input.name)})
        if(!quiz) return;
        const rawQuestions = await ctx.db.select().from(Questions).where(eq(Questions.quizID, quiz.id))
        const question = await Promise.all(rawQuestions.map(async(value)=>{
          const answer = await ctx.db.select().from(Answers).where(eq(Answers.questionID, value.id))
          return {
            ...value,
            Answers: answer
          }
        }))
        return {
          ...quiz,
          Questions: question,
          Entries: await ctx.db.select().from(Entries).where(eq(Entries.quizID, quiz.id)),
        }
      }),

  getAll: privateProcedure
    .query(({ctx}) => {
      return ctx.db.select().from(Quizes)
    }),

  remove: privateProcedure
    .input(z.object({id:z.string().min(1)}))
    .output(z.boolean())
    .mutation(async({ctx, input}) => {
      const questions = await ctx.db.select({id:Questions.id}).from(Questions).where(eq(Questions.quizID, input.id))
      let rs = 0
      await Promise.all(questions.map(async(value)=>{
        rs+=(await ctx.db.delete(Answers).where(eq(Answers.questionID, value.id))).changes
        rs+=(await ctx.db.delete(EntriesToQuestions).where(eq(EntriesToQuestions.questionID, value.id))).changes
      }))
      rs += (await ctx.db.delete(Entries).where(eq(Entries.quizID, input.id))).changes
      rs += (await ctx.db.delete(Questions).where(eq(Questions.quizID, input.id))).changes
      rs += (await ctx.db.delete(Quizes).where(eq(Quizes.id, input.id))).changes
      if(rs>0) return true
      return false
    }),

    checkIfExists: publicProcedure
    .input(z.object({name:z.string().min(1)}))
    .output(z.boolean())
    .query(async({ctx, input})=>{
      const rs = await ctx.db.select().from(Quizes).where(eq(Quizes.name, input.name))
      if(rs.length>0) {
        cookies().set('quizID', rs.at(0)!.id)
        return true
      }
      return false
    })
});
