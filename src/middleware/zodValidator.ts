import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";
import middy from '@middy/core'
import { createFormattedResponse } from "@/responses";

interface ZodErrorDetail {
  code: string;
  expected: string;
  received: string;
  path: string[];
  message: string;
}

function parseZodErrors(errorString: string): string[] {
  try {
    const errorArray: ZodErrorDetail[] = JSON.parse(errorString);
    return errorArray.map(errorDetail => {
      const { code, expected, received, path, message } = errorDetail;
      const fieldName = path.join('.') || 'Field';

      let res = `${fieldName}: ${message}`;
      if (expected) {
        res += ` (Expected ${expected}, received ${received})`;
      }

      return res;
    });
  } catch (e) {
    if (e instanceof Error) {
      return [`Failed to parse error: ${e.message}`];
    } else {
      return ['Failed to parse error'];
    }
  }
}

export const zodValidator = (schema: z.ZodObject<any, any>): middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  return {
    before: async (request) => {
      const { body } = request.event;

      if (!body) {
        request.event.statusCode = 400;
        throw new Error('Body is missing');
      }

      try {
        const jsonBody = JSON.parse(body);
        const parsedBody = schema.parse(jsonBody);
        request.event.body = JSON.stringify(parsedBody);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return createFormattedResponse(400, parseZodErrors(JSON.stringify(error.issues)));
        }

        throw error;
      }
    },
  };
};
