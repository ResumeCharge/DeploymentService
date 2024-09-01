import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { STANDALONE_USER_ID } from '../../app.constants';

export const Authorization = createParamDecorator(
  async (value: any, context: ExecutionContext): Promise<AuthUser> => {
    const userId = STANDALONE_USER_ID;
    return {
      userId,
    };
  },
);

export interface AuthUser {
  userId: string;
}
