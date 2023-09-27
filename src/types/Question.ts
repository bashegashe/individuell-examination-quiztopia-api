import { z } from 'zod';
import { BaseItemSchema } from './db';

const BaseQuestionSchema = z.object({
  question: z.string().min(4),
  answer: z.string().min(4)
});

export const NewQuestionSchema = BaseQuestionSchema.extend({
  location: z.object({
    longitude: z.string(),
    latitude: z.string()
  })
});

export const NewQuestionItemSchema = BaseQuestionSchema.extend({
  ...NewQuestionSchema.shape,
});

export const QuestionSchema = BaseQuestionSchema.extend({
  longitude: z.string(),
  latitude: z.string(),
});

export const QuestionItemSchema = BaseItemSchema.extend({
  ...QuestionSchema.shape,
});

export type NewQuestion = z.infer<typeof NewQuestionSchema>;
export type NewQuestionItem = z.infer<typeof NewQuestionItemSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type QuestionItem = z.infer<typeof QuestionItemSchema>;