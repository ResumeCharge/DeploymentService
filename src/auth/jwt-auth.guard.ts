import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  getTokenFromExecutionContext,
  isValidIdToken,
  isValidRequest,
} from './auth.helpers';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger: Logger;
  constructor() {
    super();
    this.logger = new Logger();
  }

  async canActivate(context: ExecutionContext) {
    if (!isValidRequest(context)) {
      return false;
    }
    const token = getTokenFromExecutionContext(context);
    return await isValidIdToken(token);
  }
}
