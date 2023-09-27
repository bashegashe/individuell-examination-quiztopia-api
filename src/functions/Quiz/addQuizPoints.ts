import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { db } from '@/services/db.js'
import middy from "@middy/core";
import { createFormattedResponse } from '@/responses'
import { AddQuizPointsSchema, AddQuizPoints } from "@/types/Quiz";
import { zodValidator, checkParams, errorHandler, validateToken, checkQuizExists } from "@/middleware";

const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const body: AddQuizPoints = JSON.parse(event.body as string) as AddQuizPoints
  const quizId = event.pathParameters?.quizId as string

  const params = {
    TableName: process.env.TABLE_NAME as string,
    Item: {
      PK: `QUIZ#${quizId}#LEADERBOARD`,
      SK: `USER#${event.jwt?.userId}`,
      userId: event.jwt?.userId,
      score: body.score,
      GSI1PK: `QUIZ#${quizId}#LEADERBOARD`,
      GSI1SK: body.score.toString()
    }
  }

  await db.put(params).promise()

  return createFormattedResponse(200)
}

export const handler = middy(lambdaHandler)
  .use(validateToken())
  .use(checkParams('quizId'))
  .use(zodValidator(AddQuizPointsSchema))
  .use(checkQuizExists())
  .use(errorHandler())