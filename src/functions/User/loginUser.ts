import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { db } from "@/services/db";
import { createFormattedResponse } from "@/responses";
import middy from "@middy/core";
import { LoginUserSchema, LoginUser } from "@/types/User";
import jwt from "jsonwebtoken";
import { comparePassword } from "@/utils/bcrypt";
import { zodValidator, errorHandler } from "@/middleware";
import { UserItem } from "@/types/User";
import { ItemType } from "@/types/db";

const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const body: LoginUser = JSON.parse(event.body as string) as LoginUser

  const params = {
    TableName: process.env.TABLE_NAME as string,
    Key: {
      PK: `USER#${body.username}`,
      SK: `USER#${body.username}`,
    },
  }

  const { Item: user } = await db.get(params).promise() as ItemType<UserItem>

  if (!user) {
    event.statusCode = 401;
    throw new Error('Wrong username and/or password')
  }

  const isPasswordValid = comparePassword(body.password, user.password)

  if (!isPasswordValid) {
    event.statusCode = 401;
    throw new Error('Wrong username and/or password')
  }

  const jwtToken = jwt.sign(
    { userId: user.userId }, 
    process.env.JWT_SECRET as string, 
    { expiresIn: '1h' }
  );

  return createFormattedResponse(200, { token: jwtToken })
}

export const handler = middy(lambdaHandler)
  .use(zodValidator(LoginUserSchema))
  .use(errorHandler())