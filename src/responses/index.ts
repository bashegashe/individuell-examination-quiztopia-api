import { APIGatewayProxyResult } from "aws-lambda";

export function sendResponse(
  statusCode: number, 
  response: any, 
  headers?: APIGatewayProxyResult['headers']
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    body: JSON.stringify(response),
  };
}

interface ResponseBody {
  success: boolean;
  error?: string;
  data?: any;
  message?: string;
}

export function createFormattedResponse(statusCode: number, response?: any): APIGatewayProxyResult {
  let body: ResponseBody = {
    success: statusCode < 300,
  };

  if (response === undefined) {
    return sendResponse(statusCode, body);
  }

  if (body.success) {
    if (typeof response === 'string') {
      body.message = response;
    } else {
      body.data = response;
    }
  } else {
    body.error = response;
  }

  return sendResponse(statusCode, body);
}