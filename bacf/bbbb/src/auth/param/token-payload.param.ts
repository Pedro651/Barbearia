import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { REQUEST_TOKEN_PAYLOAD_NAME } from "../common/auth.constants.js";

export const TokenPayloadParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const context = ctx.switchToHttp();
    
    // Passar <Record<string, any>> informa ao TS que a requisição aceita chaves do tipo string
    const request = context.getRequest<Record<string, any>>();

    return request[REQUEST_TOKEN_PAYLOAD_NAME];
  }
);