import 'aws-lambda';

export interface JWT {
  iat: number;
  exp: number;
  userId: string;
}

declare module 'aws-lambda' {
  export interface APIGatewayProxyEventBase<TAuthorizerContext> {
    statusCode?: number
    jwt?: JWT;
  }
}