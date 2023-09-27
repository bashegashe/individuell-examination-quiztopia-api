import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { db } from '@/services/db.js'
import middy from "@middy/core";
import { createFormattedResponse } from '@/responses'
import { NewQuizSchema, NewQuiz } from "@/types/Quiz";
import { nanoid } from "nanoid";
import { zodValidator, errorHandler, validateToken } from "@/middleware";
import { PutParams } from "@/types/db";
import { QuizItem } from "@/types/Quiz";

const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const body: NewQuiz = JSON.parse(event.body as string) as NewQuiz

  const quizId = nanoid(10)

  const params: PutParams<QuizItem> = {
    TableName: process.env.TABLE_NAME as string,
    Item: {
      PK: `QUIZ#${quizId}`,
      SK: `QUIZ#${quizId}`,
      quizName: body.name,
      userId: event.jwt?.userId as string,
      quizId: quizId,
      GSI1PK: `QUIZZES`,
      GSI1SK: `QUIZ#${quizId}`,
    },
    ConditionExpression: 'attribute_not_exists(PK)',
  }

  await db.put(params).promise()

  return createFormattedResponse(200, { quizId })
}

export const handler = middy(lambdaHandler)
  .use(validateToken())
  .use(zodValidator(NewQuizSchema))
  .use(errorHandler())