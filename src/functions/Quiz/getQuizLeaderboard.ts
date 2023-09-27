import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { db } from '@/services/db.js'
import middy from "@middy/core";
import { createFormattedResponse } from '@/responses'
import { errorHandler, checkParams } from "@/middleware";
import { LeaderboardItem } from "@/types/Quiz";
import { ItemsType } from "@/types/db";

const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const quizId = event.pathParameters?.quizId as string

  const params = {
    TableName: process.env.TABLE_NAME as string,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :GSI1PK',
    ExpressionAttributeValues: {
      ':GSI1PK': `QUIZ#${quizId}#LEADERBOARD`
    },
    ProjectionExpression: 'userId, score'
  }

  const { Items } = await db.query(params).promise() as ItemsType<LeaderboardItem>

  if (!Items || Items.length === 0) {
    event.statusCode = 404;
    throw new Error('Quiz not found or no leaderboard exists yet')
  }

  const sortedLeaderboard = Items.sort((a, b) => b.score - a.score);

  return createFormattedResponse(200, sortedLeaderboard)
}

export const handler = middy(lambdaHandler)
  .use(checkParams('quizId'))
  .use(errorHandler())