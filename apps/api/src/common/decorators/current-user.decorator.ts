import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (property: string | undefined, context: ExecutionContext) => {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: Record<string, unknown> }>();

    const user = request.user;
    if (!user) {
      return undefined;
    }

    return property ? user[property] : user;
  },
);
