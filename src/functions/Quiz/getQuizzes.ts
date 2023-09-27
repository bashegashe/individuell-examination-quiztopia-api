import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { db } from '@/services/db.js'
import middy from "@middy/core";
import { createFormattedResponse } from '@/responses'
import { errorHandler } from "@/middleware/errorHandler";
import organizeQuizzes from "@/utils/organizeQuizzes";
import { QuizItem } from "@/types/Quiz";
import { QuestionItem } from "@/types/Question";
import { ItemsType } from "@/types/db";

const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const params = {
    TableName: process.env.TABLE_NAME as string,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :GSI1PK',
    ExpressionAttributeValues: {
      ':GSI1PK': 'QUIZZES'
    }
  }
  
  const { Items } = await db.query(params).promise() as ItemsType<QuizItem | QuestionItem>
  const organizedQuizzes = Items ? organizeQuizzes(Items) : [];

  return createFormattedResponse(200, { quizzes: organizedQuizzes })
}

export const handler = middy(lambdaHandler).use(errorHandler())