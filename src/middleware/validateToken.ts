import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import middy from '@middy/core'
import jwt from "jsonwebtoken";
import { JWT } from "@/global";

export const validateToken = (): middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  return {
    before: async (request) => {
      try {
        const token = request.event.headers.authorization?.replace('Bearer ', '');

        if (!token) {
          throw new Error();
        }

        request.event.jwt = jwt.verify(token, process.env.JWT_SECRET as string) as JWT;
      } catch(error) {
        if (error instanceof Error) {
          request.event.statusCode = 401;
          throw new Error('Unauthorized');
        }

        throw error;
      }
    },
  };
};
