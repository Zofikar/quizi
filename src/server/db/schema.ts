// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations } from "drizzle-orm";
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { nanoid } from "nanoid";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */


export const Quizes = sqliteTable('Quizes',{
  id: text('id').$defaultFn(nanoid).primaryKey(),
  name: text('name').notNull().unique()
})

export const QuizesRelations = relations(Quizes, ({many})=>({
  Questions: many(Questions),
  Entries: many(Questions),
}))


export const Questions = sqliteTable('Questions',{
  id: text('id').$defaultFn(nanoid).primaryKey(),
  question: text('question').notNull(),
  quizID: text('quizID').notNull().references(()=>Quizes.id),
  MaxTimeMs: integer('maxtime').notNull(),
  MaxPoints: integer('maxpoinst').notNull()
})

export const QuestionsRelations = relations(Questions, ({one, many})=>({
  Quiz: one(Quizes,{
    fields: [Questions.quizID],
    references: [Quizes.id]
  }),
  Answers: many(Answers),
  AnsweredBy: many(EntriesToQuestions)
}))


export const Entries = sqliteTable('Entries',{
  id: text('id').$defaultFn(nanoid).primaryKey(),
  quizID: text('quizID').notNull().references(()=>Quizes.id),
  name: text('name').notNull(),
  lastname: text('lastname').notNull(),
  class: text('class').notNull(),
  score: real('score').default(0).notNull()
})

export const EntriesRelations = relations(Entries, ({one, many})=>({
  Quiz: one(Quizes,{
    fields: [Entries.quizID],
    references: [Quizes.id]
  }),
  QuestionsAnswered: many(EntriesToQuestions)
}))



export const Answers = sqliteTable('Answers',{
  id: text('id').$defaultFn(nanoid).primaryKey(),
  questionID: text('questionID').notNull().references(()=>Questions.id),
  value: text('value').notNull(),
  correct: integer('correct', {mode:'boolean'}).notNull().default(false),
})

export const AnswersRelations = relations(Answers, ({one})=>({
  Questions: one(Questions,{
    fields: [Answers.questionID],
    references: [Questions.id]
  }),
}))

export const EntriesToQuestions = sqliteTable('EntriesToQuestions', {
  entryID: text('ientryIDd').notNull(),
  questionID: text('questionID').notNull()
})

export const EntriesToQuestionsRealtions = relations(EntriesToQuestions, ({one})=>({
  Entries: one(Entries, {
    fields: [EntriesToQuestions.entryID],
    references: [Entries.id],
  }),
  Questions: one(Questions, {
    fields: [EntriesToQuestions.questionID],
    references: [Questions.id],
  }),
}))