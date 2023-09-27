import { z } from 'zod';
import { NewQuestionSchema } from './Question';
import { BaseItemSchema } from './db';

export const QuizSchema = z.object({
  quizId: z.string(),
  quizName: z.string(),
  userId: z.string(),
  questions: z.array(NewQuestionSchema).optional(),
});

export const QuizItemSchema = BaseItemSchema.extend({
  ...QuizSchema.shape,
});

export const NewQuizSchema = z.object({
  name: z.string().min(4),
});

export const AddQuizPointsSchema = z.object({
  score: z.number(),
});

export const QuizLeaderboardSchema = z.object({
  userId: z.string(),
  score: z.number(),
});

export const LeaderboardItemSchema = BaseItemSchema.extend({
  ...QuizLeaderboardSchema.shape,
});

export type Quiz = z.infer<typeof QuizSchema>;
export type QuizItem = z.infer<typeof QuizItemSchema>;
export type NewQuiz = z.infer<typeof NewQuizSchema>;
export type AddQuizPoints = z.infer<typeof AddQuizPointsSchema>;
export type LeaderboardItem = z.infer<typeof LeaderboardItemSchema>;