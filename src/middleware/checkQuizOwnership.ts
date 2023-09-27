import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import middy from '@middy/core'
import { db } from '@/services/db.js'
import { QuizItem } from "@/types/Quiz";
import { ItemType } from "@/types/db";

export const checkQuizOwnership = (): middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  return {
    before: async (request) => {
      const quizId = request.event.pathParameters?.quizId as string

      const params = {
        TableName: process.env.TABLE_NAME as string,
        Key: {
          PK: `QUIZ#${quizId}`,
          SK: `QUIZ#${quizId}`
        }
      }
    
      const { Item: quiz } = await db.get(params).promise() as ItemType<QuizItem>
    
      if (!quiz || quiz.userId !== request.event.jwt?.userId) {
        request.event.statusCode = 401;
        throw new Error('Unauthorized')
      }
    }
  }
}