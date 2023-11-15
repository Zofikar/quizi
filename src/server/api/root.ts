import { quizesRouter } from "~/server/api/routers/quizes";
import { createTRPCRouter } from "~/server/api/trpc";
import { answersRouter } from "./routers/answers";
import { authRouter } from "./routers/auth";
import { entriesRouter } from "./routers/entries";
import { questionsRouter } from "./routers/questions";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  quizes: quizesRouter,
  enties: entriesRouter,
  questions: questionsRouter,
  auth: authRouter,
  answers: answersRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
