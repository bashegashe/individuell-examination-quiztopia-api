import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import middy from '@middy/core'

export const checkParams = (params: string | string[]): middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  const paramsArray = Array.isArray(params) ? params : [params];

  return {
    before: async (request) => {
      const requestParams = request.event.pathParameters;

      if (!requestParams) {
        request.event.statusCode = 400;
        throw new Error('Missing path parameters');
      }

      for (const param of paramsArray) {
        if (!requestParams[param]) {
          request.event.statusCode = 400;
          throw new Error(`Missing path parameter: ${param}`);
        }
      }
    }
  }
}