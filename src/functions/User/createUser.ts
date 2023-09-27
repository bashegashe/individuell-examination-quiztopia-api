import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { db } from "@/services/db";
import middy from "@middy/core";
import { NewUserSchema, NewUser } from "@/types/User";
import { encryptPassword } from "@/utils/bcrypt";
import { createFormattedResponse } from "@/responses";
import { zodValidator, errorHandler } from "@/middleware";
import { PutParams } from "@/types/db";
import { UserItem } from "@/types/User";

const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const body: NewUser = JSON.parse(event.body as string) as NewUser

  const params: PutParams<UserItem> = {
    TableName: process.env.TABLE_NAME as string,
    Item: {
      PK: `USER#${body.username}`,
      SK: `USER#${body.username}`,
      userId: `${body.username}`,
      password: encryptPassword(body.password),
    },
    ConditionExpression: 'attribute_not_exists(PK)'
  }

  try {
    await db.put(params).promise()
  } catch {
    event.statusCode = 409;
    throw new Error('Username already exists')
  }

  return createFormattedResponse(200)
}

export const handler = middy(lambdaHandler)
  .use(zodValidator(NewUserSchema))
  .use(errorHandler())