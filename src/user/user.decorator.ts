import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator((_data, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  return request.user;
});
