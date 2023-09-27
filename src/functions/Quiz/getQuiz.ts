import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { db } from '@/services/db.js'
import middy from "@middy/core";
import { createFormattedResponse } from '@/responses'
import organizeQuizzes from "@/utils/organizeQuizzes";
import { errorHandler, checkParams } from "@/middleware";
import { QuizItem } from "@/types/Quiz";
import { ItemsType } from "@/types/db";

const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const quizId = event.pathParameters?.quizId as string

  const params = {
    TableName: process.env.TABLE_NAME as string,
    KeyConditionExpression: 'PK = :PK',
    ExpressionAttributeValues: {
      ':PK': `QUIZ#${quizId}`
    }
  }

  const { Items } = await db.query(params).promise() as ItemsType<QuizItem>

  if (!Items || Items.length === 0) {
    event.statusCode = 404;
    throw new Error('Quiz not found')
  }

  const quizzes = Items ? organizeQuizzes(Items) : [];

  return createFormattedResponse(200, quizzes.length > 0 ? quizzes[0] : [])
}

export const handler = middy(lambdaHandler)
  .use(checkParams('quizId'))
  .use(errorHandler())