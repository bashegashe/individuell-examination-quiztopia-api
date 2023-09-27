import { z } from 'zod';
import { BaseItemSchema } from './db';

export const NewUserSchema = z.object({
  username: z.string().min(4).max(32),
  password: z.string().min(8).max(128),
});

export const LoginUserSchema = NewUserSchema;

export const UserSchema = z.object({
  userId: z.string().min(4).max(32),
  password: z.string().min(8).max(128),
});

export const UserItemSchema = BaseItemSchema.extend({
  ...UserSchema.shape,
});

export type NewUser = z.infer<typeof NewUserSchema>;
export type User = z.infer<typeof UserSchema>;
export type UserItem = z.infer<typeof UserItemSchema>;
export type LoginUser = z.infer<typeof LoginUserSchema>;