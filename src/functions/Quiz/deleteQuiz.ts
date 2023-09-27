import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { db } from '@/services/db.js'
import middy from "@middy/core";
import { createFormattedResponse } from '@/responses'
import { errorHandler, validateToken, checkParams, checkQuizOwnership } from "@/middleware";
import { QuestionItem } from "@/types/Question";
import { ItemsType } from "@/types/db";
import { LeaderboardItem } from "@/types/Quiz";

const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const quizId = event.pathParameters?.quizId as string

  const queryForQuestionsParams = {
    TableName: process.env.TABLE_NAME as string,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `QUIZ#${quizId}`,
      ':sk': 'QUESTION#',
    },
  };

  const { Items: questions } = await db.query(queryForQuestionsParams).promise() as ItemsType<QuestionItem>

  const queryForLeaderboardParams = {
    TableName: process.env.TABLE_NAME as string,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: {
      ':pk': `QUIZ#${quizId}#LEADERBOARD`,
    },
  };

  const { Items: leaderboardEntries } = await db.query(queryForLeaderboardParams).promise() as ItemsType<LeaderboardItem>

  const deleteRequests = [
    { DeleteRequest: { Key: { PK: `QUIZ#${quizId}`, SK: `QUIZ#${quizId}` } } },
    ...(questions || []).map((q) => ({
      DeleteRequest: { Key: { PK: q.PK, SK: q.SK } },
    })),
    ...(leaderboardEntries || []).map((l) => ({
      DeleteRequest: { Key: { PK: l.PK, SK: l.SK } },
    })),
  ];

  const batchDeleteParams = {
    RequestItems: {
      [process.env.TABLE_NAME as string]: deleteRequests,
    },
  };

  // Will result in error if trying to delete more than 25 items (max 24 questions + leaderboard entries possible).
  // This is a DynamoDB limit. Could be refactored to use chunking.
  await db.batchWrite(batchDeleteParams).promise();

  return createFormattedResponse(200)
}

export const handler = middy(lambdaHandler)
  .use(validateToken())
  .use(checkParams('quizId'))
  .use(checkQuizOwnership())
  .use(errorHandler())