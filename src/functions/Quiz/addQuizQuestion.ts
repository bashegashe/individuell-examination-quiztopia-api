import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { db } from '@/services/db.js'
import middy from "@middy/core";
import { createFormattedResponse } from '@/responses'
import { zodValidator, errorHandler, validateToken, checkParams, checkQuizOwnership } from "@/middleware";
import { nanoid } from "nanoid";
import { PutParams } from "@/types/db";
import { NewQuestion, NewQuestionItemSchema, QuestionItem } from "@/types/Question";

const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const body: NewQuestion = JSON.parse(event.body as string) as NewQuestion
  const quizId = event.pathParameters?.quizId as string

  const params: PutParams<QuestionItem> = {
    TableName: process.env.TABLE_NAME as string,
    Item: {
      PK: `QUIZ#${quizId}`,
      SK: `QUESTION#${nanoid(10)}`,
      question: body.question,
      answer: body.answer,
      longitude: body.location.longitude,
      latitude: body.location.latitude,
      GSI1PK: `QUIZZES`,
      GSI1SK: `QUIZ#${quizId}`,
    },
    ConditionExpression: 'attribute_not_exists(SK)',
  }

  await db.put(params).promise()

  return createFormattedResponse(200)
}

export const handler = middy(lambdaHandler)
  .use(validateToken())
  .use(checkParams('quizId'))
  .use(zodValidator(NewQuestionItemSchema))
  .use(checkQuizOwnership())
  .use(errorHandler())