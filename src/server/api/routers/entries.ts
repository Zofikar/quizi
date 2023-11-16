import { randomInt } from "crypto";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { z } from "zod";
import { createTRPCRouter, privateProcedure, quizProcedure, quizStartProcedure } from "~/server/api/trpc";
import { Answers, Entries, EntriesToQuestions, Questions } from "~/server/db/schema";

const questionSchema = z.object({
    id: z.string().min(1),
    question: z.string().min(1),
    MaxTimeMs: z.number().min(1),
    MaxPoints: z.number().min(1),
    answers: z.array(z.object({
        id: z.string().min(1),
        value: z.string().min(1),
    }))
})
const quizSchema = z.array(questionSchema)
type quizType = z.infer<typeof quizSchema>
type questionType = z.infer<typeof questionSchema>

export const entriesRouter = createTRPCRouter({

  start: quizStartProcedure
    .input(z.object({ name: z.string().min(1), lastname:z.string().min(1), class: z.string().min(1) }))
    .output(z.boolean())
    .mutation(async ({ ctx, input }) => {
        if(!ctx.quiz)
            return false;
        const check = await ctx.db.query.Entries.findFirst({where: and(eq(Entries.name, input.name),eq(Entries.lastname, input.lastname),eq(Entries.class, input.class), eq(Entries.quizID, ctx.quiz.id))})
        if(check)
            return false;
        const value = (await ctx.db.insert(Entries).values({...input, quizID:ctx.quiz.id}).returning())[0]
        if(!value)
            return false;
        cookies().set("entryID", value.id)
        cookies().set("quizID", ctx.quiz.id)
        return true;
    }),
  question: quizProcedure
    .output(z.union([z.boolean(), questionSchema]))
    .query(async ({ ctx }) => {
        if(!ctx.quiz)
            return false;
        if(!ctx.entry)
            return false;
        const rawQuestions = await ctx.db.select().from(Questions).where(eq(Questions.quizID, ctx.quiz.id))
        const questionsSet:Set<questionType> = new Set()
        await Promise.all(rawQuestions.map(async (value)=>{
            const check = await ctx.db.select().from(EntriesToQuestions).where(eq(EntriesToQuestions.entryID, ctx.entry!.id))
            console.log("🚀 ~ file: entries.ts:52 ~ awaitPromise.all ~ check:", check)
            if(check.some((val)=>val.questionID===value.id)) return;
            const answers = await ctx.db.select({id:Answers.id, value:Answers.value}).from(Answers).where(eq(Answers.questionID, value.id));
            const question:questionType = {
                id: value.id,
                question: value.question,
                MaxTimeMs: value.MaxTimeMs,
                MaxPoints: value.MaxPoints,
                answers,
            }
            if(questionsSet.has(question)) return
            questionsSet.add(question)
        }))
        const questions = [...questionsSet]
        if(questions.length === 0) return true;
        const questionIndex = randomInt(0, questions.length)
        const qst = questions.at(questionIndex) ?? questions.at(0)!
        return qst
    }),
  answer: quizProcedure
    .input(z.object({ answerID: z.string().min(1), timeMs:z.number().min(1), questionID: z.string().min(1) }))
    .output(z.boolean())
    .mutation(async ({ ctx, input }) => {
        if(!ctx.quiz)
            return false;
        if(!ctx.entry)
            return false;
        await ctx.db.insert(EntriesToQuestions).values({entryID:ctx.entry.id, questionID:input.questionID})
        const answers = (await ctx.db.select({id: Answers.id, correct: Answers.correct, maxPoints:Questions.MaxPoints, maxTimeMS:Questions.MaxTimeMs}).from(Questions).where(eq(Questions.id, input.questionID)).innerJoin(Answers, and(eq(Answers.questionID,input.questionID), eq(Answers.id, input.answerID))))[0]
        if(!answers || !answers.correct) return false
        await ctx.db.update(Entries).set({score: ctx.entry.score+Math.round(answers.maxPoints*(1-Math.pow(input.timeMs/answers.maxTimeMS,2)))}).where(eq(Entries.id, ctx.entry.id))
        return true
    }),
    outOfTime: quizProcedure
      .input(z.object({ questionID: z.string().min(1) }))
      .output(z.boolean())
      .mutation(async ({ ctx, input }) => {
          if(!ctx.quiz)
              return false;
          if(!ctx.entry)
              return false;
          await ctx.db.insert(EntriesToQuestions).values({entryID:ctx.entry.id, questionID:input.questionID})
          return true
      }),
  get: privateProcedure
    .input(z.string().min(1))
    .query(async({ctx, input}) => {
        return await ctx.db.select().from(Entries).where(eq(Entries.quizID, input))
    }),
  remove: privateProcedure
    .input(z.string().min(1))
    .mutation(async({ctx, input}) => {
        return await ctx.db.delete(Entries).where(eq(Entries.id, input))
    }),
});