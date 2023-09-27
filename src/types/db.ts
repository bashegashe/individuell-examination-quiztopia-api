import { z } from 'zod';

export interface PutParams<T> {
  TableName: string;
  Item: T;
  ConditionExpression?: string;
}

export interface ItemType<T> {
  Item: T | undefined;
}

export interface ItemsType<T> {
  Items: T[] | undefined;
}

export const BaseItemSchema = z.object({
  PK: z.string(),
  SK: z.string(),
  GSI1PK: z.string().optional(),
  GSI1SK: z.string().optional(),
});

export type BaseItem = z.infer<typeof BaseItemSchema>;