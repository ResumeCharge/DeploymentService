import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import {
  GENERATOR_SERVICE_CLIENT_ID,
  GENERATOR_SERVICE_CLIENT_SECRET,
} from '../../deployments/deployments.constants';

@Injectable()
export class GeneratorServiceGuard extends AuthGuard('generator-service') {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const clientId = context.switchToHttp().getRequest().headers.client_id;
    const clientSecret = context.switchToHttp().getRequest()
      .headers.client_secret;
    if (clientId && clientSecret) {
      const generatorServiceClientId = this.configService.get<string>(
        GENERATOR_SERVICE_CLIENT_ID,
      );
      const generatorServiceClientSecret = this.configService.get<string>(
        GENERATOR_SERVICE_CLIENT_SECRET,
      );
      return (
        clientId === generatorServiceClientId &&
        clientSecret === generatorServiceClientSecret
      );
    } else {
      return false;
    }
  }
}
