import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import middy from '@middy/core'
import { createFormattedResponse } from "@/responses";

export const errorHandler = (): middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  return {
    onError: async (request) => {
      return createFormattedResponse(
        request.event.statusCode || 500, 
        request.error?.message || 'Something went wrong'
      )
    },
  };
};
